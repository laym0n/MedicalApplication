import {AxiosContext, axiosInstance} from '@app/context/httpclient';
import {LoginScreen} from '@pages/auth/ui';
import DocumentsScreen from '@pages/documents/ui';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import './ReactotronConfig';
import ErrorBoundary from 'react-native-error-boundary';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <React.StrictMode>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
