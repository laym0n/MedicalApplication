import {CurrentUserProfileContext} from '@app/context/profilecontext';
import {
  RTCPeerConnectionContext,
  webSocket,
  WebSocketContext,
  peerConnection,
} from '@app/context/wsclient';
import {useGetProfile} from '@shared/api/hooks';
import {ProfileModel} from '@shared/api/types';
import React, {ReactNode, useEffect, useState} from 'react';
import {Button, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  const [currentUserProfile, setCurrentUserProfile] =
    useState<ProfileModel | null>(null);
  const {mutateAsync: getProfileAsync} = useGetProfile(setCurrentUserProfile);
  useEffect(() => {
    getProfileAsync();
  }, [getProfileAsync]);

  return (
    <RTCPeerConnectionContext.Provider value={peerConnection}>
      <WebSocketContext.Provider value={webSocket}>
        <CurrentUserProfileContext.Provider value={currentUserProfile}>
          {children}
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
                  <Button
                    title="Игнорировать"
                    color="#999"
                    onPress={onIgnore}
                  />
                  <Button
                    title="Отправить"
                    onPress={() => onSend(selectedDocument)}
                    disabled={!selectedDocument}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </CurrentUserProfileContext.Provider>
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

export default Layout;
