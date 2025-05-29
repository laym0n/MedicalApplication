import { useRoute } from '@react-navigation/native';
import { Consultation } from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useConsultationModel } from '@shared/model/consultationmodel';

interface ConsultationProps {
  consultationId: string;
}

const ConsultationViewScreen = () => {
  const route = useRoute();
  const { consultationId } = route.params as ConsultationProps;

  const [consultation, setConsultation] = useState<Consultation | undefined>(undefined);
  const { getById } = useConsultationModel();

  useEffect(() => {
    getById(consultationId).then(setConsultation);
  }, [consultationId, getById]);

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
        </Card>
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
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
