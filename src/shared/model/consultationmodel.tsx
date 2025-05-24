import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';
import {Consultation} from '@shared/db/entity/consultation';
import {generateKey} from '@shared/util/crypto-util';

const getConsultationServiceName = (consultation: Consultation) => `consultationId ${consultation.id}`;

export const useConsultationModel = () => {
  const save = useCallback(async (consultation: Consultation) => {
    const encryptionKey = generateKey();

    consultation.encryptionKey = encryptionKey;
    const newConsultation = await consultation.save();

    await Keychain.setGenericPassword(newConsultation.id.toString(), encryptionKey, {
      service: getConsultationServiceName(newConsultation),
    });
  }, []);
  const getById = useCallback(async (consultationId: number) => {
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
  const deleteById = useCallback(async (consultationId: number) => {
    const consultation = await Consultation.findOneBy({id: consultationId});
    if (consultation === null) {
      return;
    }
    await Consultation.delete(consultationId);
    await Keychain.resetGenericPassword({
      service: getConsultationServiceName(consultation),
    });
  }, []);
  return {save, getById, deleteById};
};
