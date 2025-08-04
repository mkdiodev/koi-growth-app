import { KOI_VARIETIES } from '@/constants/koi-varieties';
import { useKoiStore } from '@/hooks/koi-store';
import { Koi, KoiPhoto } from '@/types/koi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddKoiModal() {
  const { addKoi } = useKoiStore();
  const [name, setName] = useState('');
  const [variety, setVariety] = useState(KOI_VARIETIES[0]);
  const [birthDate, setBirthDate] = useState(new Date());
  const [photo, setPhoto] = useState<KoiPhoto | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto({
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        date: new Date().toISOString(),
      });
    }
  };

  const handleSave = () => {
    if (!name || !variety || !photo) {
      Alert.alert('Error', 'Please fill all fields and add a photo.');
      return;
    }

    const newKoi: Omit<Koi, 'id'> = {
      name,
      variety,
      birthDate: birthDate.toISOString(),
      photos: [photo],
      currentLength: photo.length,
      currentWeight: photo.weight,
    };

    addKoi(newKoi);
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Koi</Text>

      <TextInput
        style={styles.input}
        placeholder="Koi Name (e.g., Sakura)"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={variety}
          onValueChange={(itemValue: string) => setVariety(itemValue)}
        >
          {KOI_VARIETIES.map((v) => (
            <Picker.Item key={v} label={v} value={v} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text>Birth Date: {birthDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
        <Text style={styles.photoButtonText}>
          {photo ? 'Change Photo' : 'Add Photo'}
        </Text>
      </TouchableOpacity>

      {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F9FC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoButton: {
    backgroundColor: '#2E7D8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: '#2E7D8A',
  },
  cancelButton: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
