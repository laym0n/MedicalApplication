import { useCallback, useRef } from 'react';
import { DocumentMetaPayload, P2PConnectionEstablishPayload } from '../types';
import { useDocumentsModel } from '@shared/model/documentmodel';
import { Document } from '@shared/db/entity/document';
import { Consultation } from '@shared/db/entity/consultation';

const useDocumentHandler = (offer: P2PConnectionEstablishPayload | null) => {
    const fileRef = useRef<string>(undefined);
    const fileMetaRef = useRef<DocumentMetaPayload>(undefined);
    const { saveFile } = useDocumentsModel();
    const handleReceivedFile = useCallback(() => {
        if (!fileRef.current || !fileMetaRef.current) {
            return;
        }
        const document = new Document();
        document.mime = fileMetaRef.current.mime;
        document.name = fileMetaRef.current.name;
        const fileContent = fileRef.current;
        Consultation.findOneBy({ consultationId: offer!.consultationId! })
            .then(consultation => {
                document.consultation = consultation ? consultation : undefined;
            }).then(() => saveFile(fileContent, document));
        fileRef.current = undefined;
        fileMetaRef.current = undefined;
    }, [offer, saveFile]);
    const handleReceiveDocumentMetaPayload = useCallback((payload: DocumentMetaPayload) => {
        fileMetaRef.current = payload;
        handleReceivedFile();
    }, [handleReceivedFile]);
    const handleReceiveFileDataPayload = useCallback((payload: string) => {
        fileRef.current = payload;
        handleReceivedFile();
    }, [handleReceivedFile]);
    return { handleReceiveDocumentMetaPayload, handleReceiveFileDataPayload };
};

export default useDocumentHandler;
