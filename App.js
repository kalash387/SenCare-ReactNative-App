import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/Login';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import AddPatient from './components/AddPatient';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'SenCare Login' }} />

        {/* Patient List Screen */}
        <Stack.Screen name="PatientList" component={PatientList} options={{ title: 'Patients' }} />

        {/* Patient Details Screen */}
        <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ title: 'Patient Details' }} />

        {/* Add Patient Screen */}
        <Stack.Screen name="AddPatient" component={AddPatient} options={{ title: 'Add Patient' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
