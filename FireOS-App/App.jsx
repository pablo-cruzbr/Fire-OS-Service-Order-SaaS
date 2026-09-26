import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { colors } from './src/theme/colors';

export default function App(){
    return(
        <AuthProvider>
      <NavigationContainer>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" translucent={false} />
        <Routes />
      </NavigationContainer>
    </AuthProvider>
    )
}
