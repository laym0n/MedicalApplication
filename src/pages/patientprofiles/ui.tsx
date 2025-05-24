import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { PatientProfile } from '@shared/db/entity/patientprofile';
import { usePatientProfileModel } from '@shared/model/patientprofilemodel';
import Layout from '@widget/layout/ui';
import React, {useCallback, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PatientProfileCard: React.FC<{patientProfile: PatientProfile, onDelete: (id: number) => void}> = ({patientProfile, onDelete}) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(() => navigation.navigate('PatientProfileView', { patientProfileId: patientProfile.id }), [patientProfile.id, navigation]);
  const handleDeletePress = useCallback(() => {
    onDelete(patientProfile.id);
  }, [onDelete, patientProfile.id]);
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{patientProfile.name}</Text>
      <Text style={styles.cardText}>{patientProfile.allergies}</Text>
      <Button title="Просмотр" onPress={handleViewPress} />
      <Button title="Удалить" onPress={handleDeletePress} />
    </View>
  );
};

const PatientProfilesScreen = () => {
  const navigation = useNavigation();
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
  const loadDocuments = useCallback(() => {
    PatientProfile.find().then(loadedPatientProfiles => setPatientProfiles(loadedPatientProfiles));
  }, []);
  useFocusEffect(loadDocuments);

  const handleAddNewPatientProfile = useCallback(
    () => navigation.navigate('PatientProfileAdd'),
    [navigation],
  );

  const {deleteById} = usePatientProfileModel();

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {patientProfiles.map(patientProfile => <PatientProfileCard key={patientProfile.id} patientProfile={patientProfile} onDelete={deleteById}/>)}
        </ScrollView>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText} onPress={handleAddNewPatientProfile}>
            Добавить новый медицинский профиль
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

export default PatientProfilesScreen;
