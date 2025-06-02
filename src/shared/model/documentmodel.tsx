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
      const newFileId = document.name + '_' + Date.now();

      const savePath = `${RNFS.DocumentDirectoryPath}/${newFileId}.enc`;
      await RNFS.writeFile(savePath, pureFile, 'utf8');
      if (document.fileUri) {
        await RNFS.unlink(document.fileUri);
      }
      document.fileUri = savePath;
      document.fileId = newFileId;
      const newDocument = await document.save();
      return {newDocument};
    },
    [],
  );
  const createDocument = useCallback(
    async (pureFile: string, document: Document) => {
      const encryptionKey = generateKey();

      const encryptedFileContent = encryptWithKey(pureFile, encryptionKey);

      if (document.fileUri) {
        await Keychain.resetGenericPassword({
          service: getFileServiceName(document),
        });
      }
      const {newDocument} = await saveDocumentFile(
        encryptedFileContent,
        document,
      );
      await Keychain.setGenericPassword(encryptionKey, pureFile, {
        service: getFileServiceName(newDocument),
      });
      await backupFileWithSettingsVerify(newDocument, encryptedFileContent);
    },
    [backupFileWithSettingsVerify, saveDocumentFile],
  );
  const backupDocument = useCallback(
    async (documentId: string) => {
      const document = await Document.findOneBy({id: documentId});
      if (!document) {
        return;
      }
      const encryptedFile = await RNFS.readFile(document.fileUri, 'utf8');
      await backupFile(document, encryptedFile);
    },
    [backupFile],
  );
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
  const deleteDocumentById = useCallback(async (documentId: string) => {
    const document = await Document.findOneBy({id: documentId});
    if (document === null) {
      return;
    }
    await Document.delete(documentId);
    await Keychain.resetGenericPassword({
      service: getFileServiceName(document),
    });
  }, []);
  return {
    readFile,
    restoreDocument,
    backupDocument,
    createDocument,
    readDocument,
    deleteDocumentById,
  };
};
