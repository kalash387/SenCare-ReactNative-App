import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

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
      const response = await fetch("http://192.168.2.18:3000/patients", {
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

      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Condition (Normal/Critical)"
        value={condition}
        onChangeText={setCondition}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={contact}
        onChangeText={setContact}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddPatient}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Adding..." : "Add Patient"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
