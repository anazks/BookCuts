import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AddBarber, AddService, viewMyBarbers, viewMyService } from '../api/Service/Shop'

export default function Settings() {
  const [barbers, setBarbers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showBarberModal, setShowBarberModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  
  // Form states
  const [barberName, setBarberName] = useState('')
  const [from, setFrom] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('')

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const barbersData = await viewMyBarbers()
      const servicesData = await viewMyService()
      console.log('Barbers:.....', barbersData)
      console.log('Services:', servicesData)  
      setBarbers(barbersData.data)
      setServices(servicesData.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const addBarber = async () => {
    if (!barberName.trim() || !from.trim()) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    try {
      const newBarber = {
        BarberName: barberName.trim(),
        From: from.trim()
      }

      const addedBarber = await AddBarber(newBarber)
      setBarbers([...barbers, addedBarber])
      setBarberName('')
      setFrom('')
      setShowBarberModal(false)
      Alert.alert('Success', 'Barber added successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to add barber')
      console.error(error)
    }
  }

  const addService = async () => {
    if (!serviceName.trim() || !servicePrice || !serviceDuration.trim()) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    try {
      const newService = {
        ServiceName: serviceName.trim(),
        Rate: servicePrice,
        Duration: serviceDuration.trim()
      }

      const addedService = await AddService(newService)
      setServices([...services, addedService])
      setServiceName('')
      setServicePrice('')
      setServiceDuration('')
      setShowServiceModal(false)
      Alert.alert('Success', 'Service added successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to add service')
      console.error(error)
    }
  }

  const deleteBarber = async (id) => {
    try {
      // Call your API to delete barber
      // await deleteBarberAPI(id)
      setBarbers(barbers.filter(barber => barber.id !== id))
      Alert.alert('Success', 'Barber deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete barber')
      console.error(error)
    }
  }

  const deleteService = async (id) => {
    try {
      // Call your API to delete service
      // await deleteServiceAPI(id)
      setServices(services.filter(service => service.id !== id))
      Alert.alert('Success', 'Service deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete service')
      console.error(error)
    }
  }

  const renderBarberItem = ({ item }) => (
    console.log('Barber Item:', item),
    <View style={styles.listItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.BarberName}</Text>
        <Text style={styles.itemDetail}>{item.From}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => editBarber(item.id)}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteBarber(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#F44336" style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderServiceItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.ServiceName}</Text>
        <Text style={styles.itemDetail}>₹{item.Rate} • {item.Duration}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => editService(item.id)}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteService(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#F44336" style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.header}>Salon Settings</Text>
        
        {/* Barbers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Barbers</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowBarberModal(true)}
            >
              <MaterialIcons name="person-add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Barber</Text>
            </TouchableOpacity>
          </View>
          
          {barbers.length > 0 ? (
            <FlatList
              data={barbers}
              renderItem={renderBarberItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No barbers added yet</Text>
          )}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowServiceModal(true)}
            >
              <MaterialIcons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
          
          {services.length > 0 ? (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No services added yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Barber Modal */}
      <Modal
        visible={showBarberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBarberModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Barber</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Barber Name"
              value={barberName}
              onChangeText={setBarberName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="From (e.g., City or Country)"
              value={from}
              onChangeText={setFrom}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBarberModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={addBarber}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Service Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={serviceName}
              onChangeText={setServiceName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Price (₹)"
              value={servicePrice}
              onChangeText={setServicePrice}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 30 min)"
              value={serviceDuration}
              onChangeText={setServiceDuration}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={addService}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIcon: {
    marginLeft: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  addButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
})