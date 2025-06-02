import { useCallback, useRef } from 'react';
import { DocumentMetaPayload, P2PConnectionEstablishPayload } from '../types';
import { useDocumentsModel } from '@shared/model/documentmodel';
import { Document } from '@shared/db/entity/document';
import { Consultation } from '@shared/db/entity/consultation';
import { TaskQueue } from '@shared/util/TaskQueue';

const useDocumentHandler = (offer: P2PConnectionEstablishPayload | null, promiseQueue: TaskQueue) => {
    const fileRef = useRef<string>(undefined);
    const fileMetaRef = useRef<DocumentMetaPayload>(undefined);
    const { createDocument } = useDocumentsModel();
    const handleReceivedFile = useCallback(() => {
        if (!fileRef.current || !fileMetaRef.current) {
            return;
        }
        const document = new Document();
        document.mime = fileMetaRef.current.mime;
        document.name = fileMetaRef.current.name;
        const fileContent = fileRef.current;
        const handleSaveFile = async () => {
            try {
                const consultation = await Consultation.findOneBy({ consultationId: offer!.consultationId! });
                document.consultation = consultation ? consultation : undefined;
                await createDocument(fileContent, document);
            } catch (e) {
                console.error(e);
            }
        };
        promiseQueue.push(handleSaveFile);
        fileRef.current = undefined;
        fileMetaRef.current = undefined;
    }, [offer, promiseQueue, createDocument]);
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
