// Placeholder content for _layout.tsx
import { useKoiStore } from '@/hooks/koi-store';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Plus, Ruler, Weight } from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';



export default function KoiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { koi } = useKoiStore();
  
  const koiData = koi.find(k => k.id === id);

  if (!koiData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Koi not found</Text>
      </View>
    );
  }

  const age = Math.floor((Date.now() - new Date(koiData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const sortedPhotos = [...koiData.photos].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: koiData.name,
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
      
      <LinearGradient
        colors={['#E8F4F8', '#F0F9FC']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: sortedPhotos[0]?.uri }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroName}>{koiData.name}</Text>
              <Text style={styles.heroVariety}>{koiData.variety}</Text>
            </LinearGradient>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Calendar size={20} color="#2E7D8A" />
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{age} months</Text>
            </View>
            
            {koiData.currentLength && (
              <View style={styles.statItem}>
                <Ruler size={20} color="#D4A574" />
                <Text style={styles.statLabel}>Length</Text>
                <Text style={styles.statValue}>{koiData.currentLength}cm</Text>
              </View>
            )}
            
            {koiData.currentWeight && (
              <View style={styles.statItem}>
                <Weight size={20} color="#8B5A3C" />
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{koiData.currentWeight}g</Text>
              </View>
            )}
          </View>

          {/* Growth Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.sectionTitle}>Growth Timeline</Text>
            
            {sortedPhotos.map((photo, index) => (
              <View key={photo.id} style={styles.timelineItem}>
                <View style={styles.timelineImageContainer}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.timelineImage}
                    contentFit="cover"
                  />
                </View>
                
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>
                    {new Date(photo.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  
                  <View style={styles.timelineMeasurements}>
                    {photo.length && (
                      <Text style={styles.measurement}>Length: {photo.length}cm</Text>
                    )}
                    {photo.weight && (
                      <Text style={styles.measurement}>Weight: {photo.weight}g</Text>
                    )}
                  </View>
                  
                  {photo.notes && (
                    <Text style={styles.timelineNotes}>{photo.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Floating Add Photo Button */}
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => router.push('/(tabs)/camera')}
          testID="add-photo-fab"
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
  },
  backButton: {
    marginLeft: -8,
    padding: 8,
  },
  heroContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroVariety: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timelineContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineImageContainer: {
    marginRight: 16,
  },
  timelineImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  timelineMeasurements: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  measurement: {
    fontSize: 14,
    color: '#2E7D8A',
    fontWeight: '500',
  },
  timelineNotes: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E7D8A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});