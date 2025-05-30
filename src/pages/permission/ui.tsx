import React, { useEffect, useState } from 'react';
import { Text, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Permission } from '@shared/db/entity/permission';
import { formatDate } from '@shared/util/data-form';
import DocumentCard from '@widget/DocumentCard';
import ConsultationCard from '@widget/ConsultationCard';
import PatientProfileCard from '@widget/PatientProfileCard';

const PermissionViewScreen = () => {
  const route = useRoute();
  const { permissionId } = route.params as { permissionId: string };

  const [permission, setPermission] = useState<Permission | null>(null);

  useEffect(() => {
    Permission.findOne({
      where: { id: permissionId },
      relations: ['documents', 'patientProfiles', 'consultations'],
    }).then(setPermission);
  }, [permissionId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Дата выдачи доступа:</Text>
        <Text style={styles.value}>{formatDate(permission?.createdAt)}</Text>

        <Text style={styles.label}>Доступ до:</Text>
        <Text style={styles.value}>
          {formatDate(permission?.endDate || permission?.createdAt)}
        </Text>
      </View>

      {!!permission?.documents?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Документы</Text>
          {permission.documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc}/>
          ))}
        </View>
      )}

      {!!permission?.patientProfiles?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Профили пациентов</Text>
          {permission.patientProfiles.map((profile) => (
            <PatientProfileCard key={profile.id} patientProfile={profile}  />
          ))}
        </View>
      )}

      {!!permission?.consultations?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Консультации</Text>
          {permission.consultations.map((consultation) => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
});

export default PermissionViewScreen;
