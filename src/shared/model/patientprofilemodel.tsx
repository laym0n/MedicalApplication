import {
  generateKey,
} from '@shared/util/crypto-util';
import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';
import {PatientProfile} from '@shared/db/entity/patientprofile';

const getPatientProfileServiceName = (patientProfile: PatientProfile) =>
  `patientProfileId ${patientProfile.id}`;

export const usePatientProfileModel = () => {
  const save = useCallback(async (patientProfile: PatientProfile) => {
    const encryptionKey = generateKey();
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

  const getById = useCallback(async (id: string) => {
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

    const getAllByIds = useCallback(async (patientProfileIds: string[]) => {
      let patientProfiles: PatientProfile[] = [];
      for (const patientProfileId of patientProfileIds) {
        const patientProfile = await getById(patientProfileId);
        if (!patientProfile) {
          continue;
        }
        patientProfiles.push(patientProfile);
      }
      return patientProfiles;
    }, [getById]);

  const deleteById = useCallback(async (id: string) => {
    const patientProfile = await PatientProfile.findOneBy({id});
    if (!patientProfile) {
      return;
    }
    await PatientProfile.delete(id);
    await Keychain.resetGenericPassword({
      service: getPatientProfileServiceName(patientProfile),
    });
  }, []);
  return {save, getById, getAllByIds, deleteById};
};
