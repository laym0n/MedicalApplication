import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DocumentsScreen from '@pages/documents/ui';
import ConsultationsScreen from '@pages/consultations/ui';
import PatientProfilesScreen from '@pages/patientprofiles/ui';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({_, color, size}) => {
          let iconName = 'circle-outline';

          if (route.name === 'Documents') {
            iconName = 'file-document-outline';
          } else if (route.name === 'Consultations') {
            iconName = 'stethoscope';
          } else if (route.name === 'PatientProfiles') {
            iconName = 'account-group-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Consultations" component={ConsultationsScreen} />
      <Tab.Screen name="PatientProfiles" component={PatientProfilesScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen;
