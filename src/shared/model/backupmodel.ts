import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBackUpFile, useBackUpRecord } from '@shared/api/hooks';
import { useCallback } from 'react';
import { useMasterKeyModel } from './masterkeymodel';
import { useCurrentUserProfileContext } from '@app/context/profilecontext';
import { encryptWithKey, decryptWithKey } from '@shared/util/crypto-util';
import { IBackUpable, IFileBackUpable } from '@shared/db/entity/backupable';
import { BaseEntity } from 'typeorm';
import { useGetBackupedFile, useGetBackupedRecord } from '@shared/api/backuphook';

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
    const backupRecord = useCallback(async (record: any) => {
        const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
        const encryptedRecordData = encryptWithKey(JSON.stringify(record), masterKey);
        const backUpRecord = await backUpRecordAsync({ data: encryptedRecordData });
        return { transactionId: backUpRecord.txId };
    }, [backUpRecordAsync, currentUserContext, getMasterKeyForUser]);
    const backupRecordWithSettingsVerify = useCallback(async (record: any) => {
        const backupEnabled = await getBackupSettings();
        if (!backupEnabled) {
            return;
        }
        return await backupRecord(record);
    }, [backupRecord, getBackupSettings]);
    const backupFile = useCallback(async (record: IFileBackUpable, fileBase64Content: string) => {
        const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
        const encryptedFileData = encryptWithKey(fileBase64Content, masterKey);
        const backUpRecord = await backUpFileAsync({ base64: encryptedFileData, fileName: record.fileId, mimeType: record.mime });
        record.cidId = backUpRecord.txId;
        const backupData = await backupRecord(record);
        return { ...backupData, cidId: backUpRecord.txId };
    }, [backUpFileAsync, backupRecord, currentUserContext, getMasterKeyForUser]);
    const backupFileWithSettingsVerify = useCallback(async (record: IBackUpable & IFileBackUpable & BaseEntity, fileBase64Content: string) => {
        const backupEnabled = await getBackupSettings();
        if (!backupEnabled) {
            return;
        }
        return await backupFile(record, fileBase64Content);
    }, [backupFile, getBackupSettings]);
    const { mutateAsync: getBackupedRecordAsync } = useGetBackupedRecord();
    const restoreRecord = useCallback(
        async (txId: string) => {
            const backupData = await getBackupedRecordAsync(txId);
            if (!backupData) {
                throw new Error('Backup not found');
            }
            const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
            const decryptedJson = decryptWithKey(backupData.data!, masterKey);
            const parsed = JSON.parse(decryptedJson);
            return parsed;
        },
        [currentUserContext, getBackupedRecordAsync, getMasterKeyForUser]
    );
    const restoreClassRecord = useCallback(
        async <T extends IBackUpable & BaseEntity>(
            recordClass: { new(): T },
            txId: string
        ) => {
            const parsed = await restoreRecord(txId);
            const record: T = Object.assign(new recordClass(), parsed);
            return record;
        },
        [restoreRecord]
    );
    const { mutateAsync: getBackupedFileAsync } = useGetBackupedFile();
    const restoreFile = useCallback(
        async <T extends IBackUpable & BaseEntity>(
            recordClass: { new(): T },
            txId: string,
            cidId: string
        ) => {
            const backupData = await getBackupedFileAsync(cidId);
            if (!backupData) {
                throw new Error('Backup not found');
            }

            const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
            const fileBase64Content = decryptWithKey(backupData, masterKey);

            const restoredRecord = await restoreClassRecord(recordClass, txId);

            return { fileBase64Content, restoredRecord };
        },
        [currentUserContext, getBackupedFileAsync, getMasterKeyForUser, restoreClassRecord]
    );

    return { setBackupSettings, getBackupSettings, backupRecordWithSettingsVerify, backupRecord, backupFileWithSettingsVerify, backupFile, restoreClassRecord, restoreFile, restoreRecord };
};

export default useBackupModel;
