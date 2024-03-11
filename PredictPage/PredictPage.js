import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ImageManipulator } from 'expo-image-manipulator';

// const API_ENDPOINT = 'http://10.0.2.2:3000/api/predict'; //localhost
const API_ENDPOINT = 'https://skin-disease-detect-c718686d99c6.herokuapp.com/api/predict'; //hosting server

const PictureSelectPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState();
  const [selectedImageName, setSelectedImageName] = useState();
  const [selectedImageType, setSelectedImageType] = useState();
  const [predict, setPredict] = useState();
  const [prob, setProb] = useState();

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
    const resizedImage = await ImageManipulator.manipulateAsync(
      pickerResult.assets[0].uri,
      [{ resize: { width: 300, height: 500 } }],
      { compress: 0.7, format: 'jpg' } // optional compression and format settings
    );

    setSelectedImageUri(resizedImage.uri);
    setSelectedImageName(pickerResult.assets[0].fileName);
    setSelectedImageType("image/jpg");
    console.log(selectedImageUri, selectedImageName, selectedImageType);
  };

  const callApiHandler = async () => {
    console.log(selectedImageUri, selectedImageName, selectedImageType);
    if (!selectedImageUri || !selectedImageType || !selectedImageName) {
      alert('Please select an image first!');
      return;
    }
    try {
      const formRequest = new FormData();
      formRequest.append('inputImage', {
        uri: selectedImageUri,
        type: selectedImageType,
        name: selectedImageName
      });

      const response = await axios({
        method: "post",
        url: API_ENDPOINT,
        data: formRequest,
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log('API response:', response.data.class);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Button title="Select Picture" onPress={selectImageHandler} />
      </View>
      
      {selectedImageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImageUri }} style={styles.image} />
          <Button title="Predict" onPress={callApiHandler} />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Prediction</Text>
            <Button title="Close Modal" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      
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
