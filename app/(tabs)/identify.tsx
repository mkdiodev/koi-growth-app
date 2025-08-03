// Placeholder content for identify.tsx
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { AlertCircle, Camera, CheckCircle, Loader, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Camera imports with web fallback
let CameraView: any;
let CameraType: any;
let useCameraPermissions: any;

try {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  CameraType = cameraModule.CameraType;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch {
  // Fallback for web or when expo-camera is not available
  CameraView = ({ children }: any) => children;
  CameraType = 'back';
  useCameraPermissions = () => [{ granted: false }, () => Promise.resolve({ granted: false })];
}

interface IdentificationResult {
  variety: string;
  confidence: number;
  description: string;
  characteristics: string[];
}

export default function IdentifyScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to identify koi varieties.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async (camera: any) => {
    try {
      const photo = await camera.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      setCapturedImage(photo.uri);
      setShowCamera(false);
      
      // Start AI analysis
      setIsAnalyzing(true);
      await analyzeKoiVariety(photo.base64);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const analyzeKoiVariety = async (base64Image: string) => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a koi fish expert. Analyze the provided image and identify the koi variety. Respond with a JSON object containing:
              {
                "variety": "specific variety name",
                "confidence": confidence_percentage_as_number,
                "description": "brief description of the variety",
                "characteristics": ["key characteristic 1", "key characteristic 2", "key characteristic 3"]
              }
              
              Common koi varieties include: Kohaku, Taisho Sanke, Showa Sanshoku, Tancho, Asagi, Shusui, Bekko, Utsurimono, Goshiki, Ogon, Platinum, Yamabuki, Chagoi, Soragoi, Ochiba Shigure, Koromo, Goshiki, Doitsu varieties, and others.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please identify this koi variety and provide details about its characteristics.'
                },
                {
                  type: 'image',
                  image: base64Image
                }
              ]
            }
          ]
        }),
      });

      const data = await response.json();
      
      try {
        // Clean the response to extract JSON
        let cleanedResponse = data.completion.trim();
        
        // Remove markdown code blocks if present
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON object in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
        
        console.log('Cleaned AI response:', cleanedResponse);
        const analysisResult = JSON.parse(cleanedResponse);
        
        // Validate the parsed result has required fields
        if (analysisResult.variety && typeof analysisResult.confidence === 'number') {
          setResult({
            variety: analysisResult.variety,
            confidence: Math.min(100, Math.max(0, analysisResult.confidence)),
            description: analysisResult.description || 'No description provided.',
            characteristics: Array.isArray(analysisResult.characteristics) 
              ? analysisResult.characteristics 
              : ['Unable to extract characteristics']
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw AI response:', data.completion);
        
        // Try to extract variety name from plain text response
        const varietyMatch = data.completion.match(/variety[":\s]*([^\n,"]+)/i);
        const confidenceMatch = data.completion.match(/confidence[":\s]*(\d+)/i);
        
        setResult({
          variety: varietyMatch ? varietyMatch[1].trim() : 'Unknown Variety',
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
          description: data.completion || 'Unable to identify the koi variety from this image.',
          characteristics: [
            'AI response could not be parsed properly',
            'Please try taking another photo with better lighting',
            'Ensure the koi is clearly visible'
          ]
        });
      }
    } catch (error) {
      console.error('Error analyzing koi:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please check your internet connection and try again.');
      setResult({
        variety: 'Analysis Failed',
        confidence: 0,
        description: 'Unable to connect to the identification service.',
        characteristics: ['Check your internet connection', 'Try again later']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return CheckCircle;
    if (confidence >= 60) return AlertCircle;
    return AlertCircle;
  };

  if (showCamera) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Take Photo',
            headerStyle: { backgroundColor: '#2E7D8A' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={(ref) => {
              if (ref) {
                // Store camera ref for capture
                (global as any).cameraRef = ref;
              }
            }}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
              <Text style={styles.cameraInstructions}>
                Position the koi in the frame and tap capture
              </Text>
            </View>
          </CameraView>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => handleCapture((global as any).cameraRef)}
            >
              <Camera size={32} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
            >
              <Text style={styles.flipButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Koi Identifier',
          headerStyle: { backgroundColor: '#2E7D8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <LinearGradient colors={['#E8F4F8', '#F0F9FC']} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Search size={32} color="#2E7D8A" />
              <Text style={styles.title}>AI Koi Identifier</Text>
              <Text style={styles.subtitle}>
                Take a photo of your koi to identify its variety using AI
              </Text>
            </View>

            {!capturedImage && (
              <TouchableOpacity
                style={styles.takePhotoButton}
                onPress={handleTakePhoto}
                testID="take-photo-button"
              >
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.takePhotoButtonText}>Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {capturedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.capturedImage}
                contentFit="cover"
              />
              
              {isAnalyzing && (
                <View style={styles.analyzingOverlay}>
                  <Loader size={32} color="#2E7D8A" />
                  <Text style={styles.analyzingText}>Analyzing koi variety...</Text>
                </View>
              )}
            </View>
          )}

          {result && !isAnalyzing && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Identification Result</Text>
                <View style={styles.confidenceContainer}>
                  {React.createElement(getConfidenceIcon(result.confidence), {
                    size: 20,
                    color: getConfidenceColor(result.confidence)
                  })}
                  <Text style={[styles.confidenceText, { color: getConfidenceColor(result.confidence) }]}>
                    {result.confidence}% confident
                  </Text>
                </View>
              </View>

              <View style={styles.varietyContainer}>
                <Text style={styles.varietyName}>{result.variety}</Text>
                <Text style={styles.varietyDescription}>{result.description}</Text>
              </View>

              <View style={styles.characteristicsContainer}>
                <Text style={styles.characteristicsTitle}>Key Characteristics:</Text>
                {result.characteristics.map((characteristic, index) => (
                  <View key={index} style={styles.characteristicItem}>
                    <Text style={styles.characteristicBullet}>•</Text>
                    <Text style={styles.characteristicText}>{characteristic}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Camera size={20} color="#2E7D8A" />
                <Text style={styles.retryButtonText}>Try Another Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {!capturedImage && !isAnalyzing && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How to get the best results:</Text>
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBullet}>1.</Text>
                  <Text style={styles.instructionText}>
                    Ensure good lighting - natural daylight works best
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBullet}>2.</Text>
                  <Text style={styles.instructionText}>
                    Capture the koi from the side showing its full body
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBullet}>3.</Text>
                  <Text style={styles.instructionText}>
                    Make sure the koi&apos;s colors and patterns are clearly visible
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBullet}>4.</Text>
                  <Text style={styles.instructionText}>
                    Avoid reflections and shadows on the water surface
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  takePhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraFrame: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: '#000000',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2E7D8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  flipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  capturedImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D8A',
    marginTop: 12,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  varietyContainer: {
    marginBottom: 20,
  },
  varietyName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D8A',
    marginBottom: 8,
  },
  varietyDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  characteristicsContainer: {
    marginBottom: 20,
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  characteristicBullet: {
    fontSize: 16,
    color: '#2E7D8A',
    fontWeight: '700',
    marginRight: 8,
    marginTop: 2,
  },
  characteristicText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FC',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E7D8A',
    gap: 8,
  },
  retryButtonText: {
    color: '#2E7D8A',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionBullet: {
    fontSize: 16,
    color: '#2E7D8A',
    fontWeight: '700',
    marginRight: 12,
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});