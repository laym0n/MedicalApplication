import {
  peerConnection,
  RTCPeerConnectionContext,
  webSocket,
  WebSocketContext,
} from '@app/context/wsclient';
import {useGetProfile} from '@shared/api/hooks';
import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

interface DocumentRequestNotificationProps {
  onIgnore: () => void;
  onSend: (document: DocumentPickerResponse | null) => void;
}

const DocumentRequestNotification: React.FC<
  DocumentRequestNotificationProps
> = ({onIgnore, onSend}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPickerResponse | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setSelectedDocument(result);
    } catch (err: any) {
      if (!DocumentPicker.isCancel(err)) {
        console.warn('Ошибка при выборе документа:', err);
      }
    }
  };
  return (
    <RTCPeerConnectionContext.Provider value={peerConnection}>
      <WebSocketContext.Provider value={webSocket}>
        <Modal visible={visible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.container}>
              <Text style={styles.title}>Запрос документов</Text>
              <Text style={styles.description}>
                Пожалуйста, выберите документ для отправки.
              </Text>

              <TouchableOpacity
                style={styles.pickButton}
                onPress={pickDocument}>
                <Text style={styles.pickButtonText}>
                  {selectedDocument
                    ? selectedDocument.name
                    : 'Выбрать документ'}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttons}>
                <Button title="Игнорировать" color="#999" onPress={onIgnore} />
                <Button
                  title="Отправить"
                  onPress={() => onSend(selectedDocument)}
                  disabled={!selectedDocument}
                />
              </View>
            </View>
          </View>
        </Modal>
      </WebSocketContext.Provider>
    </RTCPeerConnectionContext.Provider>
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DocumentRequestNotification;
