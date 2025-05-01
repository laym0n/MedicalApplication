import {useNavigation} from '@react-navigation/native';
import {Document} from '@shared/db/entity/document';
import { useDocumentsModel } from '@shared/model/documentmodel';
import DocumentRequestNotification from '@widget/documentrequestmodal';
import Layout from '@widget/layout/ui';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const DocumentCard: React.FC<{document: Document, onDelete: (id: number) => void}> = ({document, onDelete}) => {
  const handleDeletePress = useCallback(() => onDelete(document.id), [document.id, onDelete]);
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{document.name}</Text>
      <Text style={styles.cardText}>{document.mime}</Text>
      <Button title="Удалить" onPress={handleDeletePress} />
    </View>
  );
};

const DocumentsScreen = () => {
  const navigation = useNavigation();
  const [documents, setDocuments] = useState<Document[]>([]);
  useEffect(() => {
    Document.find().then(newDocuments => setDocuments(newDocuments));
  }, []);

  const handleAddNewDocument = useCallback(
    () => navigation.navigate('DocumentAdd'),
    [navigation],
  );
  const {deleteDocumentById} = useDocumentsModel();

  return (
    <Layout>
      <DocumentRequestNotification />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {documents.map(doc => <DocumentCard key={doc.id} onDelete={deleteDocumentById} document={doc}/>)}
        </ScrollView>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText} onPress={handleAddNewDocument}>
            Добавить новый документ
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
  },
  cardsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  cardText: {
    fontSize: 18,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DocumentsScreen;
