import {
  generateKey,
} from '@shared/util/crypto-util';
import {ProfileModel} from '@shared/api/types';
import {useCallback} from 'react';
import * as Keychain from 'react-native-keychain';

const masterKeyBaseServiceName = 'masterKey';

function getMasterKeyServiceName(currentUser: ProfileModel) {
  return masterKeyBaseServiceName + currentUser.user?.id;
}

export const useMasterKeyModel = () => {
  const getMasterKeyForUser = useCallback(
    async (currentUser: ProfileModel) => {
      const savedMasterKey = await Keychain.getGenericPassword({
        service: getMasterKeyServiceName(currentUser),
      });
      let encryptionKey: string;
      if (!savedMasterKey) {
        encryptionKey = generateKey();
        await Keychain.setGenericPassword(
          getMasterKeyServiceName(currentUser),
          encryptionKey,
          {
            service: getMasterKeyServiceName(currentUser),
          },
        );
      } else {
        encryptionKey = savedMasterKey.password;
      }
      return encryptionKey;
    },
    [],
  );
  return {getMasterKeyForUser};
};
