import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { Permission } from '@shared/db/entity/permission';
import Layout from '@widget/layout/ui';
import React, {useCallback, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const PermissionCard: React.FC<{
  permission: Permission;
}> = ({permission}) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(
    () =>
      navigation.navigate('PermissionView', {
        permissionId: permission.id,
      }),
    [navigation, permission.id],
  );
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{permission.id}</Text>
      <Button title="Просмотр" onPress={handleViewPress} />
    </View>
  );
};

const PermissionsScreen = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const loadPermissions = useCallback(() => {
    Permission.find().then(newPermissions =>
      setPermissions(newPermissions),
    );
  }, []);
  useFocusEffect(loadPermissions);

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {permissions.map(permission => (
            <PermissionCard key={permission.id} permission={permission} />
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

export default PermissionsScreen;
