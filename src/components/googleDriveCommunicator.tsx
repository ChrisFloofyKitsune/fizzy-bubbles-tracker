import { useCallback, useEffect, useRef } from "react";
import { AutoSaveEvent, useAutoSaveSubscription } from "~/services";
import { useGoogleApi, useGoogleToken } from "./googleSessionProvider";
import localforage from "localforage";

const FILE_ID = 'google-drive-file-id';
const FILE_NAME = 'fizzyTracker.sqlite';

export type GoogleDriveCommunicatorProps = {
    autoSaveOn: boolean
}
export function GoogleDriveCommunicator({ autoSaveOn }: GoogleDriveCommunicatorProps) {
    const token = useGoogleToken();
    const gapi = useGoogleApi();
    const shouldAttemptAutoLoad = useRef(true);

    //Detect if we started with this turned on.
    useEffect(() => {
        localforage.getItem('google-drive-sync-enabled').then(value => {
            shouldAttemptAutoLoad.current = !!value;
        })
    },[])

    const onSave = useCallback(async ({ data }: AutoSaveEvent) => {
        if (!token || !gapi || !autoSaveOn) return;

        console.log("ATTEMPTING GOOGLE DRIVE AUTO SAVE HERE");
        gapi.client.setToken(token);
        
        const fileId = await localforage.getItem(FILE_ID)
        if (!fileId) {
            console.log("WOULD BE CREATING FILE");
        } else {
            console.log("WOULD BE UPDATING FILE");
        }
    }, [token, gapi, autoSaveOn]);
    useAutoSaveSubscription(onSave);

    useEffect(() => {
        if (!token || !shouldAttemptAutoLoad.current) return;
        shouldAttemptAutoLoad.current = false;

        console.log("WOULD ATTEMPT GOOGLE DRIVE AUTO LOAD HERE");

    }, [token]);

    return <></>
}