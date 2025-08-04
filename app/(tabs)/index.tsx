// Placeholder content for index.tsx
import AddKoiButton from '@/components/AddKoiButton';
import SwipeableKoiCard from '@/components/SwipeableKoiCard';
import { useKoiStore } from '@/hooks/koi-store';
import { Koi } from '@/types/koi';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Heart, RotateCcw, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function GalleryScreen() {
  const { koi } = useKoiStore();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedKoi, setLikedKoi] = useState<string[]>([]);
  const [passedKoi, setPassedKoi] = useState<string[]>([]);

  const visibleCards = useMemo(() => {
    return koi.slice(currentIndex, currentIndex + 3);
  }, [koi, currentIndex]);

  const handleSwipeLeft = () => {
    const currentKoi = koi[currentIndex];
    if (currentKoi) {
      setPassedKoi(prev => [...prev, currentKoi.id]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    const currentKoi = koi[currentIndex];
    if (currentKoi) {
      setLikedKoi(prev => [...prev, currentKoi.id]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleKoiPress = (koiId: string) => {
    router.push(`/koi/${koiId}`);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedKoi([]);
    setPassedKoi([]);
  };

  const handleLikeButton = () => {
    if (currentIndex < koi.length) {
      handleSwipeRight();
    }
  };

  const handlePassButton = () => {
    if (currentIndex < koi.length) {
      handleSwipeLeft();
    }
  };

  const isFinished = currentIndex >= koi.length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Koi Gallery',
          headerStyle: { backgroundColor: '#2E7D8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' }
        }} 
      />
      
      <LinearGradient
        colors={['#E8F4F8', '#F0F9FC']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discover Your Koi</Text>
          <Text style={styles.subtitle}>
            Swipe right or tap to view details, left to pass
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {isFinished ? (
            <View style={styles.finishedContainer}>
              <Text style={styles.finishedTitle}>All Done! 🎉</Text>
              <Text style={styles.finishedSubtitle}>
                You&apos;ve viewed all your koi
              </Text>
              <Text style={styles.statsText}>
                Liked: {likedKoi.length} • Passed: {passedKoi.length}
              </Text>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <RotateCcw size={20} color="#FFFFFF" />
                <Text style={styles.resetButtonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          ) : (
            visibleCards.map((koiItem: Koi, index: number) => (
              <SwipeableKoiCard
                key={`${koiItem.id}-${currentIndex}`}
                koi={koiItem}
                onSwipeLeft={index === 0 ? handleSwipeLeft : () => {}}
                onSwipeRight={index === 0 ? handleSwipeRight : () => {}}
                onPress={() => handleKoiPress(koiItem.id)}
                isTop={index === 0}
                index={index}
              />
            ))
          )}
        </View>

        {!isFinished && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.passButton]} 
              onPress={handlePassButton}
            >
              <X size={28} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.likeButton]} 
              onPress={handleLikeButton}
            >
              <Heart size={28} color="#2E7D8A" fill="#2E7D8A" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {isFinished ? koi.length : currentIndex + 1} / {koi.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex) / koi.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <AddKoiButton />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  finishedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  finishedTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#2E7D8A',
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingBottom: 40,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  likeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2E7D8A',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D8A',
    borderRadius: 2,
  },
});
