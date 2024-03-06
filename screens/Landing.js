import React, { useState } from "react";
import {
  View,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "../firebase";

export default function HomeScreen({ navigation }) {
  const [text, setText] = useState("");
  const [values, loading, error] = useCollection(collection(database, "Notebook"));
  const data =
    values?.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    })) || [];
  
  const addNote = async () => {
    if (text.trim()) {
      try {
        await addDoc(collection(database, "Notebook"), { text });
        setText("");
      } catch (error) {
        console.error("Fejl: kunne ikke tilføje dit dokument", error);
      }
    }
  };

  function goToDetailPage(noteId, noteText) {
    navigation.navigate("Details", { noteId, noteText });
  }

  return (
    <View style={styles.container}>
      <TextInput
  style={styles.textInput}
  onChangeText={setText} 
  value={text}
  placeholder="Skriv note her..."
  multiline
  verticalAlign="top"
/>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>Tilføj note</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.notesContainer}>
        {data.map(({ id, text }) => (
          <Pressable
            key={id}
            style={styles.noteButtonContainer}
            onPress={() => goToDetailPage(id, text)}
          >
            <Text style={styles.noteButtonText}>
  {(text ?? "").substring(0, 30) + ((text ?? "").length > 30 ? "..." : "")}
</Text>

          </Pressable>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    width: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  notesContainer: {
    width: "80%",
  },
  noteButtonContainer: {
    marginBottom: 10,
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  noteButtonText: {
    fontSize: 16,
  },
});
