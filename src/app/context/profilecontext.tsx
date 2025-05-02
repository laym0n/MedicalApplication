import {ProfileModel} from '@shared/api/types';
import {createContext, useContext, useState} from 'react';

interface CurrentUserProfileContextProps {
  currentUserProfile: ProfileModel | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<ProfileModel | null>
  >;
  masterKey: string | null;
  setMasterKey: React.Dispatch<React.SetStateAction<string | null>>;
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

  return (
    <CurrentUserProfileContext.Provider
      value={{
        currentUserProfile,
        setCurrentUserProfile,
        masterKey,
        setMasterKey,
      }}>
      {children}
    </CurrentUserProfileContext.Provider>
  );
};
