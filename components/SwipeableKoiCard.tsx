// Placeholder content for SwipeableKoiCard.tsx
import { Koi } from '@/types/koi';
import { Image } from 'expo-image';
import { Heart, X } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SwipeableKoiCardProps {
  koi: Koi;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress: () => void;
  isTop: boolean;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const SWIPE_THRESHOLD = screenWidth * 0.3;

export default function SwipeableKoiCard({ 
  koi, 
  onSwipeLeft, 
  onSwipeRight, 
  onPress, 
  isTop, 
  index 
}: SwipeableKoiCardProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const latestPhoto = koi.photos[koi.photos.length - 1];
  const age = Math.floor((Date.now() - new Date(koi.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  // Calculate card height based on screen size and safe area
  const CARD_HEIGHT = Platform.select({
    ios: screenHeight * 0.65 - insets.top - insets.bottom,
    android: screenHeight * 0.68 - 60, // Account for status bar
    web: screenHeight * 0.7
  }) as number;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, screenWidth],
        [-30, 30],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * screenWidth * 1.5);
        translateY.value = withSpring(event.translationY * 0.2);
        rotate.value = withSpring(direction * 45);
        
        if (direction > 0) {
          runOnJS(onSwipeRight)();
        } else {
          runOnJS(onSwipeLeft)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    })
    .enabled(isTop);

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onPress)();
    })
    .enabled(isTop);

  const cardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity,
      zIndex: isTop ? 1000 : 1000 - index,
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1.2],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1.2, 0.5],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const stackStyle = useAnimatedStyle(() => {
    const stackScale = 1 - (index * 0.05);
    const stackTranslateY = index * 8;
    
    return {
      transform: [
        { scale: stackScale },
        { translateY: stackTranslateY },
      ],
    };
  });

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity 
        style={[styles.card, { height: CARD_HEIGHT, transform: [{ scale: 1 - (index * 0.05) }, { translateY: index * 8 }] }]}
        onPress={onPress}
        activeOpacity={0.95}
      >
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
          <Text style={styles.name}>{koi.name}</Text>
          <Text style={styles.variety}>{koi.variety}</Text>
          <Text style={styles.age}>{age} months old</Text>
          
          {koi.currentLength && (
            <Text style={styles.measurement}>{koi.currentLength}cm</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.card, { height: CARD_HEIGHT }, cardStyle, !isTop && stackStyle]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: latestPhoto?.uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          
          <Animated.View style={[styles.actionOverlay, styles.likeOverlay, likeStyle]}>
            <Heart size={60} color="#2E7D8A" fill="#2E7D8A" />
            <Text style={[styles.actionText, styles.likeText]}>VIEW</Text>
          </Animated.View>
          
          <Animated.View style={[styles.actionOverlay, styles.nopeOverlay, nopeStyle]}>
            <X size={60} color="#666" />
            <Text style={[styles.actionText, styles.nopeText]}>PASS</Text>
          </Animated.View>
          
          <View style={styles.photoCount}>
            <Text style={styles.photoCountText}>{koi.photos.length}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name}>{koi.name}</Text>
          <Text style={styles.variety}>{koi.variety}</Text>
          <Text style={styles.age}>{age} months old</Text>
          
          {koi.currentLength && (
            <Text style={styles.measurement}>{koi.currentLength}cm</Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    ...Platform.select({
      android: {
        marginTop: 10,
      },
    }),
  },
  imageContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoCount: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionOverlay: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
  },
  likeOverlay: {
    right: 30,
    borderColor: '#2E7D8A',
    transform: [{ translateY: -50 }],
  },
  nopeOverlay: {
    left: 30,
    borderColor: '#666',
    transform: [{ translateY: -50 }],
  },
  actionText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 2,
  },
  likeText: {
    color: '#2E7D8A',
  },
  nopeText: {
    color: '#666',
  },
  content: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  variety: {
    fontSize: 16,
    color: '#2E7D8A',
    fontWeight: '600',
    marginBottom: 8,
  },
  age: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  measurement: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
  },
});