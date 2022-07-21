export type googleDriveFileMetadata =
    Partial<{
        "id": string;
        "name": string;
        "mimeType": string;
        "description": string;
        "starred": boolean;
        "trashed": boolean;
        "explicitlyTrashed": boolean;
        "trashingUser": {
            "kind": "drive#user";
            "displayName": string;
            "photoLink": string;
            "me": boolean;
            "permissionId": string;
            "emailAddress": string;
        };
        "trashedTime": Date;
        "parents": [
            string
        ];
        "properties": Record<string, string>;
        "appProperties": Record<string, string>;
        "spaces": [
            string
        ];
        "version": number;
        "webContentLink": string;
        "webViewLink": string;
        "iconLink": string;
        "hasThumbnail": boolean;
        "thumbnailLink": string;
        "thumbnailVersion": number;
        "viewedByMe": boolean;
        "viewedByMeTime": Date;
        "createdTime": Date;
        "modifiedTime": Date;
        "modifiedByMeTime": Date;
        "modifiedByMe": boolean;
        "sharedWithMeTime": Date;
        "sharingUser": {
            "kind": "drive#user";
            "displayName": string;
            "photoLink": string;
            "me": boolean;
            "permissionId": string;
            "emailAddress": string;
        };
        "owners": [
            {
                "kind": "drive#user";
                "displayName": string;
                "photoLink": string;
                "me": boolean;
                "permissionId": string;
                "emailAddress": string;
            }
        ];
        "teamDriveId": string;
        "driveId": string;
        "lastModifyingUser": {
            "kind": "drive#user";
            "displayName": string;
            "photoLink": string;
            "me": boolean;
            "permissionId": string;
            "emailAddress": string;
        };
        "shared": boolean;
        "ownedByMe": boolean;
        "capabilities": {
            "canAcceptOwnership": boolean;
            "canAddChildren": boolean;
            "canAddFolderFromAnotherDrive": boolean;
            "canAddMyDriveParent": boolean;
            "canChangeCopyRequiresWriterPermission": boolean;
            "canChangeSecurityUpdateEnabled": boolean;
            "canChangeViewersCanCopyContent": boolean;
            "canComment": boolean;
            "canCopy": boolean;
            "canDelete": boolean;
            "canDeleteChildren": boolean;
            "canDownload": boolean;
            "canEdit": boolean;
            "canListChildren": boolean;
            "canModifyContent": boolean;
            "canModifyContentRestriction": boolean;
            "canMoveChildrenOutOfTeamDrive": boolean;
            "canMoveChildrenOutOfDrive": boolean;
            "canMoveChildrenWithinTeamDrive": boolean;
            "canMoveChildrenWithinDrive": boolean;
            "canMoveItemIntoTeamDrive": boolean;
            "canMoveItemOutOfTeamDrive": boolean;
            "canMoveItemOutOfDrive": boolean;
            "canMoveItemWithinTeamDrive": boolean;
            "canMoveItemWithinDrive": boolean;
            "canMoveTeamDriveItem": boolean;
            "canReadRevisions": boolean;
            "canReadTeamDrive": boolean;
            "canReadDrive": boolean;
            "canRemoveChildren": boolean;
            "canRemoveMyDriveParent": boolean;
            "canRename": boolean;
            "canShare": boolean;
            "canTrash": boolean;
            "canTrashChildren": boolean;
            "canUntrash": boolean;
        };
        "viewersCanCopyContent": boolean;
        "copyRequiresWriterPermission": boolean;
        "writersCanShare": boolean;
        "permissions": any[];
        "permissionIds": string[];
        "hasAugmentedPermissions": boolean;
        "folderColorRgb": string;
        "originalFilename": string;
        "fullFileExtension": string;
        "fileExtension": string;
        "md5Checksum": string;
        "size": number;
        "quotaBytesUsed": number;
        "headRevisionId": string;
        "contentHints": {
            "thumbnail": {
                "image": Uint8Array;
                "mimeType": string;
            };
            "indexableText": string;
        };
        "imageMediaMetadata": {
            "width": number;
            "height": number;
            "rotation": number;
            "location": {
                "latitude": number;
                "longitude": number;
                "altitude": number;
            };
            "time": string;
            "cameraMake": string;
            "cameraModel": string;
            "exposureTime": number;
            "aperture": number;
            "flashUsed": boolean;
            "focalLength": number;
            "isoSpeed": number;
            "meteringMode": string;
            "sensor": string;
            "exposureMode": string;
            "colorSpace": string;
            "whiteBalance": string;
            "exposureBias": number;
            "maxApertureValue": number;
            "subjectDistance": number;
            "lens": string;
        };
        "videoMediaMetadata": {
            "width": number;
            "height": number;
            "durationMillis": number;
        };
        "isAppAuthorized": boolean;
        "exportLinks": Record<string, string>;
        "shortcutDetails": {
            "targetId": string;
            "targetMimeType": string;
            "targetResourceKey": string;
        };
        "contentRestrictions": {
            "readOnly": boolean;
            "reason": string;
            "restrictingUser": {
                "kind": "drive#user";
                "displayName": string;
                "photoLink": string;
                "me": boolean;
                "permissionId": string;
                "emailAddress": string;
            };
            "restrictionTime": Date;
            "type": string;
        }[];
        "resourceKey": string;
        "linkShareMetadata": {
            "securityUpdateEligible": boolean;
            "securityUpdateEnabled": boolean;
        };
    }>;
