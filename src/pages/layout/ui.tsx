import {CurrentUserProfileContext} from '@app/constants/context';
import {useGetProfile} from '@shared/api/hooks';
import {ProfileModel} from '@shared/api/types';
import React, {ReactNode, useEffect, useState} from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  const [currentUserProfile, setCurrentUserProfile] =
    useState<ProfileModel | null>(null);
  const {mutateAsync: getProfileAsync} = useGetProfile(setCurrentUserProfile);
  useEffect(() => {
    getProfileAsync();
  }, [getProfileAsync]);

  return (
    <CurrentUserProfileContext.Provider value={currentUserProfile}>
      {children}
    </CurrentUserProfileContext.Provider>
  );
};

export default Layout;
