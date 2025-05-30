import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Permission } from '@shared/db/entity/permission';
import { formatDate } from '@shared/util/data-form';
import Layout from '@widget/layout/ui';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

const PermissionCard: React.FC<{ permission: Permission }> = ({ permission }) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(() => {
    navigation.navigate('PermissionView', { permissionId: permission.id });
  }, [navigation, permission.id]);

  return (
    <TouchableOpacity onPress={handleViewPress} style={styles.card} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.userName}>
          {permission.userName || 'Имя неизвестно'}
        </Text>
        <Text style={styles.userId}>{permission.userId.toLowerCase()}</Text>
      </View>

      <View style={styles.metaSection}>
        <Text style={styles.metaLabel}>Дата выдачи:</Text>
        <Text style={styles.metaValue}>{formatDate(permission.createdAt)}</Text>
      </View>

      <View style={styles.metaSection}>
        <Text style={styles.metaLabel}>Доступ до:</Text>
        <Text style={styles.metaValue}>
          {formatDate(permission.endDate || permission.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const PermissionsScreen = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const loadPermissions = useCallback(() => {
    Permission.find().then(setPermissions);
  }, []);

  useFocusEffect(loadPermissions);

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {permissions.map((permission) => (
          <PermissionCard key={permission.id} permission={permission} />
        ))}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  header: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  userId: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
    textTransform: 'lowercase',
  },
  metaSection: {
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#666',
  },
  metaValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PermissionsScreen;
