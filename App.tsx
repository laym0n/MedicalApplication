import '@app/config/DatabaseConfig';
import {initDatabase} from '@app/config/DatabaseConfig';
import '@app/config/ReactotronConfig';
import {AxiosContext, axiosInstance} from '@app/context/httpclient';
import { CurrentUserProfileContextProvider } from '@app/context/profilecontext';
import {LoginScreen} from '@pages/auth/ui';
import DocumentAddScreen from '@pages/documentadd/ui';
import HomeScreen from '@pages/home';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import 'reflect-metadata';

const Stack = createStackNavigator();
const queryClient = new QueryClient();
initDatabase();

function App(): React.JSX.Element {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AxiosContext.Provider value={axiosInstance}>
            <CurrentUserProfileContextProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen
                    name="DocumentAdd"
                    component={DocumentAddScreen}
                  />
                  <Stack.Screen name="Auth" component={LoginScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </CurrentUserProfileContextProvider>
          </AxiosContext.Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
