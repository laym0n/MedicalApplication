import React, {useEffect, useState} from 'react';
import {Text, ScrollView, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {Permission} from '@shared/db/entity/permission';

const PermissionViewScreen = () => {
  const route = useRoute();
  const {permissionId} = route.params as {permissionId: string};

  const [permission, setPermission] = useState<Permission | null>(null);
  useEffect(() => {
    Permission.findOne({
      where: {id: permissionId},
      relations: ['documents', 'patientProfiles', 'consultations'],
    }).then(setPermission);
  }, [permissionId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Дата выдачи доступа:</Text>
      <Text style={styles.value}>{permission?.createdAt.toString()}</Text>

      <Text style={styles.label}>Дата выдачи завершения:</Text>
      <Text style={styles.value}>{permission?.endDate?.toString()}</Text>

      {permission?.documents?.map(document => (
        <>
          <Text style={styles.label}>Документ:</Text>
          <Text style={styles.value}>{document.name}</Text>
        </>
      ))}
      {permission?.patientProfiles?.map(patientProfile => (
        <>
          <Text style={styles.label}>Медицинский профиль:</Text>
          <Text style={styles.value}>{patientProfile.name}</Text>
        </>
      ))}
      {permission?.consultations?.map(consultation => (
        <>
          <Text style={styles.label}>Результат встречи:</Text>
          <Text style={styles.value}>{consultation.id}</Text>
        </>
      ))}
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

export default PermissionViewScreen;
