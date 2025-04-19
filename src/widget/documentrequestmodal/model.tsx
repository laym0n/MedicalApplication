import {useCallback, useEffect, useRef, useState} from 'react';
import {useP2PConnection} from './api';
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
  const {
    connectViaWebSocket,
    sendDocumentViaP2P,
    sendReadyToReceiveFile,
    closeP2PConnection,
    createNewPeerConnection,
  } = useP2PConnection(handleReceivedOffer);

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
    return (
      readDocument(selectedDocument)
        .then(async pureDocument => {
          await createNewPeerConnection();
          await sendDocumentViaP2P(pureDocument!, selectedDocument);
        })
        .then(() => setVisible(false))
        .catch(console.error)
    );
  }, [createNewPeerConnection, documents, readDocument, sendDocumentViaP2P]);
  const onReadyToReceive = useCallback(() => {
    const onDocumentRecived = ({
      pureFile,
      document,
    }: {
      pureFile: string;
      document: Document;
    }) => {
      saveFile(pureFile, document)
        .then(() =>
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Файл успешно сохранён!',
            visibilityTime: 3000,
          }),
        )
        .then(() => closeP2PConnection())
        .then(() => setVisible(false))
        .catch(console.error);
    };
    return createNewPeerConnection(onDocumentRecived)
      .then(() => sendReadyToReceiveFile())
      .catch(console.error);
  }, [
    closeP2PConnection,
    createNewPeerConnection,
    saveFile,
    sendReadyToReceiveFile,
  ]);
  return {
    visible,
    documents,
    onIgnore,
    onSend,
    onReadyToReceive,
    selectedDocumentIdRef,
  };
};
