import {useFocusEffect} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import ConsultationCard from '@widget/ConsultationCard';
import Layout from '@widget/layout/ui';
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

const ConsultationsScreen = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const loadConsultations = useCallback(() => {
    Consultation.find().then(newConsultations =>
      setConsultations(newConsultations),
    );
  }, []);
  useFocusEffect(loadConsultations);

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {consultations.map(consultation => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
});

export default ConsultationsScreen;
