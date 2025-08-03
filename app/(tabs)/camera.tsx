// Placeholder content for camera.tsx
import { useKoiStore } from '@/hooks/koi-store';
import { KoiPhoto } from '@/types/koi';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Camera, Check, Fish, ImagePlus, Ruler, Weight, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function CameraScreen() {
  const { koi, addPhotoToKoi } = useKoiStore();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedKoiId, setSelectedKoiId] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowAddModal(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowAddModal(true);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleSubmitPhoto = async () => {
    if (!selectedImage || !selectedKoiId) {
      Alert.alert('Error', 'Please select a koi and ensure photo is loaded.');
      return;
    }

    setIsSubmitting(true);
    try {
      const photoData: Omit<KoiPhoto, 'id'> = {
        uri: selectedImage,
        date: new Date().toISOString(),
        length: length ? parseFloat(length) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes.trim() || undefined,
      };

      addPhotoToKoi(selectedKoiId, photoData);
      
      // Reset form
      setSelectedImage(null);
      setSelectedKoiId('');
      setLength('');
      setWeight('');
      setNotes('');
      setShowAddModal(false);
      
      Alert.alert('Success', 'Photo added successfully!');
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedImage(null);
    setSelectedKoiId('');
    setLength('');
    setWeight('');
    setNotes('');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Add Photo',
          headerStyle: { backgroundColor: '#2E7D8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' }
        }} 
      />
      
      <LinearGradient
        colors={['#E8F4F8', '#F0F9FC']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Fish size={64} color="#2E7D8A" strokeWidth={1.5} />
          </View>
          
          <Text style={styles.title}>Capture Growth Moments</Text>
          <Text style={styles.subtitle}>
            Document your koi&apos;s journey with photos and measurements
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleTakePhoto}
              testID="take-photo-button"
            >
              <Camera size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleSelectPhoto}
              testID="select-photo-button"
            >
              <ImagePlus size={24} color="#2E7D8A" />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>Features:</Text>
            <Text style={styles.featureItem}>• Add measurements (length, weight)</Text>
            <Text style={styles.featureItem}>• Growth tracking charts</Text>
            <Text style={styles.featureItem}>• Photo comparison timeline</Text>
            <Text style={styles.featureItem}>• Notes and observations</Text>
          </View>
        </View>

        {/* Add Photo Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <TouchableOpacity 
                onPress={handleSubmitPhoto} 
                style={styles.submitButton}
                disabled={isSubmitting || !selectedKoiId}
              >
                <Check size={24} color={selectedKoiId ? '#2E7D8A' : '#CCC'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedImage && (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                </View>
              )}

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Select Koi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.koiSelector}>
                  {koi.map((koiItem) => {
                    const isSelected = selectedKoiId === koiItem.id;
                    const latestPhoto = koiItem.photos[koiItem.photos.length - 1];
                    
                    return (
                      <TouchableOpacity
                        key={koiItem.id}
                        style={[styles.koiOption, isSelected && styles.koiOptionSelected]}
                        onPress={() => setSelectedKoiId(koiItem.id)}
                      >
                        <Image
                          source={{ uri: latestPhoto?.uri }}
                          style={styles.koiOptionImage}
                          contentFit="cover"
                        />
                        <Text style={[styles.koiOptionName, isSelected && styles.koiOptionNameSelected]}>
                          {koiItem.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Measurements (Optional)</Text>
                <View style={styles.measurementRow}>
                  <View style={styles.measurementInput}>
                    <Ruler size={20} color="#2E7D8A" />
                    <TextInput
                      style={styles.input}
                      placeholder="Length (cm)"
                      value={length}
                      onChangeText={setLength}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.measurementInput}>
                    <Weight size={20} color="#2E7D8A" />
                    <TextInput
                      style={styles.input}
                      placeholder="Weight (g)"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add any observations or notes..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 125, 138, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#2E7D8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D8A',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#2E7D8A',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  submitButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imagePreview: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  koiSelector: {
    flexDirection: 'row',
  },
  koiOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  koiOptionSelected: {
    borderColor: '#2E7D8A',
    backgroundColor: 'rgba(46, 125, 138, 0.1)',
  },
  koiOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  koiOptionName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  koiOptionNameSelected: {
    color: '#2E7D8A',
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  notesInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 100,
  },
});