import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import the Picker component

export default function AddPatient({ navigation, route }) {
  const { onPatientAdded } = route.params; // Get the callback from the params
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle the form submission
  const handleAddPatient = async () => {
    if (!name || !condition || !age || !contact) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const patientData = {
      name: name,
      condition: condition,
      age: age,
      contact: contact,
    };

    setLoading(true);

    try {
      const response = await fetch("https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const result = await response.json();

      if (result?.status === "success") {
        Alert.alert("Success", "Patient added successfully!");
        onPatientAdded(); // Refresh the patient list
        navigation.goBack(); // Navigate back to the patient list screen
      } else {
        Alert.alert("Error", "Failed to add patient. Please try again.");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Patient</Text>

      {/* Patient Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        value={name}
        onChangeText={setName}
      />

      {/* Condition Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={condition}
          onValueChange={(itemValue) => setCondition(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Condition" value="" />
          <Picker.Item label="Critical" value="Critical" />
          <Picker.Item label="Normal" value="Normal" />
        </Picker>
      </View>

      {/* Age Input */}
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      {/* Contact Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={contact}
        onChangeText={setContact}
      />

      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddPatient}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Patient</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});