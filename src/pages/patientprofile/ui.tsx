import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { usePatientProfileModel } from '@shared/model/patientprofilemodel';
import { PatientProfile } from '@shared/db/entity/patientprofile';
import { Card, Text, Divider } from 'react-native-paper';

const formatValue = (value: string | undefined | null) => {
  return value?.trim() ? value : '—';
};

const formatGender = (gender: string | undefined) => {
  if (gender === 'MALE') return 'Мужской';
  if (gender === 'FEMALE') return 'Женский';
  return '—';
};

const PatientProfileViewScreen = () => {
  const route = useRoute();
  const { patientProfileId } = route.params as { patientProfileId: number };

  const [patientProfile, setPatientProfile] = useState<PatientProfile>();
  const { getById } = usePatientProfileModel();

  useEffect(() => {
    getById(patientProfileId).then(setPatientProfile);
  }, [getById, patientProfileId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={patientProfile?.name || 'Профиль пациента'} />
        <Card.Content>

          <InfoRow label="Пол" value={formatGender(patientProfile?.gender)} />
          <InfoRow label="Дата рождения" value={formatValue(patientProfile?.birthDate)} />
          <InfoRow label="Социальный статус" value={formatValue(patientProfile?.socialStatus)} />
          <InfoRow label="Группа инвалидности" value={formatValue(patientProfile?.disabilityGroup)} />
          <InfoRow label="Хронические заболевания" value={formatValue(patientProfile?.chronicConditions)} />
          <InfoRow label="Медикаменты" value={formatValue(patientProfile?.medications)} />
          <InfoRow label="Аллергии" value={formatValue(patientProfile?.allergies)} />
          <InfoRow label="Заметки о стиле жизни" value={formatValue(patientProfile?.lifestyleNotes)} />

        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
    <Divider style={styles.divider} />
  </>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 12,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginTop: 4,
  },
  divider: {
    marginTop: 12,
  },
});

export default PatientProfileViewScreen;
