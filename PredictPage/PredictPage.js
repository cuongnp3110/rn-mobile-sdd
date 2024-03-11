import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// const API_ENDPOINT = 'http://10.0.2.2:3000/api/predict'; //localhost
const API_ENDPOINT = 'https://skin-disease-detect-c718686d99c6.herokuapp.com/api/predict'; //hosting server

const PictureSelectPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const selectImageHandler = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return console.log("Permission required!");
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.cancelled === true) {
      return console.log("Cancelled");
    }

    setSelectedImage(pickerResult.assets[0].uri);
    // console.log(pickerResult.assets[0].uri);
  };

  const callApiHandler = async () => {
    if (!selectedImage) {
      alert('Please select an image first!');
      return;
    }
    try {
      const fileData = await fetch(selectedImage.uri);
      if (!fileData.ok) {
        throw new Error('Failed to fetch image');
      }
      const fileBlob = await fileData.blob();
      
      // Call your API here with the selected image
      const formRequest = new FormData();
      formRequest.append('inputImage', fileBlob);

      const response = await axios({
        method: "post",
        url: API_ENDPOINT,
        data: formRequest,
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Button title="Select Picture" onPress={selectImageHandler} />
      </View>
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Button title="Predict" onPress={callApiHandler} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  inputSection: {
    marginTop: 100,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: 15,
    width: 300,
    height: 500,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

export default PictureSelectPage;
