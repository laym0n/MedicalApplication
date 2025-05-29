import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';
import {Consultation} from '@shared/db/entity/consultation';
import {generateKey} from '@shared/util/crypto-util';
import useBackupModel from './backupmodel';
import { useGetConsultation, useSearchProfiles } from '@shared/api/hooks';

const getConsultationServiceName = (consultation: Consultation) =>
  `consultationId ${consultation.id}`;

export const useConsultationModel = () => {
  const {backupRecord} = useBackupModel();
  const {mutateAsync: getConsultationAsync} = useGetConsultation();
  const {mutateAsync: searchProfilesAsync} = useSearchProfiles(() => {});
  const save = useCallback(
    async (consultation: Consultation) => {
      const consultationDto = await getConsultationAsync(consultation.consultationId);
      consultation.userId = consultationDto.doctor!.id!;
      consultation.specialization = consultationDto.consultationSlot?.specialization?.name!;
      const searchProfilesResponse = await searchProfilesAsync({filters: {userIds: [consultationDto.doctor!.id!]}});
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
      backupRecord(newConsultation);
    },
    [backupRecord, getConsultationAsync, searchProfilesAsync],
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
  return {save, getById, getAllByIds, deleteById};
};
