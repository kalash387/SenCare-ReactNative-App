import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import the Picker component

export default function EditPatient({ route, navigation }) {
    const { patientId, patientData, onPatientUpdated } = route.params;
    const [name, setName] = useState(patientData.name);
    const [condition, setCondition] = useState(patientData.condition);
    const [contact, setContact] = useState(patientData.contact);
    const [age, setAge] = useState(patientData.age.toString());
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);

        const updatedPatient = { ...patientData, name, condition, contact, age };

        fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPatient),
        })
            .then((response) => response.json())
            .then((data) => {
                setLoading(false); // End loading
                if (data.status === "success") {
                    onPatientUpdated();
                    navigation.goBack();
                } else {
                    Alert.alert("Error", "There was an issue updating the patient. Please try again.");
                }
            })
            .catch((error) => {
                setLoading(false); // End loading
                console.error("Error updating patient:", error);
                Alert.alert("Error", "There was an issue updating the patient. Please try again.");
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Patient</Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={condition}
                    onValueChange={(itemValue) => setCondition(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Critical" value="Critical" />
                    <Picker.Item label="Normal" value="Normal" />
                </Picker>
            </View>

            {/* Contact Input */}
            <TextInput
                style={styles.input}
                placeholder="Contact"
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
            />

            {/* Age Input */}
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#f4f4f9",
    },
    header: {
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
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 18,
        backgroundColor: "#fff",
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
    saveButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loadingContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -30 }, { translateY: -30 }],
    },
});