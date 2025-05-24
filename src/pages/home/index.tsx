import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DocumentsScreen from '@pages/documents/ui';
import ConsultationsScreen from '@pages/consultations/ui';
import PatientProfilesScreen from '@pages/patientprofiles/ui';

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC<{}> = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Consultations" component={ConsultationsScreen} />
      <Tab.Screen name="PatientProfiles" component={PatientProfilesScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen;
