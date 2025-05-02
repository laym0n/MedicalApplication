import * as DocumentPicker from '@react-native-documents/picker';
import Layout from '@widget/layout/ui';
import 'react-native-get-random-values';
import React, {useCallback, useState} from 'react';
import {Alert, Button, Text, TextInput, View} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDocumentsModel } from '@shared/model/documentmodel';
import { Document } from '@shared/db/entity/document';
import { useNavigation } from '@react-navigation/native';

const DocumentAddScreen = () => {
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [mime, setMime] = useState<string | undefined>(undefined);
  const {readFile, saveFile} = useDocumentsModel();
  const navigation = useNavigation();

  const handleSaveFile = useCallback(async () => {
    try {
      if (!uri || !name || !mime) {
        return;
      }
      const {pureFile} = await readFile(uri);
      const document = new Document();
      document.mime = mime;
      document.name = name;
      await saveFile(pureFile, document);

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
    }
  }, [mime, name, navigation, readFile, saveFile, uri]);

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
  }, []);

  return (
    <Layout>
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
          <Button title="Сохранить" onPress={handleSaveFile} disabled={!uri} />
          <Button title="Отменить" onPress={cancel} />
        </View>
      </View>
    </Layout>
  );
};

export default DocumentAddScreen;
