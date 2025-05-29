import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PatientProfile } from '@shared/db/entity/patientprofile';
import Layout from '@widget/layout/ui';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PatientProfileCard: React.FC<{ patientProfile: PatientProfile }> = ({ patientProfile }) => {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate('PatientProfileView', { patientProfileId: patientProfile.id });
  }, [navigation, patientProfile.id]);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.cardText}>{patientProfile.name}</Text>
    </TouchableOpacity>
  );
};

const PatientProfilesScreen = () => {
  const navigation = useNavigation();
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);

  const loadDocuments = useCallback(() => {
    PatientProfile.find().then(setPatientProfiles);
  }, []);

  useFocusEffect(loadDocuments);

  const handleAddNewPatientProfile = useCallback(
    () => navigation.navigate('PatientProfileAdd'),
    [navigation],
  );

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {patientProfiles.map(profile => (
            <PatientProfileCard key={profile.id} patientProfile={profile} />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={handleAddNewPatientProfile}>
          <Text style={styles.addButtonText}>Добавить новый медицинский профиль</Text>
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
  cardsContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PatientProfilesScreen;
