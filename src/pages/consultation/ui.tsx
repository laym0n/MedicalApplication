import {useRoute} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useGetConsultation} from './api';
import {useCurrentUserProfileContext} from '@app/context/profilecontext';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

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
  const currentUserContext = useCurrentUserProfileContext();

  useEffect(() => {
    async function LoadConsultation() {
      const consultation = await Consultation.findOneBy({id: consultationId});
      if (!consultation) {
        return;
      }
      const {prescription: encryptedPrescription} = await getConsultationAsync(
        consultation.transactionId,
      );
      if (!encryptedPrescription) {
        return;
      }
      const newDecryptedPrescription = CryptoJS.AES.decrypt(
        encryptedPrescription,
        currentUserContext!.masterKey!,
      ).toString(CryptoJS.enc.Utf8);
      setDecryptedPrescription(newDecryptedPrescription);
    }
    LoadConsultation();
  }, [consultationId, currentUserContext, getConsultationAsync]);

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
