import { EntityMetadata } from "typeorm";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

export enum PropType {
  TEXT = "TEXT",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",

  ID = "ID",
  FOREIGN_KEY = "FOREIGN_KEY",
  FOREIGN_KEY_LIST = "FOREIGN_KEY_LIST",

  URL = "URL",
  IMAGE_URL = "IMAGE_URL",
  BBCODE = "BBCODE",

  JSON = "JSON",
  JSON_LIST = "JSON_LIST",

  ENUM_GENDER = "ENUM_GENDER",
  ENUM_CONTEST_STAT = "ENUM_CONTEST_STAT",
  ENUM_CURRENCY_TYPE = "ENUM_CURRENCY_TYPE",
  ENUM_MOVE_SOURCE_CATEGORY = "ENUM_MOVE_SOURCE_CATEGORY",
}

export function classifyProp(
  entityMetadata: EntityMetadata,
  prop: string
): PropType | null {
  const P = PropType;

  let relation: RelationMetadata | undefined;
  if (!!(relation = entityMetadata.findRelationWithPropertyPath(prop) as any)) {
    return relation.isManyToOne ? P.FOREIGN_KEY : P.FOREIGN_KEY_LIST;
  }

  let propData = entityMetadata.findColumnWithPropertyName(prop);
  if (!propData) return null;
  switch (propData.propertyName) {
    case "uuid":
    case "id":
      return P.ID;
    case "gender":
      return P.ENUM_GENDER;
    case "stat":
      return P.ENUM_CONTEST_STAT;
    case "currencyType":
      return P.ENUM_CURRENCY_TYPE;
    case "category":
      return P.ENUM_MOVE_SOURCE_CATEGORY;
    case "sourceURL":
    case "evolutionStageOneSource":
    case "evolutionStageTwoSource":
      return P.URL;
    case "imageLink":
      return P.IMAGE_URL;
    case "template":
    case "bbcodeProfile":
      return P.BBCODE;
    case "date":
      return P.DATE;
    case "levelUpMoves":
      return P.JSON_LIST;
    default:
      switch (propData.type) {
        case "integer":
          return P.INTEGER;
        case "boolean":
          return P.BOOLEAN;
        case "simple-json":
          return P.JSON;
        default:
          return P.TEXT;
      }
  }
}
