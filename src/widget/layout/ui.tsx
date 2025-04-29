import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import {useGetProfile} from '@shared/api/hooks';
import React, {ReactNode, useEffect} from 'react';
import Toast from 'react-native-toast-message';

const Layout: React.FC<{children: ReactNode}> = ({children}) => {
  const currentUserContext = useCurrentUserProfileContext();
  const {mutateAsync: getProfileAsync} = useGetProfile(
    currentUserContext!.setCurrentUserProfile,
  );
  useEffect(() => {
    getProfileAsync();
  }, [getProfileAsync]);

  return (
    <>
      {children}
      <Toast />
    </>
  );
};

export default Layout;
