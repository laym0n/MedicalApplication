import {
  generateKey,
  encryptWithKey,
  decryptWithKey,
} from '@shared/util/crypto-util';
import {useCallback} from 'react';
import RNFS from 'react-native-fs';
import * as Keychain from 'react-native-keychain';
import {Document} from '@shared/db/entity/document';

const getFileServiceName = (document: Document) => `fileId ${document.id}`;

export const useDocumentsModel = () => {
  const readFile = useCallback(async (uri: string) => {
    const pureFile = await RNFS.readFile(uri, 'base64');
    return {pureFile};
  }, []);
  const saveFile = useCallback(async (pureFile: string, document: Document) => {
    const encryptionKey = generateKey();
    const newFileId = document.name + '_' + Date.now();

    const encrypted = encryptWithKey(pureFile, encryptionKey);

    const savePath = `${RNFS.DocumentDirectoryPath}/${newFileId}.enc`;
    await RNFS.writeFile(savePath, encrypted, 'utf8');
    if (document.fileUri) {
      await RNFS.unlink(document.fileUri);
      await Keychain.resetGenericPassword({
        service: getFileServiceName(document),
      });
    }
    document.fileUri = savePath;
    document.fileId = newFileId;
    const newDocument = await document.save();

    await Keychain.setGenericPassword(newFileId, encryptionKey, {
      service: getFileServiceName(newDocument),
    });
  }, []);
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
  return {readFile, saveFile, readDocument, deleteDocumentById};
};
