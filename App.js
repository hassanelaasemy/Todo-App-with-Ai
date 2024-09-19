import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editText, setEditText] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    loadTodos();
  }, []);
  useEffect(() => {
    saveTodos();
  }, [todos]);
  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem("todos");
      if (storedTodos !== null) {
        setTodos(JSON.parse(storedTodos));
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };
  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem("todos", JSON.stringify(todos));
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  };
  const addTodo = () => {
    if (inputText.trim()) {
      setTodos((prevTodos) => [
        ...prevTodos,
        { id: Date.now(), text: inputText, done: false },
      ]);
      setInputText("");
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };
  const editTodo = (id) => {
    const todoToEdit = todos.find((todo) => todo.id === id);
    setEditText(todoToEdit.text);
    setEditingId(id);
    setModalVisible(true);
  };
  const updateTodo = () => {
    if (editText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: editText } : todo
        )
      );
      setModalVisible(false);
      setEditingId(null);
      setEditText("");
    }
  };
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };
  const renderTodoItem = ({ item }) => (
    <Animated.View style={[styles.todoItem, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.todoText}
        onPress={() => toggleTodo(item.id)}
      >
        <View style={styles.todoContent}>
          {item.done && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#5cb85c"
              style={styles.checkIcon}
            />
          )}
          <Text style={[styles.todoTextContent, item.done && styles.todoDone]}>
            {item.text}
          </Text>
        </View>
      </TouchableOpacity>
      {!item.done && (
        <View style={styles.todoActions}>
          <TouchableOpacity
            onPress={() => editTodo(item.id)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteTodo(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar backgroundColor="#000000" style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>Todo List</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter a todo"
          />
          <TouchableOpacity onPress={addTodo} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TextInput
                style={styles.modalInput}
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit todo"
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={updateTodo}
                >
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#5cb85c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  todoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 10,
  },
  todoText: {
    flex: 1,
  },
  todoTextContent: {
    fontSize: 16,
    color: "#333",
  },
  todoDone: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  todoActions: {
    flexDirection: "row",
  },
  editButton: {
    marginRight: 10,
    padding: 5,
  },
  editButtonText: {
    color: "#007bff",
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    color: "#dc3545",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // Adjust the width as needed
  },
  modalInput: {
    height: 40,
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: "#5cb85c",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
