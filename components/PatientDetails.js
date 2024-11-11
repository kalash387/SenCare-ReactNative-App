import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";

// BasicInfo Component
const BasicInfo = ({ patient }) => (
  <View
    style={[
      styles.infoContainer,
      patient.condition === "Critical"
        ? styles.criticalBorder
        : styles.normalBorder,
    ]}
  >
    <View style={styles.photoContainer}>
    <Image source={require(`../assets/patient1.png`)} style={styles.photo} />
    </View>
    <View style={styles.detailsContainer}>
      <Text style={styles.infoText}>Name: {patient.name}</Text>
      <Text style={styles.infoText}>Age: {patient.age}</Text>
      <Text style={styles.infoText}>ID: {patient.id}</Text>
      <Text style={styles.infoText}>Contact: {patient.contact}</Text>
      <Text style={styles.infoText}>Condition: {patient.condition}</Text>
    </View>
  </View>
);

// ClinicalData Component
const ClinicalData = ({ patientId }) => {
  const [clinicalData, setClinicalData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newData, setNewData] = useState({
    date: "",
    type: "",
    value: "",
    condition: "",
  });

  useEffect(() => {
    fetch(`http://192.168.2.18:3000/patients/${patientId}/clinical-data`)
      .then((response) => response.json())
      .then((data) => {
        setClinicalData(data?.data);
      })
      .catch((error) => console.error("Error fetching clinical data:", error));
  }, [patientId]);

  const addClinicalData = () => {
    if (newData.date && newData.type && newData.value && newData.condition) {
  
      fetch(`http://192.168.2.18:3000/patients/${patientId}/clinical-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })
        .then((response) => response.json())
        .then((data) => {          
          setClinicalData((prevData) => [...prevData, ...data?.data?.clinicalData]);
          setNewData({ date: "", type: "", value: "", condition: "" });
          setModalVisible(false);
        })
        .catch((error) => console.error("Error adding clinical data:", error));
    } else {
      Alert.alert("Please fill all fields");
    }
  };
  

  return (
    <View style={styles.clinicalDataContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Date/Time</Text>
        <Text style={styles.headerText}>Test Type</Text>
        <Text style={styles.headerText}>Reading</Text>
        <Text style={styles.headerText}>Condition</Text>
      </View>

      <FlatList
        data={clinicalData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.dataRow}>
            <Text style={styles.dataText}>{item.date}</Text>
            <Text style={styles.dataText}>{item.type}</Text>
            <Text style={styles.dataText}>{item.value}</Text>
            <Text style={styles.dataText}>{item.condition}</Text>
          </View>
        )}
      />


      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Clinical Data</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Clinical Data</Text>
          <TextInput
            placeholder="Date/Time"
            value={newData.date}
            onChangeText={(text) => setNewData({ ...newData, date: text })}
            style={styles.input}
            placeholderTextColor="#aaa" // Add this line
          />
          <TextInput
            placeholder="Test Type"
            value={newData.type}
            onChangeText={(text) => setNewData({ ...newData, type: text })}
            style={styles.input}
            placeholderTextColor="#aaa" // Add this line
          />
          <TextInput
            placeholder="Reading"
            value={newData.value}
            onChangeText={(text) => setNewData({ ...newData, value: text })}
            style={styles.input}
            placeholderTextColor="#aaa" // Add this line
          />
          <TextInput
            placeholder="Condition"
            value={newData.condition}
            onChangeText={(text) => setNewData({ ...newData, condition: text })}
            style={styles.input}
            placeholderTextColor="#aaa" // Add this line
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={addClinicalData}
            >
              <Text style={styles.cancelButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// PatientDetails Component
const PatientDetails = ({ route }) => {
  const { patientId } = route.params;
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    fetch(`http://192.168.2.18:3000/patients/${patientId}`)
      .then((response) => response.json())
      .then((data) => {
        setPatientData(data?.data);
      })
      .catch((error) => console.error("Error fetching patient data:", error));
  }, [patientId]);
  

  const [activeTab, setActiveTab] = useState("Basic Info");

  if (!patientData) {
    return <Text>Loading patient details...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Basic Info" && styles.activeTab]}
          onPress={() => setActiveTab("Basic Info")}
        >
          <Text style={styles.tabText}>Basic Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Clinical Data" && styles.activeTab]}
          onPress={() => setActiveTab("Clinical Data")}
        >
          <Text style={styles.tabText}>Clinical Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "Basic Info" ? (
          <BasicInfo patient={patientData} />
        ) : (
          <ClinicalData patientId={patientId} />
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#e0e0e0",
  },
  tabText: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  infoContainer: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "transparent",
    marginVertical: 10,
    borderWidth: 2,
  },
  criticalBorder: {
    borderColor: "#f44336", // Red for Critical
  },
  normalBorder: {
    borderColor: "#cce5ff", // Light Blue for normal condition
  },
  photoContainer: {
    width: 160,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
  },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  clinicalDataContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    justifyContent: "space-between",
    borderRadius: 5,
  },
  headerText: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  dataRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderRadius: 5,
  },
  dataText: {
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    color: "#000", // Make sure text color is dark enough
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});


export default PatientDetails;
