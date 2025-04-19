import {useCallback, useEffect, useRef, useState} from 'react';
import {useSendDataViaP2P} from './api';
import {useCurrentUserProfileContext} from '@shared/lib/hooks';
import {Document} from '@shared/db/entity/document';
import {useDocumentsModel} from '@shared/model/documentmodel';
import Toast from 'react-native-toast-message';

export const useSendDocument = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const selectedDocumentIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!visible) {
      return;
    }
    Document.find().then(newDocuments => {
      setDocuments(newDocuments);
      if (newDocuments.length === 0) {
        return;
      }
      selectedDocumentIdRef.current = newDocuments[0].id;
    });
  }, [visible]);

  const handleReceivedOffer = useCallback(() => setVisible(true), []);
  const {connectViaWebSocket, sendDocumentViaP2P, sendReadyToReceiveFile} =
    useSendDataViaP2P(handleReceivedOffer);

  const profile = useCurrentUserProfileContext();
  useEffect(() => {
    if (!profile) {
      return;
    }
    connectViaWebSocket();
  }, [connectViaWebSocket, profile]);

  const onIgnore = useCallback(() => setVisible(false), []);

  const {readDocument, saveFile} = useDocumentsModel();
  const onSend = useCallback(() => {
    if (!selectedDocumentIdRef.current) {
      return;
    }
    const selectedDocument = documents.find(
      document => document.id === selectedDocumentIdRef.current,
    );
    if (!selectedDocument) {
      return;
    }
    readDocument(selectedDocument)
      .then(pureDocument => sendDocumentViaP2P(pureDocument!, selectedDocument))
      .then(() => setVisible(false))
      .catch(console.error);
  }, [documents, readDocument, sendDocumentViaP2P]);
  const onReadyToReceive = useCallback(() => {
    sendReadyToReceiveFile(({pureFile, document}) => {
      saveFile(pureFile, document).then(() =>
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Файл успешно сохранён!',
          visibilityTime: 3000,
        }),
      ).catch(console.error);
    });
  }, [saveFile, sendReadyToReceiveFile]);
  return {
    visible,
    documents,
    onIgnore,
    onSend,
    onReadyToReceive,
    selectedDocumentIdRef,
  };
};
