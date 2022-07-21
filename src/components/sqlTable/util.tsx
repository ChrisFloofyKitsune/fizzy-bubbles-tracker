import { EntityMetadata } from "typeorm";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

export enum PropType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    TIMESTAMP = 'TIMESTAMP',

    ID = 'ID',
    FOREIGN_KEY = 'FOREIGN_KEY',
    FOREIGN_KEY_LIST = 'FOREIGN_KEY_LIST',

    URL = 'URL',
    IMAGE_URL = 'IMAGE_URL',
    BBCODE = 'BBCODE',

    JSON = 'JSON',
    JSON_LIST = 'JSON_LIST',

    ENUM_GENDER = 'ENUM_GENDER',
    ENUM_CONTEST_STAT = 'ENUM_CONTEST_STAT',
    ENUM_CURRENCY_TYPE = 'ENUM_CURRENCY_TYPE',
    ENUM_MOVE_SOURCE_CATEGORY = 'ENUM_MOVE_SOURCE_CATEGORY',
}

export function classifyProp(entityMetadata: EntityMetadata, prop: string): PropType | null {
    const $ = PropType;

    let relation: RelationMetadata | undefined;
    if (relation = entityMetadata.findRelationWithPropertyPath(prop)) {
        return relation.isManyToOne ? $.FOREIGN_KEY : $.FOREIGN_KEY_LIST;
    }

    let propData = entityMetadata.findColumnWithPropertyName(prop)
    if (!propData) return null;
    switch (propData.propertyName) {
        case 'uuid':
        case 'id':
            return $.ID;
        case 'gender':
            return $.ENUM_GENDER;
        case 'stat':
            return $.ENUM_CONTEST_STAT;
        case 'currencyType':
            return $.ENUM_CURRENCY_TYPE;
        case 'category':
            return $.ENUM_MOVE_SOURCE_CATEGORY;
        case 'sourceURL':
        case 'evolutionStageOneSource':
        case 'evolutionStageTwoSource':
            return $.URL
        case 'imageLink':
            return $.IMAGE_URL;
        case 'template':
        case 'bbcodeProfile':
            return $.BBCODE;
        case 'timestamp':
            return $.TIMESTAMP;
        case 'levelUpMoves':
            return $.JSON_LIST;
        default:
            switch (propData.type) {
                case 'integer':
                    return $.INTEGER;
                case 'boolean':
                    return $.BOOLEAN;
                case 'simple-json':
                    return $.JSON
                default:
                    return $.TEXT;
            }
    }
}
