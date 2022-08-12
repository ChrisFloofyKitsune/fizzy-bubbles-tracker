import { Column, Entity, PrimaryColumn } from "typeorm";
import { SettingEnum } from "~/settingEnum";

@Entity()
export class Setting {
  @PrimaryColumn("text")
  id: SettingEnum;

  @Column()
  name: string;

  @Column()
  group: string;

  @Column()
  description: string;

  @Column()
  type: "number" | "boolean" | "string" | "enum";

  @Column("simple-json", { nullable: true })
  value?: number | boolean | string;

  @Column("simple-json")
  defaultValue: number | boolean | string;

  @Column("simple-array", { nullable: true })
  enumValues?: string[];
}
