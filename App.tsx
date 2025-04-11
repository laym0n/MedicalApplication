import { AxiosContext } from '@app/constants';
import { LoginScreen } from '@pages/auth/ui';
import DocumentsScreen from '@pages/documents/ui';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import './ReactotronConfig';

const Stack = createStackNavigator();
const queryClient = new QueryClient();
const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:8081',
  withCredentials: true,
});

function App(): React.JSX.Element {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AxiosContext.Provider value={axiosInstance}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Documents">
              <Stack.Screen name="Documents" component={DocumentsScreen} />
              <Stack.Screen name="Auth" component={LoginScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AxiosContext.Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
