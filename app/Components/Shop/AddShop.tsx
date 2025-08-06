import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addShop } from '../../api/Service/Shop';
export default function AddShop({ onShopAdded }) {
  const [formData, setFormData] = useState({
    ShopName: '',
    City: '',
    Mobile: '',
    Timing: '',
    website: ''
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.ShopName || !formData.City || !formData.Mobile || !formData.Timing || !formData.website) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!/^\d{10}$/.test(formData.Mobile)) {
      Alert.alert("Error", "Mobile number must be 10 digits");
      return;
    }

    if (!/^https?:\/\/[\w.-]+\.[a-z]{2,}/.test(formData.website)) {
      Alert.alert("Error", "Enter a valid website URL (include http:// or https://)");
      return;
    }

    // Here you would typically call your API
    console.log('Submitting shop:', formData);
    let response = await addShop(formData);
    if (!response.success) {
      Alert.alert("Error", response.message || "Failed to add shop");
      return;
    }
    // Reset form
    setFormData({
        ShopName: '',
        City: '',
        Mobile: '',
        Timing: '',
        website: ''
        });
    Alert.alert("Success", "Shop added successfully");
    
    // Call the callback if provided
    if (onShopAdded) {
      onShopAdded();
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Add New Shop</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Shop Name</Text>
        <TextInput
          placeholder="Enter shop name"
          style={styles.input}
          onChangeText={(value) => handleChange('ShopName', value)}
          value={formData.ShopName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          placeholder="Enter city"
          style={styles.input}
          onChangeText={(value) => handleChange('City', value)}
          value={formData.City}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          placeholder="Enter 10-digit mobile number"
          style={styles.input}
          keyboardType="phone-pad"
          onChangeText={(value) => handleChange('Mobile', value)}
          value={formData.Mobile}
          maxLength={10}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Hours</Text>
        <TextInput
          placeholder="e.g., 9:00 AM - 8:00 PM"
          style={styles.input}
          onChangeText={(value) => handleChange('Timing', value)}
          value={formData.Timing}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Website URL</Text>
        <TextInput
          placeholder="https://www.example.com"
          style={styles.input}
          keyboardType="url"
          onChangeText={(value) => handleChange('website', value)}
          value={formData.website}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Add Shop</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 24,
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});