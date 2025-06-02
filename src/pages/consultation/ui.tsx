import {useRoute} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  Divider,
  Button,
} from 'react-native-paper';
import {useConsultationModel} from '@shared/model/consultationmodel';
import {Document} from '@shared/db/entity/document';
import DocumentCard from '@widget/DocumentCard';

interface ConsultationProps {
  consultationId: string;
}

const ConsultationViewScreen = () => {
  const route = useRoute();
  const {consultationId} = route.params as ConsultationProps;

  const [consultation, setConsultation] = useState<Consultation | undefined>(
    undefined,
  );
  const hasBackup = useMemo(() => {
    return !!consultation?.transactionId;
  }, [consultation]);
  const {getById, restore, backup} = useConsultationModel();

  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    getById(consultationId).then(setConsultation);
    Document.find({
      where: {consultation: {id: consultationId}},
    }).then(setDocuments);
  }, [consultationId, getById]);

  const handleRestoreBackup = useCallback(() => {
    restore(consultationId).then(() => getById(consultationId)).then(setConsultation);
  }, [consultationId, getById, restore]);

  const handleCreateBackup = useCallback(() => {
    backup(consultationId).then(() => getById(consultationId)).then(setConsultation).catch(console.error);
  }, [backup, consultationId, getById]);

  if (!consultation) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card} mode="outlined">
          <Card.Title
            title={consultation.doctorName || 'Консультация'}
            subtitle={consultation.specialization}
          />
          <Card.Content>
            <Divider style={styles.divider} />
            <Text style={styles.label}>Содержание:</Text>
            <Text style={styles.dataText}>{consultation.data}</Text>

            <Divider style={styles.divider} />
            {consultation.transactionId && (
              <>
                <Text style={styles.label}>ID транзакции:</Text>
                <Text style={styles.value}>{consultation.transactionId}</Text>
              </>
            )}

            <Text style={styles.label}>ID пользователя:</Text>
            <Text style={styles.value}>{consultation.userId}</Text>

            <Text style={styles.label}>ID консультации:</Text>
            <Text style={styles.value}>{consultation.consultationId}</Text>
          </Card.Content>
          <Card.Actions>
            {hasBackup ? (
              <Button mode="contained" onPress={handleRestoreBackup}>
                Восстановить из резервной копии
              </Button>
            ) : (
              <Button mode="outlined" onPress={handleCreateBackup}>
                Сохранить резервную копию
              </Button>
            )}
          </Card.Actions>
        </Card>
        {documents.map(doc => (
          <>
            <Text style={styles.sectionTitle}>Связанные документы</Text>
            <DocumentCard key={doc.id} document={doc} />
          </>
        ))}
      </ScrollView>
    </Layout>
  );
};

export default ConsultationViewScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dataText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#444',
  },
  value: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    color: '#222',
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
