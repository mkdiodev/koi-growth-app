import { useKoiStore } from '@/hooks/koi-store';
import { KoiPhoto } from '@/types/koi';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditPhotoScreen() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const { koi, updatePhoto } = useKoiStore();
  const [photo, setPhoto] = useState<KoiPhoto | null>(null);
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const koiData = koi.find(k => k.id === id);
    if (koiData) {
      const photoData = koiData.photos.find(p => p.id === photoId);
      if (photoData) {
        setPhoto(photoData);
        setLength(photoData.length?.toString() || '');
        setWeight(photoData.weight?.toString() || '');
        setNotes(photoData.notes || '');
        setDate(new Date(photoData.date).toISOString().split('T')[0]);
      }
    }
  }, [id, photoId, koi]);

  const handleSave = () => {
    if (id && photoId) {
      const updatedPhoto: Partial<KoiPhoto> = {
        length: length ? parseFloat(length) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes,
        date: new Date(date).toISOString(),
      };
      updatePhoto(id, photoId, updatedPhoto);
      router.back();
    }
  };

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text>Photo not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Growth Entry',
          headerStyle: { backgroundColor: '#2E7D8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
        <Text style={styles.label}>Length (cm)</Text>
        <TextInput
          style={styles.input}
          value={length}
          onChangeText={setLength}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Weight (g)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button title="Save Changes" onPress={handleSave} color="#2E7D8A" />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F9FC',
  },
  backButton: {
    marginLeft: -8,
    padding: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
  },
});
