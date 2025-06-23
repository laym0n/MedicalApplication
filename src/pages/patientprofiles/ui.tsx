import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PatientProfile } from '@shared/db/entity/patientprofile';
import { usePatientProfileModel } from '@shared/model/patientprofilemodel';
import Layout from '@widget/layout/ui';
import PatientProfileCard from '@widget/PatientProfileCard';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const {deleteById} = usePatientProfileModel();
  const handleDeleteById = useCallback(async (patientProfileId: string) => {
    await deleteById(patientProfileId);
    await loadDocuments();
  }, [deleteById, loadDocuments]);

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {patientProfiles.map(profile => (
            <PatientProfileCard key={profile.id} patientProfile={profile} onDelete={handleDeleteById} />
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
