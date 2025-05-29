import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBackUpFile, useBackUpRecord } from '@shared/api/hooks';
import { useCallback } from 'react';
import { useMasterKeyModel } from './masterkeymodel';
import { useCurrentUserProfileContext } from '@app/context/profilecontext';
import { encryptWithKey } from '@shared/util/crypto-util';
import { IBackUpable, IFileBackUpable } from '@shared/db/entity/backupable';
import { BaseEntity } from 'typeorm';

const BACKUP_KEY = 'backupEnabled';

const useBackupModel = () => {
    const setBackupSettings = useCallback(async (backupEnabled: boolean) => {
        await AsyncStorage.setItem(BACKUP_KEY, backupEnabled.toString());
    }, []);
    const getBackupSettings = useCallback(async () => {
        const backupEnabledValue = await AsyncStorage.getItem(BACKUP_KEY);
        return backupEnabledValue === 'true';
    }, []);
    const currentUserContext = useCurrentUserProfileContext();
    const { getMasterKeyForUser } = useMasterKeyModel();
    const { mutateAsync: backUpRecordAsync } = useBackUpRecord();
    const { mutateAsync: backUpFileAsync } = useBackUpFile();
    const backupRecord = useCallback(async (record: IBackUpable & BaseEntity) => {
        const backupEnabled = await getBackupSettings();
        if (!backupEnabled) {
            return;
        }
        const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
        const encryptedRecordData = encryptWithKey(JSON.stringify(record), masterKey);
        const backUpRecord = await backUpRecordAsync({ data: encryptedRecordData });
        record.transactionId = backUpRecord.txId!;
        await record.save();
    }, [currentUserContext, getBackupSettings, getMasterKeyForUser, backUpRecordAsync]);
    const backupFile = useCallback(async (record: IBackUpable & IFileBackUpable & BaseEntity, fileBase64Content: string) => {
        const backupEnabled = await getBackupSettings();
        if (!backupEnabled) {
            return;
        }
        const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
        const encryptedFileData = encryptWithKey(fileBase64Content, masterKey);
        const backUpRecord = await backUpFileAsync({ base64: encryptedFileData, fileName: record.fileId, mimeType: record.mime });
        record.cidId = backUpRecord.txId!;
        await record.save();
        await backupRecord(record);
    }, [backUpFileAsync, backupRecord, currentUserContext, getBackupSettings, getMasterKeyForUser]);

    return { setBackupSettings, getBackupSettings, backupRecord, backupFile };
};

export default useBackupModel;
