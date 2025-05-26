import {useCallback, useEffect, useState} from 'react';
import {useP2PConnection} from './wsapi';
import {Document} from '@shared/db/entity/document';
import {useDocumentsModel} from '@shared/model/documentmodel';
import {P2PConnectionEstablishPayload} from './types';
import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import {Consultation} from '@shared/db/entity/consultation';
import {useConsultationModel} from '@shared/model/consultationmodel';
import {PatientProfile} from '@shared/db/entity/patientprofile';
import { usePatientProfileModel } from '@shared/model/patientprofilemodel';

export const useSendDocument = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [offerPayload, setOfferPayload] =
    useState<P2PConnectionEstablishPayload | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    Document.find().then(newDocuments => {
      setDocuments(newDocuments);
    });
    PatientProfile.find().then(newPatientProfiles => {
      setPatientProfiles(newPatientProfiles);
    });
    Consultation.find().then(newConsultations => {
      setConsultations(newConsultations);
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
    createNewPeerConnection,
    sendReadyToSendData,
    sendDocumentViaP2p,
    sendConsultationViaP2p,
    sendPatientProfileViaP2p,
    sendEOFViaP2P,
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

  const {readDocument} = useDocumentsModel();
  const {getAllByIds: getAllConsultationsByIds} = useConsultationModel();
  const {getAllByIds: getAllPatientProfilesByIds} = usePatientProfileModel();
  const onSend = useCallback(
    async (selectedIds: {
      documentIds: string[];
      profileIds: string[];
      consultationIds: string[];
    }) => {
      if (
        selectedIds.consultationIds.length === 0 &&
        selectedIds.documentIds.length === 0 &&
        selectedIds.profileIds.length === 0
      ) {
        return;
      }
      await createNewPeerConnection();
      await sendReadyToSendData();
      let selectedDocuments: Document[] = [];
      if (selectedIds.documentIds.length !== 0) {
        selectedDocuments = documents.filter(document =>
          selectedIds.documentIds.includes(document.id),
        );
      }
      for (const document of selectedDocuments) {
        const pureFile = await readDocument(document);
        await sendDocumentViaP2p(pureFile!, document);
      }
      let selectedPatientProfiles: PatientProfile[] = [];
      if (selectedIds.profileIds.length !== 0) {
        selectedPatientProfiles = await getAllPatientProfilesByIds(selectedIds.profileIds);
      }
      for (const patientProfile of selectedPatientProfiles) {
        await sendPatientProfileViaP2p(patientProfile);
      }
      let selectedConsultations: Consultation[] = [];
      if (selectedIds.consultationIds.length !== 0) {
        selectedConsultations = await getAllConsultationsByIds(selectedIds.consultationIds);
      }
      for (const consultation of selectedConsultations) {
        await sendConsultationViaP2p(consultation);
      }
      await sendEOFViaP2P();
      setVisible(false);
    },
    [createNewPeerConnection, documents, getAllConsultationsByIds, getAllPatientProfilesByIds, readDocument, sendConsultationViaP2p, sendDocumentViaP2p, sendEOFViaP2P, sendPatientProfileViaP2p, sendReadyToSendData],
  );

  const onReadyToReceiveConsultationResults = useCallback(
    () => {
    },
    [],
  );
  return {
    visible,
    documents,
    patientProfiles,
    consultations,
    onIgnore,
    onSend,
    onReadyToReceiveConsultationResults,
    offerPayload,
  };
};
