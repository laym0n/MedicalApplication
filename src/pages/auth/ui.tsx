import {useNavigation} from '@react-navigation/native';
import React, {FC, useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useSignInCall from './api';
import {useGetProfile} from '@shared/api/hooks';
import { useCurrentUserProfileContext } from '@app/context/profilecontext';

const AuthScreen: FC<{isLogin: boolean}> = ({isLogin}) => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {mutateAsync: signInAsync} = useSignInCall();

  const currentUserContext = useCurrentUserProfileContext();
  const {mutateAsync: getProfileAsync} = useGetProfile(currentUserContext!.handleSignIn);

  const handleAuth = useCallback(() => {
    signInAsync({
      login: login,
      password: password,
      rememberMe: true,
    })
      .then(() => getProfileAsync())
      .then(() => navigation.goBack())
      .catch(console.error);
  }, [getProfileAsync, login, navigation, password, signInAsync]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Вход' : 'Регистрация'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Login"
        value={login}
        onChangeText={setLogin}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Пароль"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {/* <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" /> */}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate(isLogin ? 'Register' : 'Login')}>
        <Text style={styles.switchText}>
          {isLogin
            ? 'Нет аккаунта? Зарегистрируйтесь'
            : 'Уже есть аккаунт? Войти'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const LoginScreen = () => <AuthScreen isLogin={true} />;
export const RegisterScreen = () => <AuthScreen isLogin={false} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  inputPassword: {flex: 1},
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  switchText: {marginTop: 15, color: '#007bff'},
});
