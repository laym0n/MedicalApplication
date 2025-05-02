import {useRoute} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useGetConsultation} from './api';

interface ConsultationProps {
  consultationId: number;
}

const ConsultationViewScreen = () => {
  const route = useRoute();
  const {consultationId} = route.params as ConsultationProps;

  const [decryptedPrescription, setDecryptedPrescription] = useState<
    string | null
  >(null);

  const {mutateAsync: getConsultationAsync} = useGetConsultation();

  useEffect(() => {
    async function LoadConsultation() {
      const consultation = await Consultation.findOneBy({id: consultationId});
      if (!consultation) {
        return;
      }
      const {prescription} = await getConsultationAsync(
        consultation.transactionId,
      );
      if (!prescription) {
        return;
      }
      setDecryptedPrescription(prescription);
    }
    LoadConsultation();
  }, [consultationId, getConsultationAsync]);

  return (
    <Layout>
      <View style={styles.container}>
        <Text>{decryptedPrescription}</Text>
      </View>
    </Layout>
  );
};

export default ConsultationViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
});
