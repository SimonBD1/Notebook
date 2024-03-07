import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { database, storage } from '../firebase';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';


export default function DetailScreen({ route, navigation }) {
  const { noteId, noteText: initialNoteText, noteImageUrl } = route.params;
  const [noteText, setNoteText] = useState(initialNoteText);
  const [imagePath, setImagePath] = useState(noteImageUrl);

  useEffect(() => {
    setNoteText(initialNoteText);
  }, [initialNoteText]);

  const saveEditedNote = async () => {
    try {
        await updateDoc(doc(database, "Notebook", noteId), { text: noteText });
        if (imagePath) {
            const res = await fetch(imagePath);
            const blob = await res.blob();
            const storageRef = ref(storage, `/${noteId}.jpg`); 
            await uploadBytes(storageRef, blob);
            console.log("Image uploaded...");
        }
        navigation.goBack();
    } catch (error) {
        console.error("Error updating document:", error);
    }
};

  async function hentBillede() {
    let resultat = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if (!resultat.cancelled) {
      console.log("Fået billede... " + resultat);
      setImagePath(resultat.assets[0].uri);
    } else {
      console.log("Intet billede valgt");
    }
  }
  async function uploadBillede(){
    if (imagePath) {
      try {
        const res = await fetch(imagePath);
        const blob = await res.blob();
        const storageRef = ref(storage, "dog.jpg");
        await uploadBytes(storageRef, blob);
        console.log("Image uploaded...");
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    } else {
      console.log("No image selected");
    }
  }
  async function downloadBillede(){
    await getDownloadURL(ref(storage,"dog.jpg"))
    .then((url)=>{
      setImagePath(url)
    })
    .catch((error)=>{
      alert("fejl i image download " + error)
    })
  }
  async function launchCamera() {
    const result =  await ImagePicker.requestCameraPermissionsAsync()
    if(result.granted===false){
    console.log("adgang ikke tilladt");
    } else{
        ImagePicker.launchCameraAsync({
          quality:1
        })
        .then((response)=>{
            console.log("billede ankommet" + response);
            setImagePath(response.assets[0].uri)
        })
    }
 }


  const deleteNote = async () => {
    try {
      await deleteDoc(doc(database, "Notebook", noteId));
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Full Note:</Text>
      <TextInput
        style={styles.noteInput}
        multiline={true}
        onChangeText={setNoteText}
        value={noteText}
      />
       {imagePath ? (
        <Image source={{ uri: imagePath }} style={{ width: 150, height: 150 }} />
      ) : (
        <Text>No Image Selected</Text>
      )}
      <Button title='hent billede' onPress={hentBillede} />
      <Button title='Tag et billede' onPress={launchCamera}/>
      <Button title='Upload billede' onPress={uploadBillede} />
      <Button title='Download billede' onPress={downloadBillede} />
      <Button title="Gem" onPress={saveEditedNote} />
      <Button title="Slet" onPress={deleteNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noteInput: {
    height: 200,
    width: '90%', 
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top', 
    
  },
});
