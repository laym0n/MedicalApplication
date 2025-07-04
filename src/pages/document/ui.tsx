import {useRoute} from '@react-navigation/native';
import {Document} from '@shared/db/entity/document';
import {useDocumentsModel} from '@shared/model/documentmodel';
import ConsultationCard from '@widget/ConsultationCard';
import Layout from '@widget/layout/ui';
import LoaderOverlay from '@widget/LoadOverlay/ui';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import {Button, Text} from 'react-native-paper';
import Pdf from 'react-native-pdf';
import Toast from 'react-native-toast-message';

const PdfPreview = ({base64Data}: {base64Data: string}) => {
  const source = {
    uri: `data:application/pdf;base64,${base64Data}`,
  };

  return (
    <Pdf
      source={source}
      onLoadComplete={numberOfPages => {
        console.log(`number of pages: ${numberOfPages}`);
      }}
      onPageChanged={page => {
        console.log(`current page: ${page}`);
      }}
      onError={error => {
        console.log(error);
      }}
      onPressLink={uri => {
        console.log(`Link pressed: ${uri}`);
      }}
      style={styles.pdf}
    />
  );
};

const DocumentViewScreen = () => {
  const route = useRoute();
  const {documentId} = route.params as {documentId: string};

  const [decryptedBase64File, setDecryptedBase64File] = useState<string | null>(
    null,
  );
  const [document, setDocument] = useState<Document | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [fileError, setFileError] = useState(false);
  const hasBackup = useMemo(() => {
    return !!document?.cidId && !!document?.transactionId;
  }, [document?.cidId, document?.transactionId]);

  const {readDocument, deleteFileByDocumentId} = useDocumentsModel();
  const loadDocument = useCallback(async () => {
    const loadedDocument = await Document.findOne({
      where: {id: documentId},
      relations: ['consultation'],
    });
    if (!loadedDocument) {
      return;
    }
    setDocument(loadedDocument);

    try {
      const decryptedFile = await readDocument(loadedDocument);
      if (!decryptedFile) {
        return;
      }
      setDecryptedBase64File(decryptedFile);
      setFileError(false);
    } catch (e) {
      console.error(e);
      setFileError(true);
    } finally {
      setLoading(false);
    }
  }, [documentId, readDocument]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const {restoreDocument, backupDocument} = useDocumentsModel();

  const [visibleRestoreIndicator, setVisibleRestoreIndicator] =
    useState<boolean>(false);
  const [statusRestoreIndicator, setStatusRestoreIndicator] =
    useState<string>('');
  const handleRestoreBackup = useCallback(() => {
    setVisibleRestoreIndicator(true);
    setStatusRestoreIndicator('Восстановление');
    restoreDocument(documentId)
      .then(loadDocument)
      .then(() =>
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Документ успешно восстановлен',
          visibilityTime: 3000,
        }),
      )
      .catch(() =>
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Ошибка восстановления документа',
          visibilityTime: 3000,
        }),
      )
      .finally(() => setVisibleRestoreIndicator(false));
  }, [documentId, loadDocument, restoreDocument]);

  const handleCreateBackup = useCallback(() => {
    setVisibleRestoreIndicator(true);
    setStatusRestoreIndicator('Создание резервной копии');
    backupDocument(documentId)
      .then(() =>
        Document.findOne({
          where: {id: documentId},
          relations: ['consultation'],
        }),
      )
      .then(loadedDocument => setDocument(loadedDocument!))
      .then(() =>
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Резервная копия успешно создана',
          visibilityTime: 3000,
        }),
      )
      .catch(() =>
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Ошибка создания резервной копии',
          visibilityTime: 3000,
        }),
      )
      .finally(() => setVisibleRestoreIndicator(false));
  }, [backupDocument, documentId]);

  return (
    <Layout>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <View style={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{document?.name}</Text>
            {hasBackup ? (
              <Button mode="contained" onPress={handleRestoreBackup}>
                Восстановить из резервной копии
              </Button>
            ) : (
              <Button mode="outlined" onPress={handleCreateBackup}>
                Сохранить резервную копию
              </Button>
            )}
            {/* <Button
              mode="outlined"
              onPress={() => deleteFileByDocumentId(documentId)}>
              Удалить
            </Button> */}
            {document?.consultation && (
              <ConsultationCard consultation={document.consultation} />
            )}
          </View>

          <View style={styles.pdfContainer}>
            {fileError && (
              <Text style={styles.title}>Ошибка загрузки документа</Text>
            )}
            {!fileError && decryptedBase64File && (
              <PdfPreview base64Data={decryptedBase64File} />
            )}
          </View>
        </View>
      )}
      <LoaderOverlay
        visible={visibleRestoreIndicator}
        status={statusRestoreIndicator}
      />
    </Layout>
  );
};

export default DocumentViewScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#222',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  pdfContainer: {
    padding: 8,
    height: 600,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});
