import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, Switch, StyleSheet, Button} from 'react-native';
import useBackupModel from '@shared/model/backupmodel';
import {useGetAllTxIds} from './api';
import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import LoaderOverlay from '@widget/LoadOverlay/ui';
import Toast from 'react-native-toast-message';
import {useDocumentsModel} from '@shared/model/documentmodel';
import {useConsultationModel} from '@shared/model/consultationmodel';
import {Document} from '@shared/db/entity/document';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';

function jsonToDocument(json: any, txId: string): Document {
  const doc = new Document();
  doc.id = json.id;
  doc.createdAt = json.createdAt;
  doc.version = json.version;
  doc.updatedAt = json.updatedAt;
  doc.name = json.name;
  doc.fileId = json.fileId;
  doc.fileUri = json.fileUri;
  doc.mime = json.mime;
  doc.transactionId = txId;
  doc.cidId = json.cidId;
  return doc;
}

function jsonToConsultation(json: any, txId: string): Consultation {
  const consultation = new Consultation();
  consultation.id = json.id;
  consultation.createdAt = json.createdAt;
  consultation.version = json.version;
  consultation.updatedAt = json.updatedAt;
  consultation.transactionId = txId;
  consultation.data = json.data;
  consultation.consultationId = json.consultationId;
  consultation.specialization = json.specialization;
  consultation.userId = json.userId;
  consultation.doctorName = json.doctorName;
  return consultation;
}

const BackupScreen = () => {
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
  const [visibleRestoreIndicator, setVisibleRestoreIndicator] =
    useState<boolean>(false);
  const [statusRestoreIndicator, setStatusRestoreIndicator] =
    useState<string>('');

  const {mutateAsync: getTxIdsAsync} = useGetAllTxIds();
  const currentProfile = useCurrentUserProfileContext();
  const {restoreRecord} = useBackupModel();
  const {createBackupDocument} = useDocumentsModel();
  const {saveRestored} = useConsultationModel();
  const handleRestore = useCallback(async () => {
    setVisibleRestoreIndicator(true);
    setStatusRestoreIndicator('Поиск данных');
    try {
      const txIds = await getTxIdsAsync(
        currentProfile!.currentUserProfile!.user!.id!,
      );
      setStatusRestoreIndicator('Восстановление');
      let documentCount = 0;
      let consultationCount = 0;
      for (const txId of txIds) {
        const restoredRecord = await restoreRecord(txId);
        if (restoredRecord.fileId) {
          const isRestored = await createBackupDocument(
            jsonToDocument(restoredRecord, txId),
          );
          documentCount += +isRestored;
        } else {
          const isRestored = await saveRestored(
            jsonToConsultation(restoredRecord, txId),
          );
          consultationCount += +isRestored;
        }
      }
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: `Восстановлено ${documentCount} документов, ${consultationCount} консультаций`,
        visibilityTime: 3000,
      });
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Восстановление из резервной коппии завершилось ошибкой',
        visibilityTime: 3000,
      });
    } finally {
      setVisibleRestoreIndicator(false);
    }
  }, [
    createBackupDocument,
    currentProfile,
    getTxIdsAsync,
    restoreRecord,
    saveRestored,
  ]);

  return (
    <Layout>
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
        <View style={styles.restoreButton}>
          <Button
            title="Восстановить данные из резервной копии"
            onPress={handleRestore}
          />
        </View>
        <LoaderOverlay
          visible={visibleRestoreIndicator}
          status={statusRestoreIndicator}
        />
      </View>
    </Layout>
  );
};

export default BackupScreen;

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
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
  },
  restoreButton: {
    marginTop: 20,
    alignSelf: 'center',
    width: '100%',
  },
});
