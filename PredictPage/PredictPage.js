import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

// const API_ENDPOINT = 'http://10.0.2.2:3000/api/predict'; //localhost
const API_ENDPOINT = 'https://skin-disease-detect-c718686d99c6.herokuapp.com/api/predict'; //heroku hosting server

const PictureSelectPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [apiRes, setApiRes] = useState(false);

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
    const originalWidth = pickerResult.assets[0].width;
    const originalHeight = pickerResult.assets[0].height;
    const targetSize = 200;
    let newWidth, newHeight;
    if (originalWidth > originalHeight) {
      newWidth = targetSize;
      newHeight = Math.floor((originalHeight / originalWidth) * targetSize);
    } else {
      newHeight = targetSize;
      newWidth = Math.floor((originalWidth / originalHeight) * targetSize);
    }

    const resizedImage = await ImageManipulator.manipulateAsync(
      pickerResult.assets[0].uri,
      [{ resize: { 
        width: newWidth, 
        height: newHeight, 
       }}],
      { compress: 0.7, format: 'jpeg' } // optional compression and format settings
    );
    console.log(pickerResult)

    setSelectedImageUri(resizedImage.uri);
    setSelectedImageName(pickerResult.assets[0].fileName);
    setSelectedImageType("image/jpeg");
    console.log(selectedImageUri, selectedImageName, selectedImageType);
  };
  console.log(selectedImageUri, selectedImageName, selectedImageType);

  

  const callApiHandler = async () => {
    console.log(selectedImageUri, selectedImageName, selectedImageType);
    if (!selectedImageUri || !selectedImageType || !selectedImageName) {
      alert('Please select an image first!');
      return;
    }
    try {
      setModalVisible(true)
      setIndicatorVisible(true)
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
      setPredict(response.data.class);
      setProb(response.data.prob.toFixed(2));
      setApiRes(true);
      setIndicatorVisible(false)
    } catch (error) {
      console.error('Error calling API:', error);
      setApiRes(false);
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Prediction</Text>
            {indicatorVisible && (
              <ActivityIndicator size="large" color="#00ff00" />
              )
            }
            {apiRes && (
              <>
                <Text>Image is of class {predict} with a probability of {prob} %</Text>
                <Button title="Close Modal" onPress={() => {setModalVisible(false); setApiRes(false)}} />
              </>
              )
            }
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
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: 15,
    width: 250,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PictureSelectPage;
