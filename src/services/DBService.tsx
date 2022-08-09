import { DataSource, EntityTarget, Repository, ObjectLiteral } from "typeorm";
import SqlJs from "/public/dist/sql-wasm";
import type { SqljsConnectionOptions } from "typeorm/driver/sqljs/SqljsConnectionOptions";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAsyncEffect } from "use-async-effect";
import { Subject, Subscription } from "rxjs";
import { WAIT_FOREVER, waitUntil } from "async-wait-until";
import { debounce } from "~/util";
import { SettingEnum } from "~/settingEnum";
import { Setting } from "~/orm/entities";

export type DataSourceOptions = Partial<
  Omit<
    SqljsConnectionOptions,
    | "type"
    | "driver"
    | "useLocalForage"
    | "sqlJsConfig"
    | "location"
    | "autoSave"
    | "autoSaveCallback"
  >
>;

export type AutoSaveEvent = { dataSource: DataSource; data: Uint8Array };
const AutoSaveSubject = new Subject<AutoSaveEvent>();

export function useAutoSaveCounter(): number {
  const saveCountRef = useRef(0);
  const [saveCount, setSaveCount] = useState(0);
  useEffect(() => {
    const sub = AutoSaveSubject.subscribe(() =>
      setSaveCount(saveCountRef.current++)
    );
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return saveCount;
}

export function useAutoSaveSubscription(
  callback: (event: AutoSaveEvent) => void
) {
  const sub = useRef<Subscription>();
  useEffect(() => {
    if (sub.current) {
      sub.current.unsubscribe();
    }

    sub.current = AutoSaveSubject.subscribe(callback);

    return () => sub.current?.unsubscribe();
  }, [callback]);
}

export class DBService {
  private constructor() {
    /* nope */
  }

  public static readonly BaseOptions: SqljsConnectionOptions = {
    type: "sqljs",
    driver: SqlJs,
    useLocalForage: true,
    sqlJsConfig: {
      locateFile: () => "/dist/sql-wasm.wasm",
    },
    location: "database",
    autoSave: true,
    autoSaveCallback: async (data: Uint8Array) => {
      if (!DBService.dataSource) return;

      await DBService.dataSource.sqljsManager.saveDatabase();
      AutoSaveSubject.next({ dataSource: DBService.dataSource, data });
    },
  };

  private static _dataSource?: DataSource;
  public static get dataSource() {
    return DBService._dataSource;
  }
  private static set dataSource(value) {
    DBService._dataSource = value;
  }

  public static async initialize(options: DataSourceOptions) {
    // CLIENT SIDE ONLY
    if (typeof window === "undefined") {
      return;
    }

    console.log("🔧 Initializing Database... 🔧");
    window.localforage = (await import("localforage")).default;
    window.localforage.config({
      name: "FizzyTracker",
    });

    DBService.dataSource = new DataSource(
      Object.assign<
        any,
        SqljsConnectionOptions,
        Partial<SqljsConnectionOptions>
      >({}, DBService.BaseOptions, options)
    );
    await DBService.dataSource.initialize();

    console.log("📝 Making sure Database is up-to-date... 📝");
    // TODO: Use migrations instead at some point.
    await DBService.dataSource.synchronize();

    await DBService.dataSource.runMigrations();

    console.log("✅ Local Database Initialized ✅");

    // for purposes of exposing to web browser console
    window.AppDataSource = DBService.dataSource;
  }

  public static async destroy() {
    if (!DBService.dataSource?.isInitialized) return;
    await DBService.dataSource.destroy();
    DBService.dataSource = undefined;
  }
}

Object.freeze(DBService.BaseOptions);

export const DataSourceContext = createContext<DataSource | undefined>(
  undefined
);

export type DataSourceProviderProps = {
  options: DataSourceOptions;
  children: ReactNode;
};

export const DataSourceProvider = ({
  options,
  children,
}: DataSourceProviderProps) => {
  const startedInit = useRef(false);
  const [ds, setDs] = useState<DataSource | undefined>(undefined);

  useAsyncEffect(
    async (isActive) => {
      if (DBService.dataSource?.isInitialized) {
        setDs(DBService.dataSource);
        return;
      }

      if (startedInit.current) {
        return;
      }
      startedInit.current = true;

      try {
        await DBService.initialize(options);
        if (!isActive) {
          await DBService.destroy();
        }
        setDs(DBService.dataSource);
      } catch (err: any) {
        console.error("Could not initialize the database 😦", err);
        throw err;
      }
    },
    async () => {
      if (startedInit.current && !DBService.dataSource) return;
      await DBService.destroy();
      startedInit.current = false;
    },
    []
  );

  return (
    <DataSourceContext.Provider value={ds}>
      {children}
    </DataSourceContext.Provider>
  );
};

export function useDataSource() {
  return useContext(DataSourceContext);
}

export function useRepository<T>(entityTarget: EntityTarget<T>) {
  const ds = useDataSource();
  const repo = useMemo(() => {
    if (!ds) return null;
    return ds.getRepository(entityTarget);
  }, [entityTarget, ds]);

  useDebugValue(
    repo,
    (repo) => `Sqljs Repository: ${repo?.metadata.name ?? "NOT LOADED"}`
  );

  return repo;
}

export function useRepositories(
  ...entityTargets: EntityTarget<any>[]
): (Repository<any> | undefined)[] {
  const ds = useDataSource();
  const repos = useMemo(() => {
    if (!ds) return [];
    return entityTargets.map((t) => ds.getRepository(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...entityTargets, ds]);

  useDebugValue(
    repos,
    (repos) =>
      `Sqljs Repositories: ${
        repos.length > 0 ? repos.map((r) => r.metadata.name) : "NOT LOADED"
      }`
  );

  return repos;
}

export async function waitForTransactions(
  repo: Repository<any>,
  timeout: number = WAIT_FOREVER
) {
  await waitUntil(() => !repo.queryRunner?.isTransactionActive, {
    timeout,
  });
}

export function useDebouncedEntitySave<T extends ObjectLiteral>(
  targetEntity: T | null,
  entityRepo: Repository<T> | null,
  options?: {
    beforeSavedToRepo?: (updatedEntity: T) => void;
    afterSavedToRepo?: (entityAfterSave: T) => void;
    debounceTime?: number;
  }
) {
  const opts: typeof options = useMemo(
    () => Object.assign({ debounceTime: 300 }, options),
    [options]
  );

  const pendingChanges = useRef<Partial<T>>({});
  const blankEntity = useMemo(() => entityRepo?.create() ?? null, [entityRepo]);
  useEffect(() => {
    pendingChanges.current = {};
  }, [targetEntity, entityRepo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveChanges = useCallback(
    debounce((changes: Partial<T>) => {
      if (!entityRepo) return;

      pendingChanges.current = {};
      const updatedEntity = Object.assign(
        Object.create(blankEntity),
        targetEntity,
        changes
      );

      opts.beforeSavedToRepo?.(updatedEntity);

      waitForTransactions(entityRepo)
        .then(() => entityRepo.save(updatedEntity))
        .then((entityAfterSave) => opts.afterSavedToRepo?.(entityAfterSave));
    }, opts.debounceTime),
    [
      targetEntity,
      entityRepo,
      options?.beforeSavedToRepo,
      options?.afterSavedToRepo,
    ]
  );

  useDebugValue("useDebounced_Entity_Save");

  return useCallback(
    function submitChanges(updatePayload: Partial<T>) {
      const changes = Object.assign(pendingChanges.current, updatePayload);
      debouncedSaveChanges(changes);
    },
    [debouncedSaveChanges]
  );
}

export function useDebouncedListSave<T extends ObjectLiteral>(
  entityRepo: Repository<T> | null,
  options?: {
    beforeSavedToRepo?: (updatedEntities: T[]) => void;
    afterSavedToRepo?: (entitiesAfterSave: T[]) => void;
    debounceTime?: number;
  }
) {
  const opts: typeof options = useMemo(
    () => Object.assign({ debounceTime: 300 }, options),
    [options]
  );

  const getIdAsString = useCallback(
    (entity: T): string => {
      if (!entityRepo) return "";
      let id = entityRepo.getId(entity);
      if (typeof id === "object") {
        return Array.from(Object.values(id)).join("_");
      }
      return String(id);
    },
    [entityRepo]
  );

  const pendingChanges = useRef<Record<string, T>>({});
  const blankEntity = useMemo(() => entityRepo?.create() ?? null, [entityRepo]);
  useEffect(() => {
    pendingChanges.current = {};
  }, [entityRepo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveChanges = useCallback(
    debounce((changes: T[]) => {
      if (!entityRepo) return;
      pendingChanges.current = {};
      opts.beforeSavedToRepo?.(changes);
      waitForTransactions(entityRepo)
        .then(() => entityRepo.save(changes))
        .then((entitiesAfterSave) =>
          opts.afterSavedToRepo?.(entitiesAfterSave)
        );
    }, opts.debounceTime),
    [entityRepo, options?.beforeSavedToRepo, options?.afterSavedToRepo]
  );

  useDebugValue("useDebounced_List_Save");

  return useCallback(
    function submitChanges(entity: T, updatePayload: Partial<T>) {
      const id = getIdAsString(entity);
      const current = pendingChanges.current[id] ?? Object.create(blankEntity);
      pendingChanges.current[id] = Object.assign(
        current,
        entity,
        updatePayload
      );
      debouncedSaveChanges(Object.values(pendingChanges.current));
    },
    [blankEntity, debouncedSaveChanges, getIdAsString]
  );
}

export function useSettingValue(setting: SettingEnum) {
  const settingRepo = useRepository(Setting);
  const [value, setValue] = useState<any>(undefined);
  useAsyncEffect(async () => {
    if (!settingRepo) return null;
    setValue((await settingRepo.findOneBy({ id: setting }))?.value);
  }, [settingRepo]);
  return value;
}
