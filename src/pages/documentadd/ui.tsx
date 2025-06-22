import * as DocumentPicker from '@react-native-documents/picker';
import Layout from '@widget/layout/ui';
import 'react-native-get-random-values';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDocumentsModel} from '@shared/model/documentmodel';
import {Document} from '@shared/db/entity/document';
import {useNavigation} from '@react-navigation/native';
import {Button, Text, TextInput} from 'react-native-paper';
import LoaderOverlay from '@widget/LoadOverlay/ui';

const DocumentAddScreen = () => {
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [mime, setMime] = useState<string | undefined>(undefined);
  const {readFile, createDocument} = useDocumentsModel();
  const navigation = useNavigation();
  const [visibleRestoreIndicator, setVisibleRestoreIndicator] =
    useState<boolean>(false);

  const handleSaveFile = useCallback(async () => {
    try {
      if (!uri || !name || !mime) {
        Alert.alert(
          'Ошибка',
          'Пожалуйста, выберите файл и введите имя документа.',
        );
        return;
      }
      const {pureFile} = await readFile(uri);
      const document = new Document();
      document.mime = mime;
      document.name = name;
      setVisibleRestoreIndicator(true);
      await createDocument(pureFile, document);

      navigation.goBack();
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Файл успешно сохранён!',
        visibilityTime: 3000,
      });
    } catch (err: any) {
      console.error('Ошибка:', err);
      Alert.alert('Ошибка', err.message || 'Что-то пошло не так');
    } finally {
      setVisibleRestoreIndicator(false);
    }
  }, [mime, name, navigation, readFile, createDocument, uri]);

  const pickFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick().catch(console.error);

      if (!res?.[0]?.uri || !res?.[0]?.name) {
        return;
      }

      const {uri: uriFile, name: nameFile, type} = res[0];
      setUri(uriFile);
      setName(nameFile);
      setMime(type!);
    } catch (err: any) {
      console.error('Ошибка при выборе файла:', err);
    }
  }, []);
  const cancel = useCallback(() => {
    setUri(undefined);
    setName(undefined);
    setMime(undefined);
  }, []);

  return (
    <Layout>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Добавить новый документ</Text>

          <Button
            mode="contained"
            icon="file-plus"
            onPress={pickFile}
            style={styles.pickButton}>
            Выбрать файл
          </Button>

          {uri && (
            <View style={styles.fileInfo}>
              <Text style={styles.label}>Имя документа</Text>
              <TextInput
                mode="outlined"
                placeholder="Введите название документа"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoFocus
                dense
              />
            </View>
          )}

          <View style={styles.buttonsRow}>
            <Button
              mode="contained"
              onPress={handleSaveFile}
              disabled={!uri || !name}
              style={styles.saveButton}
              icon="content-save">
              Сохранить
            </Button>

            <Button
              mode="outlined"
              onPress={cancel}
              style={styles.cancelButton}
              icon="cancel">
              Отменить
            </Button>

            <LoaderOverlay
              visible={visibleRestoreIndicator}
              status="Сохранение документа"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default DocumentAddScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  pickButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  fileInfo: {
    marginBottom: 30,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    backgroundColor: 'white',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 6,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 6,
  },
});
