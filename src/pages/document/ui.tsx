import {useRoute} from '@react-navigation/native';
import {Document} from '@shared/db/entity/document';
import {useDocumentsModel} from '@shared/model/documentmodel';
import Layout from '@widget/layout/ui';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Pdf from 'react-native-pdf';

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
        console.log(`Link presse: ${uri}`);
      }}
      style={styles.pdf}
    />
  );
};

const DocumentViewScreen = () => {
  const route = useRoute();
  const {documentId} = route.params as {documentId: number};

  const [decryptedBase64File, setDecryptedBase64File] = useState<string | null>(
    null,
  );

  const {readDocument} = useDocumentsModel();
  useEffect(() => {
    async function LoadDocument() {
      const document = await Document.findOneBy({id: documentId});
      if (!document) {
        return;
      }
      const decryptedFile = await readDocument(document);
      if (!decryptedFile) {
        return;
      }
      setDecryptedBase64File(decryptedFile);
    }
    LoadDocument();
  }, [documentId, readDocument]);

  return (
    <Layout>
      <View style={styles.container}>
        {decryptedBase64File && <PdfPreview base64Data={decryptedBase64File} />}
      </View>
    </Layout>
  );
};

export default DocumentViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
