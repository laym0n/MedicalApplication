import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import { formatDate } from '@shared/util/data-form';
import Layout from '@widget/layout/ui';
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Card, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ConsultationCard: React.FC<{
  consultation: Consultation;
}> = ({consultation}) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(() => {
    navigation.navigate('ConsultationView', {
      consultationId: consultation.id,
    });
  }, [consultation.id, navigation]);

  return (
    <Card style={styles.card} mode="outlined" onPress={handleViewPress}>
      <Card.Title
        title={consultation.specialization}
        subtitle={formatDate(consultation.createdAt)}
        left={props => (
          <Icon
            {...props}
            name="stethoscope"
            size={32}
            color="#007AFF"
            style={{marginLeft: 8}}
          />
        )}
      />
      <Card.Actions>
        <Button onPress={handleViewPress}>Просмотр</Button>
      </Card.Actions>
    </Card>
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
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  transactionLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default ConsultationsScreen;
