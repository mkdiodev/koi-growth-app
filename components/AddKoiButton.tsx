// Placeholder content for AddKoiButton.tsx
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

interface AddKoiButtonProps {
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function AddKoiButton({ onPress }: AddKoiButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID="add-koi-button"
    >
      <Plus size={32} color="#2E7D8A" strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth * 0.8 + 80,
    backgroundColor: '#F8FFFE',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2E7D8A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});