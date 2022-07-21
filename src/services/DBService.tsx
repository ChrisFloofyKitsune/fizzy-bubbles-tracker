import { DataSource } from 'typeorm';
import SqlJs from '/public/dist/sql-wasm';
import type { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { Subject, Subscription } from 'rxjs';
import { useForceUpdate } from '@mantine/hooks';

export type DataSourceOptions = Partial<Omit<SqljsConnectionOptions, 'type' | 'driver' | 'useLocalForage' | 'sqlJsConfig' | 'location' | 'autoSave' | 'autoSaveCallback'>>

export type AutoSaveEvent = { dataSource: DataSource, data: Uint8Array }
const AutoSaveSubject = new Subject<AutoSaveEvent>();

export function useAutoSaveCounter(): number {
    const saveCountRef = useRef(0);
    const [saveCount, setSaveCount] = useState(0);
    useEffect(() => {
        const sub = AutoSaveSubject.subscribe(() => setSaveCount(saveCountRef.current++));
        return () => {
            sub.unsubscribe();
        }
    }, [])
    return saveCount;
}

export function useAutoSaveSubscription(callback: (event: AutoSaveEvent) => void) {
    const [sub, setSub] = useState<Subscription>();
    useEffect(() => {
        if (sub) {
            sub.unsubscribe();
        }

        setSub(AutoSaveSubject.subscribe(callback));

        return () => sub?.unsubscribe();
    }, [callback]);
}

export class DBService {
    private constructor() { /* nope */ }

    public static readonly BaseOptions: SqljsConnectionOptions = {
        type: 'sqljs',
        driver: SqlJs,
        useLocalForage: true,
        sqlJsConfig: {
            locateFile: () => '/dist/sql-wasm.wasm'
        },
        location: 'database',
        autoSave: true,
        autoSaveCallback: async (data: Uint8Array) => {
            if (!DBService.dataSource) return;

            await DBService.dataSource.sqljsManager.saveDatabase();
            AutoSaveSubject.next({ dataSource: DBService.dataSource, data });
        }
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
        if (typeof window === 'undefined') {
            return;
        }

        console.log('🔧 Initializing Database... 🔧');
        window.localforage = (await import('localforage')).default;
        window.localforage.config({
            'name': 'FizzyTracker'
        })

        DBService.dataSource = new DataSource(Object.assign({}, DBService.BaseOptions, options))
        await DBService.dataSource.initialize();

        console.log('📝 Making sure Database is up-to-date... 📝')
        // TODO: Use migrations instead at some point.
        await DBService.dataSource.synchronize();
        // await DBService.dataSource.sqljsManager.saveDatabase();

        console.log('✅ Local Database Initialized ✅');

        // for purposes of exposing to web broswer console
        window.AppDataSource = DBService.dataSource;
    }

    public static async destroy() {
        if (!(DBService.dataSource?.isInitialized)) return;
        await DBService.dataSource.destroy();
        DBService.dataSource = undefined;
    }
}

Object.freeze(DBService.BaseOptions);

export const DataSourceContext = createContext<DataSource | undefined>(undefined);

export type DataSourceProviderProps = {
    options: DataSourceOptions,
    children: ReactNode
}

export const DataSourceProvider = ({ options, children }: DataSourceProviderProps) => {
    const startedInit = useRef(false);
    const [ds, setDs] = useState<DataSource | undefined>(undefined);

    useAsyncEffect(async isActive => {
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
            if (!isActive) return;
            setDs(DBService.dataSource);
        } catch (err: any) {
            console.error(err);
            throw new Error("Could not initialize the database 😦");
        }
    }, () => {
        if (startedInit.current && !DBService.dataSource) return;
        DBService.destroy();
        startedInit.current = false;
    }, [])

    return <DataSourceContext.Provider value={ds}>
        {children}
    </DataSourceContext.Provider>
}

export function useDataSource() {
    return useContext(DataSourceContext);
}