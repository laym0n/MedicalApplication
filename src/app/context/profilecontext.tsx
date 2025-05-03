import {useGetProfile} from '@shared/api/hooks';
import {ProfileModel} from '@shared/api/types';
import {useMasterKeyModel} from '@shared/model/masterkeymodel';
import {createContext, useCallback, useContext, useEffect, useState} from 'react';

interface CurrentUserProfileContextProps {
  currentUserProfile: ProfileModel | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<ProfileModel | null>
  >;
  masterKey: string | null;
  setMasterKey: React.Dispatch<React.SetStateAction<string | null>>;
  handleLogOut: () => void;
  handleSignIn: (newCurrentUser: ProfileModel) => void;
}
const CurrentUserProfileContext =
  createContext<CurrentUserProfileContextProps | null>(null);

export const useCurrentUserProfileContext = () =>
  useContext(CurrentUserProfileContext);

export const CurrentUserProfileContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [currentUserProfile, setCurrentUserProfile] =
    useState<ProfileModel | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);

  const {getMasterKeyForUser} = useMasterKeyModel();
  const handleSignIn = useCallback(async (newCurrentUser: ProfileModel) => {
    setCurrentUserProfile(newCurrentUser);
    const newMasterKey = await getMasterKeyForUser(newCurrentUser);
    setMasterKey(newMasterKey);
  }, [getMasterKeyForUser]);
  const handleLogOut = useCallback(() => {
    setCurrentUserProfile(null);
    setMasterKey(null);
  }, []);

  const {mutateAsync: getProfileAsync} = useGetProfile(handleSignIn);
  useEffect(() => {
    getProfileAsync();
  }, [getProfileAsync]);

  return (
    <CurrentUserProfileContext.Provider
      value={{
        currentUserProfile,
        setCurrentUserProfile,
        masterKey,
        setMasterKey,
        handleLogOut,
        handleSignIn,
      }}>
      {children}
    </CurrentUserProfileContext.Provider>
  );
};
