// Placeholder content for KoiCard.tsx
import { Koi } from '@/types/koi';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface KoiCardProps {
  koi: Koi;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function KoiCard({ koi, onPress }: KoiCardProps) {
  const latestPhoto = koi.photos[koi.photos.length - 1];
  const age = Math.floor((Date.now() - new Date(koi.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} testID={`koi-card-${koi.id}`}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: latestPhoto?.uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.photoCount}>
          <Text style={styles.photoCountText}>{koi.photos.length}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{koi.name}</Text>
        <Text style={styles.variety} numberOfLines={1}>{koi.variety}</Text>
        <Text style={styles.age}>{age} months old</Text>
        
        {koi.currentLength && (
          <Text style={styles.measurement}>{koi.currentLength}cm</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: cardWidth * 0.8,
  },
  photoCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  variety: {
    fontSize: 13,
    color: '#2E7D8A',
    fontWeight: '500',
    marginBottom: 4,
  },
  age: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  measurement: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '600',
  },
});