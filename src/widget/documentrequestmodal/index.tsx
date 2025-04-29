import React, {useCallback} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {WebRTCContextProvider} from './wsapi';
import {useSendDocument} from './model';
import {Document} from '@shared/db/entity/document';

const DocumentRequestModal: React.FC<{
  documents: Document[];
  visible: boolean;
  selectedDocumentIdRef: React.RefObject<number | undefined>;
  onIgnore: any;
  onSend: any;
}> = ({documents, visible, selectedDocumentIdRef, onIgnore, onSend}) => {
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
            Пожалуйста, выберите документ для отправки
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
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DocumentUploadModal: React.FC<{
  visible: boolean;
  onIgnore: any;
  onReadyToReceiveFile: any;
}> = ({visible, onIgnore, onReadyToReceiveFile}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Загрузка документов</Text>
          <Text style={styles.description}>Согласиться сохранить файлы</Text>

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button title="Загрузить" onPress={onReadyToReceiveFile} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PrescriptionUploadModal: React.FC<{
  visible: boolean;
  onIgnore: any;
  onReadyToReceivePrescription: any;
}> = ({visible, onIgnore, onReadyToReceivePrescription}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Загрузка результатов консультации</Text>
          <Text style={styles.description}>
            Загрузить результаты консультации
          </Text>

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button
              title="Загрузить"
              onPress={onReadyToReceivePrescription}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OfferModal: React.FC<{}> = ({}) => {
  const {
    documents,
    onIgnore,
    onSend,
    visible,
    selectedDocumentIdRef,
    onReadyToReceiveFile,
    onReadyToReceivePrescription,
    offerPayload,
  } = useSendDocument();

  return (
    <>
      {offerPayload?.type === 'offer_request' && (
        <DocumentRequestModal
          documents={documents}
          onIgnore={onIgnore}
          onSend={onSend}
          visible={visible}
          selectedDocumentIdRef={selectedDocumentIdRef}
        />
      )}
      {offerPayload?.type === 'offer_upload' && (
        <DocumentUploadModal
          onIgnore={onIgnore}
          visible={visible}
          onReadyToReceiveFile={onReadyToReceiveFile}
        />
      )}
      {offerPayload?.type === 'offer_prescription' && (
        <PrescriptionUploadModal
          onIgnore={onIgnore}
          visible={visible}
          onReadyToReceivePrescription={onReadyToReceivePrescription}
        />
      )}
    </>
  );
};

const DocumentRequestNotification: React.FC<{}> = () => {
  return (
    <WebRTCContextProvider>
      <OfferModal />
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
