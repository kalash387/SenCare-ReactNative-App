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
  ActivityIndicator
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialIcons";


// BasicInfo Component
const BasicInfo = ({ patient }) => (
  <View
    style={[
      styles.card,
      patient.condition === "Critical" ? styles.criticalBorder : styles.normalBorder,
    ]}
  >
    <View style={styles.photoContainer}>
      <Image source={require("../assets/patient1.png")} style={styles.photo} />
    </View>
    <View style={styles.detailsContainer}>
      <Text style={styles.nameText}>{patient.name}</Text>
      <View style={styles.badgeContainer}>

      </View>
      <Text style={styles.infoText}>Age: {patient.age}</Text>
      <Text style={styles.infoText}>ID: {patient._id}</Text>
      <Text style={styles.infoText}>Contact: {patient.contact}</Text>
      <Text style={styles.infoText}>Condition: {patient.condition}</Text>

    </View>
  </View>
);

// ClinicalData Component
const ClinicalData = ({ patientId, patientData, updatePatientCondition }) => {
  const [clinicalData, setClinicalData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // New state to track edit mode
  const [newData, setNewData] = useState({
    date: "",
    type: "",
    value: "",
    condition: "",
    id: ""
  });
  const [overallCondition, setOverallCondition] = useState("Normal");
  const [loading, setLoading] = useState(true); // Track loading status

  const testWeights = {
    "Glucose Level": 0.3,
    "Heart Rate": 0.2,
    "Temperature": 0.2,
    "Respiratory Rate": 0.2,
    "Oxygen Saturation": 0.1,
  };

  const testTypes = ["Glucose Level", "Heart Rate", "Temperature", "Respiratory Rate", "Oxygen Saturation"];


  useEffect(() => {
    getClinicalData();
  }, [patientId]);

  useEffect(() => {
    if (clinicalData.length > 0) {
      const condition = determineOverallCondition(clinicalData);
      setOverallCondition(condition);
    }
  }, [clinicalData]);

  const getClinicalData = () => {
    setLoading(true); // Start loading when fetch begins
    fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}/clinical-data`)
      .then((response) => response.json())
      .then((data) => {
        setClinicalData(data?.data);
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching clinical data:", error);
        setLoading(false); // Stop loading in case of error
      });
  };

  const normalizeTestValue = (testType, value) => {
    const numericValue = parseFloat(value);

    switch (testType) {
      case "Glucose Level":
        return numericValue < 70 || numericValue > 180 ? 1 : 0;
      case "Heart Rate":
        return numericValue < 60 || numericValue > 100 ? 1 : 0;
      case "Temperature":
        return numericValue < 36.1 || numericValue > 37.5 ? 1 : 0;
      case "Respiratory Rate":
        return numericValue < 12 || numericValue > 20 ? 1 : 0;
      case "Oxygen Saturation":
        return numericValue < 90 ? 1 : 0;
      default:
        return 0;
    }
  };

  const calculateWeightedScore = (tests) => {
    let totalWeight = 0;
    let weightedSum = 0;

    tests.forEach(({ type, value }) => {
      const weight = testWeights[type] || 0;
      const normalizedScore = normalizeTestValue(type, value);
      weightedSum += normalizedScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const determineOverallCondition = (tests) => {
    const weightedScore = calculateWeightedScore(tests);
    return weightedScore >= 0.5 ? "Critical" : "Normal";
  };

  const handleEdit = (item) => {
    setNewData({
      date: item.date,
      type: item.type,
      value: item.value,
      condition: item.condition,
      id: item._id
    });
    setIsEditMode(true);
    setModalVisible(true);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}/clinical-data/${id}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (response.ok) {
                  getClinicalData(); // Refresh the data
                } else {
                  throw new Error("Failed to delete the entry.");
                }
              })
              .catch((error) => {
                console.error("Error deleting clinical data:", error);
              });
          },
        },
      ]
    );
  };

  const handleTestTypeChange = (selectedTest) => {
    setNewData((prevState) => ({
      ...prevState,
      type: selectedTest,
      condition: getConditionBasedOnTestAndValue(selectedTest, prevState.value),
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newData.date;
    setShowDatePicker(false);
    setNewData((prevState) => ({ ...prevState, date: currentDate.toISOString().split('T')[0] }));
  };

  const handleValueChange = (value) => {
    setNewData((prevState) => ({
      ...prevState,
      value,
      condition: getConditionBasedOnTestAndValue(prevState.type, value),
    }));
  };

  const getConditionBasedOnTestAndValue = (testType, value) => {
    if (!value) return "";

    const numericValue = parseFloat(value);

    switch (testType) {
      case "Glucose Level":
        if (numericValue < 70 || numericValue > 180) return "Critical";
        return "Normal";
      case "Heart Rate":
        if (numericValue < 60 || numericValue > 100) return "Critical";
        return "Normal";
      case "Temperature":
        if (numericValue < 36.1 || numericValue > 37.5) return "Critical";
        return "Normal";
      case "Respiratory Rate":
        if (numericValue < 12 || numericValue > 20) return "Critical";
        return "Normal";
      case "Oxygen Saturation":
        if (numericValue < 90) return "Critical";
        return "Normal";
      default:
        return "Normal";
    }
  };

  // const addClinicalData = () => {
  //   if (newData.date && newData.type && newData.value && newData.condition) {
  //     fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}/clinical-data`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(newData),
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         getClinicalData();
  //         setNewData({ date: "", type: "", value: "", condition: "" });
  //         setModalVisible(false);
  //       })
  //       .catch((error) => console.error("Error adding clinical data:", error));
  //   } else {
  //     Alert.alert("Please fill all fields");
  //   }
  // };


  const submitClinicalData = () => {
    if (newData.date && newData.type && newData.value && newData.condition) {
      const url = isEditMode
        ? `https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}/clinical-data/${newData.id}`
        : `https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}/clinical-data`;

      const method = isEditMode ? "PUT" : "POST"; // Change to PUT if editing

      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })
        .then((response) => response.json())
        .then((data) => {
          getClinicalData();
          setNewData({ date: "", type: "", value: "", condition: "" });
          setModalVisible(false);
          setIsEditMode(false); // Reset mode after submit
        })
        .catch((error) => console.error(isEditMode ? "Error editing clinical data:" : "Error adding clinical data:", error));
    } else {
      Alert.alert("Please fill all fields");
    }
  };


  useEffect(() => {
    // Call editPatient API whenever overallCondition changes
    if (overallCondition) {
      fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patientData.name,
          condition: overallCondition,
          contact: patientData.contact,
          age: patientData.age,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatePatientCondition(overallCondition)
        })
        .catch((error) => console.error("Error updating patient condition:", error));
    }
  }, [overallCondition]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" style={styles.activityIndicator} />
      </View>
    );
  }


  return (
    <View style={styles.clinicalDataContainer}>
      {clinicalData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Clinical Data Found</Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Test Type</Text>
            <Text style={styles.headerText}>Reading</Text>
            <Text style={styles.headerText}>Condition</Text>
            <Text style={styles.headerText}>Actions</Text>

          </View>

          <FlatList
            data={clinicalData}
            keyExtractor={(item) => item?._id}
            renderItem={({ item }) => (
              <View style={styles.dataRow}>
                <Text style={styles.dataText}>{formatToCustomDate(item.date)}</Text>
                <Text style={styles.dataText}>{item.type}</Text>
                <Text style={styles.dataText}>{item.value}</Text>
                <Text style={styles.dataText}>{item.condition}</Text>


                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Icon name="edit" size={24} color="#007bff" style={styles.icon} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteButton}>
                    <Icon name="delete" size={24} color="#dc3545" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      <View style={styles.emptyStateContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Clinical Data</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isEditMode ? "Edit Clinical Data" : "Add Clinical Data"}
          </Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              placeholder="Date"
              value={newData.date}
              style={styles.input}
              placeholderTextColor="#aaa"
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newData.date ? new Date(newData.date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Picker
            selectedValue={newData.type}
            style={[styles.input, { height: 50 }]}
            onValueChange={handleTestTypeChange}
          >
            {testTypes.map((testType, index) => (
              <Picker.Item label={testType} value={testType} key={index} />
            ))}
          </Picker>

          <TextInput
            placeholder="Reading"
            value={newData.value}
            onChangeText={handleValueChange}
            style={styles.input}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Condition"
            value={newData.condition}
            style={styles.input}
            placeholderTextColor="#aaa"
            editable={false}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitClinicalData}
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
  const [loading, setLoading] = useState(true); // Track loading status

  useEffect(() => {
    setLoading(true); // Start loading when fetch begins
    fetch(`https://sencare-cnebb2hzg0crhje9.canadacentral-01.azurewebsites.net/patients/${patientId}`)
      .then((response) => response.json())
      .then((data) => {
        setPatientData(data?.data);
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching patient data:", error);
        setLoading(false); // Stop loading in case of error
      });
  }, [patientId]);

  const [activeTab, setActiveTab] = useState("Basic Info");


  const updatePatientCondition = (newCondition) => {
    setPatientData((prevState) => ({ ...prevState, condition: newCondition }));
  };

  if (loading) {
    // Display the loading indicator while fetching
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" style={styles.activityIndicator} />
      </View>
    );
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
          <View style={{ flex: 1 }}>
            <BasicInfo patient={patientData} />
          </View>
        ) : (
          <ClinicalData patientData={patientData}
            patientId={patientId} updatePatientCondition={updatePatientCondition}
          />
        )}
      </View>
    </View>
  );
};


const formatToCustomDate = (dateString) => {
  const date = new Date(dateString);

  // Get the day, month, and year
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
  const year = date.getFullYear();

  // Return the date in dd-mm-yyyy format
  return `${day}-${month}-${year}`;
};

// Styles
const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  icon: {
    marginHorizontal: 2, // Minimal spacing between icons
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  criticalBorder: {
    borderLeftWidth: 6,
    borderLeftColor: '#f44336',
    borderColor: '#dc3545', // Added from the second set for consistency
  },
  normalBorder: {
    borderLeftWidth: 6,
    borderLeftColor: '#4caf50',
    borderColor: '#28a745', // Added from the second set for consistency
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 15,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  clinicalDataContainer: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dataText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activityIndicator: {
    transform: [{ scale: 2 }], // Enlarges ActivityIndicator
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  // New styles from the second set
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  photoContainerCard: {
    marginRight: 16,
  },
  photoCard: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  infoTextCard: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});

export default PatientDetails;