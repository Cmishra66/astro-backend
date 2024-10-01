import React, { useState } from 'react';
import { View, TextInput, Button, Alert, ScrollView, Text, StyleSheet } from 'react-native';
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

  const [kundliResponse, setKundliResponse] = useState(null);
  const [astroInsights, setAstroInsights] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const fetchCoordinates = async (place) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=your maps key`
      );
      const location = response.data.results[0]?.geometry?.location;

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

  const generateKundli = async () => {
    try {
      const [year, month, date] = formData.userDateOfBirth.split('-');
      const [hours, minutes] = formData.userTimeOfBirth.split(':');

      if (!coordinates.latitude || !coordinates.longitude) {
        await fetchCoordinates(formData.userPlaceOfBirth);
      }

      const requestData = {
        year: parseInt(year),
        month: parseInt(month),
        date: parseInt(date),
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: 0,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        timezone: 5.5,
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
            'x-api-key': 'your astrology key',
          },
        }
      );

      setKundliResponse(response.data);
      generateAstroInsights(response.data); // Call Gemini API here
    } catch (error) {
      console.error('Error generating Kundli:', error);
      Alert.alert('Error', 'Failed to generate Kundli');
    }
  };

  // Replace this function to call Gemini API for astrological insights
  const generateAstroInsights = async (kundliData) => {
    try {
      const geminiResponse = await axios.post(
        'https://generativelanguage.googleapis.com',  // Gemini API endpoint (hypothetical)
        {
          kundliData: kundliData,  // Send Kundli data to Gemini API
          analysisType: 'detailed',  // Gemini API-specific fields (example)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer your gemini key`,  // Replace with your Gemini API key
          },
        }
      );

      setAstroInsights(geminiResponse.data.insights);  // Assuming 'insights' contains the response
    } catch (error) {
      console.error('Error fetching astrological insights:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to get astrological insights. Please check the API configuration or try again later.');
    }
  };

  const handleSubmit = () => {
    generateKundli();
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

      {kundliResponse && (
        <View>
          <Text style={styles.subtitle}>Kundli Data:</Text>
          <Text>{JSON.stringify(kundliResponse)}</Text>
        </View>
      )}

      {astroInsights && (
        <View>
          <Text style={styles.subtitle}>Astrological Insights:</Text>
          <Text>{astroInsights}</Text>
        </View>
      )}
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
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
