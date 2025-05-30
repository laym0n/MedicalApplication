import { useCallback, useEffect, useRef, useState } from 'react';
import { useP2PConnection } from '../wsapi';
import useDocumentHandler from './documenthandler';
import useP2PPayloadHandler from './p2ppayloadhandler';
import { P2PConnectionEstablishPayload, P2pPayload } from '../types';
import { Consultation } from '@shared/db/entity/consultation';
import { Document } from '@shared/db/entity/document';
import { PatientProfile } from '@shared/db/entity/patientprofile';
import { useDocumentsModel } from '@shared/model/documentmodel';
import { useConsultationModel } from '@shared/model/consultationmodel';
import { usePatientProfileModel } from '@shared/model/patientprofilemodel';
import { useCurrentUserProfileContext } from '@app/context/profilecontext';
import useConsultationHandler from './consultationhandler';
import { Permission } from '@shared/db/entity/permission';
import { TaskQueue } from '@shared/util/TaskQueue';

const useDataExchange = () => {
    const [offerPayload, setOfferPayload] =
        useState<P2PConnectionEstablishPayload | null>(null);
    const {current: promiseQueue} = useRef<TaskQueue>(new TaskQueue());
    const { handleReceiveFileDataPayload, handleReceiveDocumentMetaPayload } = useDocumentHandler(offerPayload, promiseQueue);
    const documentHandler = useP2PPayloadHandler('DOCUMENT', handleReceiveFileDataPayload);
    const documentMetaHandler = useP2PPayloadHandler('DOCUMENT_META', handleReceiveDocumentMetaPayload);

    const { handleReceiveConsultationPayload } = useConsultationHandler(offerPayload, promiseQueue);
    const consultationHandler = useP2PPayloadHandler('CONSULTATION', handleReceiveConsultationPayload);

    const closeP2pConnectionRef = useRef<() => void>(() => { });
    const handleEOF = useCallback(() => {
        setVisible(false);
        closeP2pConnectionRef.current();
    }, []);
    const eofHandler = useP2PPayloadHandler('EOF', handleEOF);

    const p2pPayloadHandler = useCallback(async (p2pPayload: P2pPayload) => {
        for (const payloadHandler of [documentHandler, documentMetaHandler, eofHandler, consultationHandler]) {
            await payloadHandler(p2pPayload);
        }
    }, [documentHandler, documentMetaHandler, eofHandler, consultationHandler]);

    const [visible, setVisible] = useState<boolean>(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);

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
        closeP2PConnection,
        sendReadyToSendData,
        sendReadyToReceiveConsultationResult,
        sendDocumentViaP2p,
        sendConsultationViaP2p,
        sendPatientProfileViaP2p,
        sendEOFViaP2P,
    } = useP2PConnection(handleReceivedOffer, p2pPayloadHandler);
    closeP2pConnectionRef.current = closeP2PConnection;

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

    const { readDocument } = useDocumentsModel();
    const { getAllByIds: getAllConsultationsByIds } = useConsultationModel();
    const { getAllByIds: getAllPatientProfilesByIds } = usePatientProfileModel();
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
            const permission = new Permission();
            permission.userId = offerPayload?.sourceProfile?.user?.id!;
            permission.consultations = selectedConsultations;
            permission.patientProfiles = selectedPatientProfiles;
            permission.documents = selectedDocuments;
            await permission.save();
            setVisible(false);
        },
        [createNewPeerConnection, documents, getAllConsultationsByIds, getAllPatientProfilesByIds, offerPayload?.sourceProfile?.user?.id, readDocument, sendConsultationViaP2p, sendDocumentViaP2p, sendEOFViaP2P, sendPatientProfileViaP2p, sendReadyToSendData],
    );

    const onReadyToReceiveConsultationResults = useCallback(
        async () => {
            await createNewPeerConnection();
            await sendReadyToReceiveConsultationResult();
        },
        [createNewPeerConnection, sendReadyToReceiveConsultationResult],
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

export default useDataExchange;
