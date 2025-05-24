import {useRoute} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { useConsultationModel } from '@shared/model/consultationmodel';

interface ConsultationProps {
  consultationId: number;
}

const ConsultationViewScreen = () => {
  const route = useRoute();
  const {consultationId} = route.params as ConsultationProps;

  const [consultation, setConsultation] = useState<Consultation | undefined>(undefined);
  const {getById} = useConsultationModel();

  useEffect(() => {
    getById(consultationId)
      .then(setConsultation);
  }, [consultationId, getById]);

  return (
    <Layout>
      <View style={styles.container}>
        <Text>{consultation?.data}</Text>
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
