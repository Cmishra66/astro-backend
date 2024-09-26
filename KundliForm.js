import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const KundliForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userDateOfBirth: '',
    userTimeOfBirth: '',
    userPlaceOfBirth: '',
    gender: '',
  });

  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const fetchCoordinates = async (place) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=AIzaSyBA1DUu45B8BoMdy0NAdLsYHZaNpTdjuNs`
      );
      const location = response.data.results[0].geometry.location;
      setCoordinates({
        latitude: location.lat,
        longitude: location.lng,
      });
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      Alert.alert('Error', 'Failed to fetch location details');
    }
  };

  const handleSubmit = async () => {
    try {
      // Extract the year, month, and date from userDateOfBirth
      const [year, month, date] = formData.userDateOfBirth.split('-');

      // Extract the hour and minutes from userTimeOfBirth
      const [hours, minutes] = formData.userTimeOfBirth.split(':');

      // Fetch coordinates for the place of birth if not fetched yet
      if (!coordinates.latitude || !coordinates.longitude) {
        await fetchCoordinates(formData.userPlaceOfBirth);
      }

      const requestData = {
        year: parseInt(year),
        month: parseInt(month),
        date: parseInt(date),
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: 0, // Default seconds to 0, adjust if necessary
        latitude: coordinates.latitude, // Fetched from Google API
        longitude: coordinates.longitude, // Fetched from Google API
        timezone: 5.5, // Hardcoded timezone, adjust for dynamic if needed
        observation_point: 'topocentric',
        ayanamsha: 'lahiri',
        gender: formData.gender,
        name: formData.userName,
      };

      const response = await axios.post(
        'https://json.freeastrologyapi.com/planets', // Use actual API endpoint
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'LqgQf8Wgw23fF5JFwJFkZ5S7OEqX1Ex68iAyoSYz', // Replace with actual API key
          },
        }
      );
      Alert.alert('Kundli Generated', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error generating Kundli:', error);
      Alert.alert('Error', 'Failed to generate Kundli');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.userName}
        onChangeText={(value) => handleChange('userName', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={formData.userDateOfBirth}
        onChangeText={(value) => handleChange('userDateOfBirth', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Time of Birth (HH:MM)"
        value={formData.userTimeOfBirth}
        onChangeText={(value) => handleChange('userTimeOfBirth', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Place of Birth"
        value={formData.userPlaceOfBirth}
        onChangeText={(value) => handleChange('userPlaceOfBirth', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={formData.gender}
        onChangeText={(value) => handleChange('gender', value)}
      />
      <Button title="Generate Kundli" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default KundliForm;
