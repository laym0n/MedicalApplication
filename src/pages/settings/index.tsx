import React, {useEffect, useState} from 'react';
import {View, Text, Switch, StyleSheet} from 'react-native';
import useBackupModel from '@shared/model/backupmodel';

const SettingsScreen = () => {
  const [backupEnabled, setBackupEnabled] = useState(false);
  const {getBackupSettings, setBackupSettings} = useBackupModel();

  useEffect(() => {
    const loadSetting = async () => {
      const backupEnabledLoaded = await getBackupSettings();
      setBackupEnabled(backupEnabledLoaded);
    };

    loadSetting();
  }, [getBackupSettings]);

  const toggleBackup = async (value: boolean) => {
    setBackupEnabled(value);
    await setBackupSettings(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Настройки резервного копирования</Text>
      <View style={styles.row}>
        <Text style={styles.label}>
          Резервное копирование {backupEnabled ? 'включено' : 'выключено'}
        </Text>
        <Switch
          value={backupEnabled}
          onValueChange={toggleBackup}
          thumbColor={backupEnabled ? '#4caf50' : '#f44336'}
        />
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 18,
  },
});
