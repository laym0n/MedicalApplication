import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUpdateConsultationPrescription } from '@shared/api/hooks';
import { Consultation } from '@shared/db/entity/consultation';
import { useCallback } from 'react';
import { useMasterKeyModel } from './masterkeymodel';
import { useCurrentUserProfileContext } from '@app/context/profilecontext';
import {encryptWithKey} from '@shared/util/crypto-util';

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
    const {getMasterKeyForUser} = useMasterKeyModel();
    const { mutateAsync: updateConsultationPrescriptionAsync } = useUpdateConsultationPrescription();
    const backupConsultation = useCallback(async (consultation: Consultation) => {
        const backupEnabled = await getBackupSettings();
        if (!backupEnabled) {
            return;
        }
        const masterKey = await getMasterKeyForUser(currentUserContext!.currentUserProfile!);
        const encryptedConsultationData = encryptWithKey(consultation.data, masterKey);
        const blockchainRecord = await updateConsultationPrescriptionAsync({ consultationId: consultation.consultationId, prescription: { prescription: encryptedConsultationData } });
        consultation.transactionId = blockchainRecord.txId!;
        await consultation.save();
    }, [currentUserContext, getBackupSettings, getMasterKeyForUser, updateConsultationPrescriptionAsync]);

    return { setBackupSettings, getBackupSettings, backupConsultation };
};

export default useBackupModel;
