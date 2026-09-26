import React, { useContext } from 'react';

import {View, ActivityIndicator} from 'react-native';

import AppRoutes from './appRoutes';
import AuthRoutes from './authroutes';
import { AuthContext } from "../contexts/AuthContext";
import { colors } from "../theme/colors";

function Routes(){
const {isAuthenticated} = useContext(AuthContext)
const loading = false;
 if (loading) {
    return (
      <View 
        style={{
          flex: 1,
          backgroundColor: colors.link,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={60} color={colors.white} />
      </View>
    );
  }

return(
    isAuthenticated ? <AppRoutes/> : <AuthRoutes/>    
)
}

export default Routes;
