import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from 'react-native';
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
     `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=GOOGLE_MAPS_API`
   );
   const location = response.data.results[0]?.geometry?.location;
   console.log('Location:', location);  // Log the coordinates

   if (location) {
     setCoordinates({
       latitude: location.lat,
       longitude: location.lng,
     });
   } else {
     throw new Error('No location found for this place');
   }

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
        timezone: 5.5, // Hardcoded timezone,
        observation_point: 'topocentric',
        ayanamsha: 'lahiri',
        gender: formData.gender,
        name: formData.userName,
      };

      const response = await axios.post(
        'https://json.freeastrologyapi.com/planets', 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'YOUR_API_KEY', 
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kundli Generation Form</Text>
      
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
});

export default KundliForm;
