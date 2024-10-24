import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function PatientList({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All"); // State to store the filter condition
  const [patientsData, setPatientsData] = useState([]); // State for fetched data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch patients data from API
  useEffect(() => {
    fetch("http://localhost:3000/patients")
      .then((response) => response.json())
      .then((data) => {
        setPatientsData(data); // Set the fetched data
        setLoading(false); // Stop loading
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Filter patients based on search query and filter condition (Normal/Critical/All)
  const filteredPatients = patientsData
    .filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.includes(searchQuery)
    )
    .filter((patient) =>
      filter === "All" ? true : patient.condition === filter
    );

  const handlePatientPress = (patientId) => {
    navigation.navigate("PatientDetails", { patientId });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or ID"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "All" ? styles.activeFilter : null,
          ]}
          onPress={() => setFilter("All")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "Normal" ? styles.activeFilter : null,
          ]}
          onPress={() => setFilter("Normal")}
        >
          <Text style={styles.filterText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "Critical" ? styles.activeFilter : null,
          ]}
          onPress={() => setFilter("Critical")}
        >
          <Text style={styles.filterText}>Critical</Text>
        </TouchableOpacity>
      </View>

      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => alert("Navigate to Add Patient Screen")}
      >
        <Text style={styles.addButtonText}>Add Patient</Text>
      </TouchableOpacity>

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.condition === "Critical"
                ? styles.criticalCard
                : styles.normalCard,
              item.condition === "Critical"
                ? styles.criticalBorder
                : styles.normalBorder,
            ]}
            onPress={() => handlePatientPress(item.id)}
          >
            <Text
              style={[
                styles.cardTitle,
                item.condition === "Critical"
                  ? styles.criticalText
                  : styles.normalText,
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.cardCondition,
                item.condition === "Critical"
                  ? styles.criticalText
                  : styles.normalText,
              ]}
            >
              {item.condition}
            </Text>
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
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  criticalCard: {
    backgroundColor: "#ffcccc",
  },
  normalCard: {
    backgroundColor: "#cce5ff",
  },
  criticalBorder: {
    borderWidth: 2,
    borderColor: "red",
  },
  normalBorder: {
    borderWidth: 0,
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
  },
  cardCondition: {
    marginTop: 5,
    fontSize: 16,
  },
});
