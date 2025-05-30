import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { initDatabase } from '@app/config/DatabaseConfig';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
      }
    };

    setup();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
