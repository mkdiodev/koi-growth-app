import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddKoiButton() {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    router.push('/modal');
  };

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: insets.bottom + 20 }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Plus size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
