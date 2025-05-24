import React, {useEffect, useState} from 'react';
import {Text, ScrollView, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {usePatientProfileModel} from '@shared/model/patientprofilemodel';
import {PatientProfile} from '@shared/db/entity/patientprofile';

const PatientProfileViewScreen = () => {
  const route = useRoute();
  const {patientProfileId} = route.params as {patientProfileId: number};

  const [patientProfile, setPatientProfile] = useState<
    PatientProfile | undefined
  >(undefined);
  const {getById} = usePatientProfileModel();
  useEffect(() => {
    getById(patientProfileId).then(setPatientProfile);
  }, [getById, patientProfileId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Наименование профиля:</Text>
      <Text style={styles.value}>{patientProfile?.name}</Text>

      <Text style={styles.label}>Пол:</Text>
      <Text style={styles.value}>{patientProfile?.gender}</Text>

      <Text style={styles.label}>Дата рождения:</Text>
      <Text style={styles.value}>
        {patientProfile?.birthDate
          ? patientProfile?.birthDate
          : '—'}
      </Text>

      <Text style={styles.label}>Социальный статус:</Text>
      <Text style={styles.value}>{patientProfile?.socialStatus}</Text>

      <Text style={styles.label}>Группа инвалидности:</Text>
      <Text style={styles.value}>{patientProfile?.disabilityGroup}</Text>

      <Text style={styles.label}>Хронические заболевания:</Text>
      <Text style={styles.value}>{patientProfile?.chronicConditions}</Text>

      <Text style={styles.label}>Медикаменты:</Text>
      <Text style={styles.value}>{patientProfile?.medications}</Text>

      <Text style={styles.label}>Аллергии:</Text>
      <Text style={styles.value}>{patientProfile?.allergies}</Text>

      <Text style={styles.label}>Заметки о стиле жизни:</Text>
      <Text style={styles.value}>{patientProfile?.lifestyleNotes}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default PatientProfileViewScreen;
