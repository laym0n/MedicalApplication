import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DocumentsScreen from '@pages/documents/ui';
import ConsultationsScreen from '@pages/consultations/ui';

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC<{}> = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Consultations" component={ConsultationsScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen;
