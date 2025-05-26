import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import {useNavigation} from '@react-navigation/native';
import React, {ReactNode, useCallback, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Menu} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useSignOutCall from './api';
import DocumentRequestNotification from '@widget/documentrequestmodal';

const NonAuthneticatedControls: React.FC = () => {
  const navigation = useNavigation();
  const onPressSignIn = useCallback(
    () => navigation.navigate('Auth'),
    [navigation],
  );
  return (
    <TouchableOpacity onPress={onPressSignIn}>
      <Text style={styles.loginText}>Войти</Text>
    </TouchableOpacity>
  );
};

const AuthneticatedControls: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const {mutate: signOutCall} = useSignOutCall();

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const currentUserContext = useCurrentUserProfileContext();

  const navigation = useNavigation();
  const onPermissionsPress = useCallback(() => {
    navigation.navigate('Permissions');
  }, [navigation]);
  const onSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);
  const onSignOutPress = useCallback(() => {
    signOutCall();
    closeMenu();
    currentUserContext!.handleLogOut();
  }, [closeMenu, currentUserContext, signOutCall]);
  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
        </TouchableOpacity>
      }>
      <Menu.Item onPress={onPermissionsPress} title="Разрешения на данные" />
      <Menu.Item onPress={onSettingsPress} title="Настройки" />
      <Menu.Item onPress={onSignOutPress} title="Выход" />
    </Menu>
  );
};

const Layout: React.FC<{children: ReactNode}> = ({children}) => {
  const currentUserContext = useCurrentUserProfileContext();
  const isAuthenticated = currentUserContext?.currentUserProfile;

  return (
    <>
      <View style={styles.container}>
        <DocumentRequestNotification />
        <View style={styles.header}>
          {isAuthenticated ? (
            <AuthneticatedControls />
          ) : (
            <NonAuthneticatedControls />
          )}
        </View>

        <View style={styles.content}>{children}</View>
      </View>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 16,
    color: '#007aff',
  },
  content: {
    flex: 1,
  },
});

export default Layout;
