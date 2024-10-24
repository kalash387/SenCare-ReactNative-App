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
import axios from "axios";

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
      <Image source={{ uri: patient.photo }} style={styles.photo} />
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

const ClinicalData = ({ patientId }) => {
  const [clinicalData, setClinicalData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newData, setNewData] = useState({
    dateTime: "",
    testType: "",
    reading: "",
    condition: "",
  });

  useEffect(() => {
    // Fetch clinical data from an API based on patientId
    axios
      .get(`https://localhost:3000/patients/${patientId}/clinical-data`)
      .then((response) => {
        setClinicalData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching clinical data:", error);
      });
  }, [patientId]);

  const addClinicalData = () => {
    if (
      newData.dateTime &&
      newData.testType &&
      newData.reading &&
      newData.condition
    ) {
      axios
        .post(`https://api.example.com/patients/${patientId}/clinical-data`, newData)
        .then((response) => {
          setClinicalData([...clinicalData, response.data]);
          setNewData({ dateTime: "", testType: "", reading: "", condition: "" });
          setModalVisible(false);
        })
        .catch((error) => {
          console.error("Error adding clinical data:", error);
        });
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
            <Text style={styles.dataText}>{item.dateTime}</Text>
            <Text style={styles.dataText}>{item.testType}</Text>
            <Text style={styles.dataText}>{item.reading}</Text>
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
            value={newData.dateTime}
            onChangeText={(text) => setNewData({ ...newData, dateTime: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Test Type"
            value={newData.testType}
            onChangeText={(text) => setNewData({ ...newData, testType: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Reading"
            value={newData.reading}
            onChangeText={(text) => setNewData({ ...newData, reading: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Condition"
            value={newData.condition}
            onChangeText={(text) => setNewData({ ...newData, condition: text })}
            style={styles.input}
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

const PatientDetails = ({ route }) => {
  const { patientId } = route.params;
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    // Fetch patient data from an API
    axios
      .get(`https://localhost:3000/patients/${patientId}`)
      .then((response) => {
        setPatientData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching patient data:", error);
      });
  }, [patientId]);

  const [activeTab, setActiveTab] = useState("Basic Info");

  if (!patientData) {
    return <Text>Loading patient details...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Basic Info" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Basic Info")}
        >
          <Text style={styles.tabText}>Basic Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Clinical Data" && styles.activeTab,
          ]}
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
    height: "auto",
    borderWidth: 2,
    borderBlockColor: "#444",
  },
  criticalBorder: {
    borderColor: "#444",
  },
  normalBorder: {
    borderColor: "#cce5ff",
  },
  photoContainer: {
    width: 160,
    height: "auto",
    marginRight: 10,
    borderBlockColor: "#4c4c4c",
    borderWidth: 1,
  },
  detailsContainer: {
    flex: 1,
    padding: 10,
  },
  photo: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
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
    paddingHorizontal: 5,
    justifyContent: "space-between",
    borderRadius: 5,
    marginBottom: 10,
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
    borderBottomColor: "#ccc",
    justifyContent: "space-between",
    borderRadius: 5,
  },
  dataText: {
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PatientDetails;
