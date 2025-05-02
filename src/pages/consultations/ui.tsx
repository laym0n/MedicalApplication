import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import Layout from '@widget/layout/ui';
import React, {useCallback, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ConsultationCard: React.FC<{
  consultation: Consultation;
}> = ({consultation}) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(
    () =>
      navigation.navigate('ConsultationView', {
        consultationId: consultation.id,
      }),
    [consultation.id, navigation],
  );
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{consultation.transactionId}</Text>
      <Button title="Просмотр" onPress={handleViewPress} />
    </View>
  );
};

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

export default ConsultationsScreen;
