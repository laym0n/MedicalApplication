import { useCallback, useRef } from 'react';
import { DocumentMetaPayload } from '../types';
import { useDocumentsModel } from '@shared/model/documentmodel';
import { Document } from '@shared/db/entity/document';

const useDocumentHandler = () => {
    const fileRef = useRef<string>(undefined);
    const fileMetaRef = useRef<DocumentMetaPayload>(undefined);
    const {saveFile} = useDocumentsModel();
    const handleReceivedFile = useCallback(() => {
        if (!fileRef.current || !fileMetaRef.current) {
            return;
        }
        const document = new Document();
        document.mime = fileMetaRef.current.mime;
        document.name = fileMetaRef.current.name;
        saveFile(fileRef.current, document);
        fileRef.current = undefined;
        fileMetaRef.current = undefined;
    }, [saveFile]);
    const handleReceiveDocumentMetaPayload = useCallback((payload: DocumentMetaPayload) => {
        fileMetaRef.current = payload;
        handleReceivedFile();
    }, [handleReceivedFile]);
    const handleReceiveFileDataPayload = useCallback((payload: string) => {
        fileRef.current = payload;
        handleReceivedFile();
    }, [handleReceivedFile]);
    return {handleReceiveDocumentMetaPayload, handleReceiveFileDataPayload};
};

export default useDocumentHandler;
