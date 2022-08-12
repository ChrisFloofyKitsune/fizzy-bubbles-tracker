import { MigrationInterface, QueryRunner, In } from "typeorm";
import { Setting } from "~/orm/entities";
import { SettingEnum } from "~/settingEnum";

const settings: Setting[] = [
  {
    id: SettingEnum.ShowDataManagementPage,
    name: "Show Data Management Page",
    group: "Debug",
    description:
      "Show the Data page, where you can browse the data in the database and do limited edits or bulk deleting of data.",
    defaultValue: false,
    type: "boolean",
  },
  {
    id: SettingEnum.GDriveAutoSave,
    name: "Auto Save to Google Drive",
    group: "Google Drive Syncing",
    description:
      "Automatically back up the data here to your Google Drive (if connected).",
    defaultValue: true,
    type: "boolean",
  },
  {
    id: SettingEnum.GDriveAutoSaveCount,
    name: "Daily Auto Save Count",
    group: "Google Drive Syncing",
    description:
      "How many auto saves to keep on Google Drive.\n" +
      "A new save file will be made each new UTC day up the set limit where any older than that will be deleted.\n" +
      "It will try NOT to overwrite files made by other devices than the current one, in which case a new auto save will be made.\n" +
      "(The save files are pretty small.)",
    defaultValue: 7,
    type: "number",
  },
  {
    id: SettingEnum.GDriveAskToLoadNewer,
    name: "Ask to load newer data on startup when connected to Google Drive",
    group: "Google Drive Syncing",
    description:
      "If newer data than what is on your local machine is found in your Google Drive,\n" +
      "the web app will show a popup asking you if you want to load the new data on startup or refresh.\n" +
      '(Ignored if "Auto Load from Google Drive" is turned on.)',
    defaultValue: true,
    type: "boolean",
  },
  {
    id: SettingEnum.GDriveAutoLoad,
    name: "Auto Load from Google Drive",
    group: "Google Drive Syncing",
    description:
      "Automatically load the latest Google Drive auto save upon starting or refreshing the web app.\n" +
      "This auto loading Will replace any stored local data in your browser with the loaded auto save.",
    defaultValue: false,
    type: "boolean",
  },
];

export class seedSettings1660010769436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(Setting).save(settings);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const idsToRemove = settings.map((s) => s.id);
    await queryRunner.manager
      .getRepository(Setting)
      .delete({ id: In(idsToRemove) });
  }
}
