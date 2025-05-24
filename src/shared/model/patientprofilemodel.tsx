import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';
import {PatientProfile} from '@shared/db/entity/patientprofile';

const getPatientProfileServiceName = (patientProfile: PatientProfile) =>
  `patientProfileId ${patientProfile.id}`;

export const usePatientProfileModel = () => {
  const save = useCallback(async (patientProfile: PatientProfile) => {
    const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
    patientProfile.encryptionKey = encryptionKey;

    const newPatientProfile = await patientProfile.save();

    await Keychain.setGenericPassword(
      newPatientProfile.id.toString(),
      encryptionKey,
      {
        service: getPatientProfileServiceName(newPatientProfile),
      },
    );
  }, []);

  const getById = useCallback(async (id: number) => {
    const patientProfile = await PatientProfile.findOneBy({id});
    if (!patientProfile) {
      return undefined;
    }
    const credentials = await Keychain.getGenericPassword({
      service: getPatientProfileServiceName(patientProfile),
    });
    if (!credentials) {
      return undefined;
    }
    const {password: encryptionKey} = credentials;
    patientProfile.encryptionKey = encryptionKey;
    patientProfile.decryptAllFields();
    return patientProfile;
  }, []);

  const deleteById = useCallback(async (id: number) => {
    const patientProfile = await PatientProfile.findOneBy({id});
    if (!patientProfile) {
      return;
    }
    await PatientProfile.delete(id);
    await Keychain.resetGenericPassword({
      service: getPatientProfileServiceName(patientProfile),
    });
  }, []);
  return {save, getById, deleteById};
};
