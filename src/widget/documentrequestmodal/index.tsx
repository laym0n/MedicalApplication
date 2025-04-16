import {ProfileModel} from '@shared/api/types';
import {useCurrentUserProfileContext} from '@shared/lib/hooks';
import React, {useCallback, useEffect, useState} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import {useSendDataViaP2P, WebRTCContextProvider} from './api';

const DocumentRequestModal: React.FC<{}> = ({}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const profile = useCurrentUserProfileContext();

  const handleReceivedOffer = useCallback(
    (_: ProfileModel) => setVisible(true),
    [],
  );
  const {connectViaWebSocket, sendDataViaP2P} =
    useSendDataViaP2P(handleReceivedOffer);

  useEffect(() => {
    if (!profile) {
      return;
    }
    connectViaWebSocket();
  }, [connectViaWebSocket, profile]);

  const onIgnore = useCallback(() => setVisible(false), []);
  const onSend = useCallback(() => sendDataViaP2P('message').then(() => setVisible(false)), [sendDataViaP2P]);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Запрос документов</Text>
          <Text style={styles.description}>
            Пожалуйста, выберите документ для отправки.
          </Text>

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button title="Отправить" onPress={onSend} />
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DocumentRequestNotification;
