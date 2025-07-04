import {
  generateKey,
  encryptWithKey,
  decryptWithKey,
} from '@shared/util/crypto-util';
import {useCallback} from 'react';
import RNFS from 'react-native-fs';
import * as Keychain from 'react-native-keychain';
import {Document} from '@shared/db/entity/document';
import useBackupModel from './backupmodel';

const getFileServiceName = (document: Document) => `fileId ${document.id}`;

export const useDocumentsModel = () => {
  const {backupFileWithSettingsVerify, backupFile, restoreFile} =
    useBackupModel();
  const readFile = useCallback(async (uri: string) => {
    const pureFile = await RNFS.readFile(uri, 'base64');
    return {pureFile};
  }, []);
  const saveDocumentFile = useCallback(
    async (pureFile: string, document: Document) => {
      const encryptionKey = generateKey();
      const encryptedFileContent = encryptWithKey(pureFile, encryptionKey);
      const newFileId = document.name + '_' + Date.now();

      const savePath = `${RNFS.DocumentDirectoryPath}/${newFileId}.enc`;
      await RNFS.writeFile(savePath, encryptedFileContent, 'utf8');
      if (document.fileUri) {
        await RNFS.unlink(document.fileUri).catch(console.error);
      }
      document.fileUri = savePath;
      document.fileId = newFileId;
      const newDocument = await document.save();
      await Keychain.setGenericPassword(
        getFileServiceName(newDocument),
        encryptionKey,
        {
          service: getFileServiceName(newDocument),
        },
      );
      return {newDocument};
    },
    [],
  );
  const createDocument = useCallback(
    async (pureFile: string, document: Document) => {
      if (document.fileUri) {
        await Keychain.resetGenericPassword({
          service: getFileServiceName(document),
        });
      }
      const {newDocument} = await saveDocumentFile(pureFile, document);
      const backupData = await backupFileWithSettingsVerify(
        newDocument,
        pureFile,
      );
      newDocument.cidId = backupData?.cidId;
      newDocument.transactionId = backupData?.transactionId;
      await newDocument.save();
    },
    [backupFileWithSettingsVerify, saveDocumentFile],
  );
  const createBackupDocument = useCallback(async (document: Document) => {
    const optionalDocument = await Document.findOneBy({id: document.id});
    if (optionalDocument) {
      return false;
    }
    await document.save();
    return true;
  }, []);
  const restoreDocument = useCallback(
    async (documentId: string) => {
      const document = await Document.findOneBy({id: documentId});
      if (!document || !document.transactionId || !document.cidId) {
        return;
      }
      const restoredData = await restoreFile(
        Document,
        document.transactionId,
        document.cidId,
      );
      document.name = restoredData.restoredRecord.name;
      document.mime = restoredData.restoredRecord.mime;
      await saveDocumentFile(restoredData.fileBase64Content, document);
    },
    [restoreFile, saveDocumentFile],
  );
  const readDocument = useCallback(async (document: Document) => {
    const credentials = await Keychain.getGenericPassword({
      service: getFileServiceName(document),
    });
    if (!credentials) {
      return;
    }
    const {password: encryptionKey} = credentials;
    const encryptedFile = await RNFS.readFile(document.fileUri, 'utf8');

    return decryptWithKey(encryptedFile, encryptionKey);
  }, []);
  const backupDocument = useCallback(
    async (documentId: string) => {
      const document = await Document.findOneBy({id: documentId});
      if (!document) {
        return;
      }
      const pureFile = await readDocument(document);
      const backupData = await backupFile(document, pureFile!);
      document.cidId = backupData!.cidId!;
      document.transactionId = backupData!.transactionId!;
      await document.save();
    },
    [backupFile, readDocument],
  );
  const deleteDocumentById = useCallback(async (documentId: string) => {
    const document = await Document.findOneBy({id: documentId});
    if (document === null) {
      return;
    }
    await Document.delete(documentId);
    await RNFS.unlink(document.fileUri);
    await Keychain.resetGenericPassword({
      service: getFileServiceName(document),
    });
  }, []);
  const deleteFileByDocumentId = useCallback(async (documentId: string) => {
    const document = await Document.findOneBy({id: documentId});
    if (document === null) {
      return;
    }
    await RNFS.unlink(document.fileUri);
  }, []);
  return {
    readFile,
    restoreDocument,
    backupDocument,
    createDocument,
    readDocument,
    deleteDocumentById,
    deleteFileByDocumentId,
    createBackupDocument,
  };
};
