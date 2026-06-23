import React, {useState, useContext}from 'react';
import Signin from './src/pages/Signin' ;
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes';
import { 
    Text, 
    View, 
    StyleSheet, 
    Image, 
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App(){
    return(
        <AuthProvider> 
      <NavigationContainer>
        <StatusBar backgroundColor="#1d1d1d" barStyle="light-content" translucent={false} />
        <Routes />
      </NavigationContainer>
    </AuthProvider>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0F1431"
    },
    text:{
        fontSize: 18,
        color: '#FFFF'
    },
    logo: {
        width: 280,
        height: 100,     
        resizeMode: 'contain', 
        marginBottom: 18,
      },
      
    inputContainer:{
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
       paddingVertical:3        
    },
    input:{
        width: '95%',
        height: 40,
        backgroundColor: '#101026',
        marginBottom: 12,
        borderRadius: 4,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#FFFF'

    },
    button:{
        width:'95%',
        height: 40,
        backgroundColor: '#3fffa3',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 17
    },
    buttonText:{
        color: '#FFFFF',
        fontSize: 17,
        fontWeight: 700
    },
    message:{
        color: '#FF3F4B',
        marginBottom: 10,
        fontWeight: 'bold',
    }
})