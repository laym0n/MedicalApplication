import {useCallback, useEffect, useRef, useState} from 'react';
import {useP2PConnection} from './wsapi';
import {Document} from '@shared/db/entity/document';
import {useDocumentsModel} from '@shared/model/documentmodel';
import Toast from 'react-native-toast-message';
import {useUpdateConsultationPrescription} from './api';
import {P2PConnectionEstablishPayload, PrescriptionPayload} from './types';
import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import { Consultation } from '@shared/db/entity/consultation';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import { useConsultationModel } from '@shared/model/consultationmodel';

export const useSendDocument = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const selectedDocumentIdRef = useRef<number | undefined>(undefined);
  const [offerPayload, setOfferPayload] =
    useState<P2PConnectionEstablishPayload | null>(null);

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

  useEffect(() => {
    if (!visible) {
      setOfferPayload(null);
    }
  }, [visible]);

  const handleReceivedOffer = useCallback(
    (newOfferPayload: P2PConnectionEstablishPayload) => {
      setVisible(true);
      setOfferPayload(newOfferPayload);
    },
    [],
  );
  const {
    connectViaWebSocket,
    disconnectViaWebSocket,
    sendDocumentViaP2P,
    sendReadyToReceiveFile,
    closeP2PConnection,
    createNewPeerConnection,
    sendReadyToReceivePrescription,
  } = useP2PConnection(handleReceivedOffer);

  const currentUserContext = useCurrentUserProfileContext();
  useEffect(() => {
    if (!currentUserContext?.currentUserProfile) {
      disconnectViaWebSocket();
      return;
    }
    connectViaWebSocket();
  }, [
    connectViaWebSocket,
    currentUserContext?.currentUserProfile,
    disconnectViaWebSocket,
  ]);

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
    return readDocument(selectedDocument)
      .then(async pureDocument => {
        await createNewPeerConnection();
        await sendDocumentViaP2P(pureDocument!, selectedDocument);
      })
      .then(() => setVisible(false))
      .catch(console.error);
  }, [createNewPeerConnection, documents, readDocument, sendDocumentViaP2P]);
  const onReadyToReceiveFile = useCallback(() => {
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

  const {save: saveConsultation} = useConsultationModel();
  const {mutateAsync: updateConsultationPrescriptionAsync} =
    useUpdateConsultationPrescription();
  const onReadyToReceivePrescription = useCallback(() => {
    const onPrescriptionRecived = ({
      prescription,
    }: {
      prescription: PrescriptionPayload;
    }) => {
      const masterKey = currentUserContext?.masterKey;
      const encryptedPrescription = CryptoJS.AES.encrypt(prescription.prescription, masterKey!).toString();
      updateConsultationPrescriptionAsync({
        consultationId: prescription.consultationId,
        prescription: {prescription: encryptedPrescription},
      })
        .then((record) => {
          const newConsultation = new Consultation();
          newConsultation.transactionId = record.txId!;
          newConsultation.data = prescription.prescription;
          return saveConsultation(newConsultation);
        })
        .catch(reason => console.error(reason))
        .finally(() => setVisible(false));
    };
    return createNewPeerConnection(undefined, onPrescriptionRecived)
      .then(() => sendReadyToReceivePrescription())
      .catch(console.error);
  }, [createNewPeerConnection, currentUserContext?.masterKey, saveConsultation, sendReadyToReceivePrescription, updateConsultationPrescriptionAsync]);
  return {
    visible,
    documents,
    onIgnore,
    onSend,
    onReadyToReceiveFile,
    onReadyToReceivePrescription,
    selectedDocumentIdRef,
    offerPayload,
  };
};
