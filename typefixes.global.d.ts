import type { DataSource } from "typeorm";
import type { PrismLib } from "prism-react-renderer";

declare global {
  interface Window {
    localforage: LocalForage;
    AppDataSource?: DataSource;
    Prism?: PrismLib;
  }
}

declare global {
  var Prism: PrismLib;
}
