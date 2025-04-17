import * as DocumentPicker from '@react-native-documents/picker';
import DocumentRequestNotification from '@widget/documentrequestmodal';
import Layout from '@widget/layout/ui';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import React, {useCallback, useState} from 'react';
import {Alert, Button, Text, TextInput, View} from 'react-native';
import RNFS from 'react-native-fs';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';
import { Document } from '@shared/db/entity/document';

const DocumentAddScreen = () => {
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const saveFile = useCallback(async () => {
    try {
      if (!uri || !name) {
        return;
      }

      const fileContent = await RNFS.readFile(uri, 'base64');

      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
      const fileId = name + '_' + Date.now();

      const encrypted = CryptoJS.AES.encrypt(
        fileContent,
        encryptionKey,
      ).toString();

      const savePath = `${RNFS.DocumentDirectoryPath}/${fileId}.enc`;
      await RNFS.writeFile(savePath, encrypted, 'utf8');

      await Keychain.setGenericPassword(fileId, encryptionKey, {
        service: 'file-encryption-keys',
      });
      const doc = new Document();
      doc.name = fileId;
      await doc.save();

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Файл успешно сохранён!',
        visibilityTime: 3000,
      });
    } catch (err: any) {
      console.error('Ошибка:', err);
      Alert.alert('Ошибка', err.message || 'Что-то пошло не так');
    }
  }, [name, uri]);

  const pickFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick().catch(console.error);

      if (!res?.[0]?.uri || !res?.[0]?.name) {
        return;
      }

      const {uri: uriFile, name: nameFile} = res[0];
      setUri(uriFile);
      setName(nameFile);
    } catch (err: any) {
      console.error('Ошибка при выборе файла:', err);
    }
  }, []);
  const cancel = useCallback(() => {
    setUri(undefined);
    setName(undefined);
  }, []);

  return (
    <Layout>
      <DocumentRequestNotification />
      <View>
        <Text>Выберите документ для шифрования:</Text>
        <Button title="Выбрать файл" onPress={pickFile} />

        {uri && (
          <View>
            <Text>Имя документа: {name}</Text>
            <TextInput
              placeholder="Введите название документа"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View>
          <Button title="Сохранить" onPress={saveFile} disabled={!uri} />
          <Button title="Отменить" onPress={cancel} />
        </View>
      </View>
    </Layout>
  );
};

export default DocumentAddScreen;
