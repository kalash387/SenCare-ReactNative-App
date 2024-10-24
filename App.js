import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/Login'; // Make sure this is correctly named and imported
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PatientList from './components/PatientList'; // Ensure the path is correct
import PatientDetails from './components/PatientDetails'; // Import PatientDetails

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
