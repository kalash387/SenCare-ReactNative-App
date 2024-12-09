import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Feather';


export default function PatientList({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // State to track which patient is being deleted

  // Fetch patients data from API
  const fetchPatients = () => {
    setLoading(true);

    fetch("https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients")
      .then((response) => response.json())
      .then((data) => {
        setPatientsData(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
        Alert.alert("Error", "There was an issue fetching the data. Please try again later.");
      });
  };


  // Use useFocusEffect to fetch data when the component regains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPatients();
    }, [])
  );

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patientsData
    .filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient._id.toString().includes(searchQuery)) // Convert id to string before calling includes
    )
    .filter((patient) => (filter === "All" ? true : patient.condition === filter));

  const handlePatientPress = (patientId) => {
    navigation.navigate("PatientDetails", { patientId });
  };

  const handleEditPatient = (patient) => {
    navigation.navigate("EditPatient", {
      patientId: patient._id,
      patientData: patient,
      onPatientUpdated: fetchPatients,
    });
  };

  const handleAddPatient = () => {
    navigation.navigate("AddPatient", { onPatientAdded: fetchPatients });
  };

  const handleSearchSubmit = () => {
    // Optional: Handle search submission behavior if needed (e.g., focus out of the input).
  };

  const handleDeletePatient = (patientId) => {
    setDeleting(patientId); // Set the deleting state to track which patient is being deleted

    // Call delete API to remove the patient
    fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        setDeleting(null); // Reset the deleting state after the deletion completes
        Alert.alert("Success", "Patient deleted successfully.");
        fetchPatients();  // Refresh the patient list
      })
      .catch((error) => {
        setDeleting(null); // Reset the deleting state if an error occurs
        console.error("Error deleting patient:", error);
        Alert.alert("Error", "There was an issue deleting the patient. Please try again later.");
      });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loader" size={50} color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or ID"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchSubmit}  // Allows pressing enter to submit
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "All" ? styles.activeFilter : null]}
          onPress={() => setFilter("All")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "Normal" ? styles.activeFilter : null]}
          onPress={() => setFilter("Normal")}
        >
          <Text style={styles.filterText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "Critical" ? styles.activeFilter : null]}
          onPress={() => setFilter("Critical")}
        >
          <Text style={styles.filterText}>Critical</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
        <Text style={styles.addButtonText}>Add Patient</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item?._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.condition === "Critical" ? styles.criticalCard : styles.normalCard]}
            onPress={() => handlePatientPress(item._id)}
          >
            <Text style={[styles.cardTitle, item.condition === "Critical" ? styles.criticalText : styles.normalText]}>
              {item.name}
            </Text>
            <Text style={[styles.cardCondition, item.condition === "Critical" ? styles.criticalText : styles.normalText]}>
              {item.condition}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditPatient(item)}>
              <Icon name="edit" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePatient(item._id)}
              disabled={deleting === item._id} // Disable button if deleting this patient
            >
              {deleting === item._id ? (
                <Icon name="loader" size={20} color="#fff" />
              ) : (
                <Icon name="trash" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: 'flex-start',
  },
  searchBar: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#007bff",
  },
  filterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: "#fff",
    width: "100%",
  },
  criticalCard: {
    backgroundColor: "#ffcccc",
  },
  normalCard: {
    backgroundColor: "#cce5ff",
  },
  criticalText: {
    color: "red",
  },
  normalText: {
    color: "#333",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardCondition: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f5f5f5",  // Optional: background color for the loading state
  },
  editButton: {
    position: "absolute",
    top: 10,
    left: 10, // Positioning the edit button on the left side
    padding: 10,
    backgroundColor: "#007bff", // Blue for visibility
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "#ff4136", // Red for delete
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});