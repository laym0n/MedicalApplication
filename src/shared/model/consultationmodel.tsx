import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';
import {Consultation} from '@shared/db/entity/consultation';
import {generateKey} from '@shared/util/crypto-util';
import useBackupModel from './backupmodel';
import {useGetConsultation, useSearchProfiles} from '@shared/api/hooks';

const getConsultationServiceName = (consultation: Consultation) =>
  `consultationId ${consultation.id}`;

export const useConsultationModel = () => {
  const {
    backupRecordWithSettingsVerify,
    restoreClassRecord: restoreRecord,
    backupRecord,
  } = useBackupModel();
  const {mutateAsync: getConsultationAsync} = useGetConsultation();
  const {mutateAsync: searchProfilesAsync} = useSearchProfiles(() => {});
  const saveRestored = useCallback(async (consultation: Consultation) => {
    const optionalConsultation = await Consultation.findOneBy({
      id: consultation.id,
    });
    if (optionalConsultation) {
      return false;
    }
    const encryptionKey = generateKey();

    consultation.encryptionKey = encryptionKey;
    const newConsultation = await consultation.save();
    await Keychain.setGenericPassword(
      newConsultation.id.toString(),
      encryptionKey,
      {
        service: getConsultationServiceName(newConsultation),
      },
    );
    return true;
  }, []);
  const save = useCallback(
    async (consultation: Consultation) => {
      const consultationDto = await getConsultationAsync(
        consultation.consultationId,
      );
      consultation.userId = consultationDto.doctor!.id!;
      consultation.specialization =
        consultationDto.consultationSlot?.specialization?.name!;
      const searchProfilesResponse = await searchProfilesAsync({
        filters: {userIds: [consultationDto.doctor!.id!]},
      });
      consultation.doctorName = searchProfilesResponse.models![0].name;
      const encryptionKey = generateKey();

      consultation.encryptionKey = encryptionKey;
      const newConsultation = await consultation.save();

      await Keychain.setGenericPassword(
        newConsultation.id.toString(),
        encryptionKey,
        {
          service: getConsultationServiceName(newConsultation),
        },
      );
      consultation.decryptFields();
      backupRecordWithSettingsVerify(newConsultation);
    },
    [backupRecordWithSettingsVerify, getConsultationAsync, searchProfilesAsync],
  );
  const getById = useCallback(async (consultationId: string) => {
    const consultation = await Consultation.findOneBy({id: consultationId});
    if (consultation === null) {
      return undefined;
    }
    const credentials = await Keychain.getGenericPassword({
      service: getConsultationServiceName(consultation),
    });
    if (!credentials) {
      return;
    }
    const {password: encryptionKey} = credentials;
    consultation.encryptionKey = encryptionKey;
    consultation.decryptFields();
    return consultation;
  }, []);
  const getAllByIds = useCallback(
    async (consultationIds: string[]) => {
      let consultations: Consultation[] = [];
      for (const consultationId of consultationIds) {
        const consultation = await getById(consultationId);
        if (!consultation) {
          continue;
        }
        consultations.push(consultation);
      }
      return consultations;
    },
    [getById],
  );
  const deleteById = useCallback(async (consultationId: string) => {
    const consultation = await Consultation.findOneBy({id: consultationId});
    if (consultation === null) {
      return;
    }
    await Consultation.delete(consultationId);
    await Keychain.resetGenericPassword({
      service: getConsultationServiceName(consultation),
    });
  }, []);
  const backup = useCallback(
    async (consultationId: string) => {
      const consultation = await Consultation.findOneBy({id: consultationId});
      if (!consultation) {
        return;
      }
      const decryptedConsultation = await getById(consultationId);
      const backupData = await backupRecord(decryptedConsultation);
      decryptedConsultation!.transactionId = backupData.transactionId!;
      await decryptedConsultation!.save();
    },
    [backupRecord, getById],
  );
  const restore = useCallback(
    async (consultationId: string) => {
      const consultation = await Consultation.findOneBy({id: consultationId});
      if (!consultation || !consultation.transactionId) {
        return;
      }
      const restoredData = await restoreRecord(
        Consultation,
        consultation.transactionId,
      );
      consultation.data = restoredData.data;
      consultation.doctorName = restoredData.doctorName;
      consultation.consultationId = restoredData.consultationId;
      consultation.userId = restoredData.userId;
      consultation.specialization = restoredData.specialization;
      const encryptionKey = generateKey();
      consultation.encryptionKey = encryptionKey;
      const newConsultation = await consultation.save();
      await Keychain.setGenericPassword(
        newConsultation.id.toString(),
        encryptionKey,
        {
          service: getConsultationServiceName(newConsultation),
        },
      );
    },
    [restoreRecord],
  );
  return {
    save,
    saveRestored,
    getById,
    getAllByIds,
    deleteById,
    backup,
    restore,
  };
};
