import React, {useCallback} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {WebRTCContextProvider} from './api';
import {useSendDocument} from './model';

const DocumentRequestModal: React.FC<{}> = ({}) => {
  const {documents, onIgnore, onSend, visible, selectedDocumentIdRef, onReadyToReceive} =
    useSendDocument();

  const setSelectedDocumentId = useCallback(
    (newSelectedDocumentId: any) =>
      (selectedDocumentIdRef.current = newSelectedDocumentId),
    [selectedDocumentIdRef],
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Запрос документов</Text>
          <Text style={styles.description}>
            Пожалуйста, выберите документ для отправки.
          </Text>
          <Picker
            onValueChange={itemValue => setSelectedDocumentId(itemValue)}
            style={styles.picker}>
            {documents.map(doc => (
              <Picker.Item key={doc.id} label={doc.name} value={doc.id} />
            ))}
          </Picker>

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button title="Отправить" onPress={onSend} />
            <Button title="Принять файл" onPress={onReadyToReceive} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DocumentRequestNotification: React.FC<{}> = () => {
  return (
    <WebRTCContextProvider>
      <DocumentRequestModal />
    </WebRTCContextProvider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
  },
  pickButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#333',
  },
  picker: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DocumentRequestNotification;
