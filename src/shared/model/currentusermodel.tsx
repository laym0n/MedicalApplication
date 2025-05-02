import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import {ProfileModel} from '@shared/api/types';
import {useCallback} from 'react';

export const useCurrentUserModel = () => {
  const currentUserProfileContext = useCurrentUserProfileContext();
  const handleSetCurrentUser = useCallback(
    (currentUser: ProfileModel) => {
      currentUserProfileContext!.setCurrentUserProfile(currentUser);
      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
      currentUserProfileContext!.setMasterKey(encryptionKey);
    },
    [currentUserProfileContext],
  );
  const handleLogOut = useCallback(() => {
    currentUserProfileContext!.setCurrentUserProfile(null);
    currentUserProfileContext!.setMasterKey(null);
  }, [currentUserProfileContext]);
  return {handleSetCurrentUser, handleLogOut};
};
