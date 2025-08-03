// Placeholder content for notifications.tsx
import { useKoiStore } from '@/hooks/koi-store';
import { NotificationSettings } from '@/types/koi';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Bell, Clock, Droplets, Fish, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Check if we're in Expo Go environment
const isExpoGo = Platform.OS !== 'web' && __DEV__ && !Platform.constants?.systemName;

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    notificationSettings, 
    updateNotificationSettings, 
    requestNotificationPermissions,
    isSaving 
  } = useKoiStore();
  
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(notificationSettings);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    setLocalSettings(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);
    };
    checkPermissions();
  }, [requestNotificationPermissions]);



  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleRequestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Notification permissions are needed to send reminders. Please enable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // On mobile, this would open device settings
            if (Platform.OS !== 'web') {
              Alert.alert('Info', 'Please go to your device settings to enable notifications for this app.');
            }
          }}
        ]
      );
    }
  };

  const getIntervalText = (days: number) => {
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 14) return 'Bi-weekly';
    if (days === 30) return 'Monthly';
    return `Every ${days} days`;
  };

  const intervalOptions = [1, 3, 7, 14, 30];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reminders',
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
              <Bell size={32} color="#2E7D8A" />
              <Text style={styles.title}>Koi Care Reminders</Text>
              <Text style={styles.subtitle}>
                Stay on top of your koi care routine with smart reminders
              </Text>
            </View>
          </View>

          {isExpoGo && (
            <View style={styles.expoGoCard}>
              <View style={styles.permissionHeader}>
                <Settings size={24} color="#2196F3" />
                <Text style={styles.expoGoTitle}>Expo Go Limitation</Text>
              </View>
              <Text style={styles.permissionText}>
                Push notifications are not available in Expo Go. To test notifications, please use a development build or the published app.
              </Text>
            </View>
          )}

          {!hasPermission && Platform.OS !== 'web' && !isExpoGo && (
            <View style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <Settings size={24} color="#FF9800" />
                <Text style={styles.permissionTitle}>Enable Notifications</Text>
              </View>
              <Text style={styles.permissionText}>
                To receive reminders, please allow notifications for this app.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handleRequestPermissions}
              >
                <Text style={styles.permissionButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.settingsContainer}>
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  <Fish size={24} color="#2E7D8A" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Measurement Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded to measure your koi&apos;s growth progress
                  </Text>
                </View>
                <Switch
                  value={localSettings.measurementReminders}
                  onValueChange={(value) => handleSettingChange('measurementReminders', value)}
                  trackColor={{ false: '#E0E0E0', true: '#2E7D8A' }}
                  thumbColor={localSettings.measurementReminders ? '#FFFFFF' : '#FFFFFF'}
                  disabled={isSaving || isExpoGo}
                />
              </View>

              {localSettings.measurementReminders && (
                <View style={styles.intervalContainer}>
                  <Text style={styles.intervalLabel}>Reminder Frequency:</Text>
                  <View style={styles.intervalOptions}>
                    {intervalOptions.map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.intervalOption,
                          localSettings.measurementInterval === days && styles.intervalOptionActive
                        ]}
                        onPress={() => handleSettingChange('measurementInterval', days)}
                        disabled={isSaving || isExpoGo}
                      >
                        <Text style={[
                          styles.intervalOptionText,
                          localSettings.measurementInterval === days && styles.intervalOptionTextActive
                        ]}>
                          {getIntervalText(days)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  <Droplets size={24} color="#2E7D8A" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Water Test Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded to test your pond&apos;s water parameters
                  </Text>
                </View>
                <Switch
                  value={localSettings.waterTestReminders}
                  onValueChange={(value) => handleSettingChange('waterTestReminders', value)}
                  trackColor={{ false: '#E0E0E0', true: '#2E7D8A' }}
                  thumbColor={localSettings.waterTestReminders ? '#FFFFFF' : '#FFFFFF'}
                  disabled={isSaving || isExpoGo}
                />
              </View>

              {localSettings.waterTestReminders && (
                <View style={styles.intervalContainer}>
                  <Text style={styles.intervalLabel}>Reminder Frequency:</Text>
                  <View style={styles.intervalOptions}>
                    {intervalOptions.map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.intervalOption,
                          localSettings.waterTestInterval === days && styles.intervalOptionActive
                        ]}
                        onPress={() => handleSettingChange('waterTestInterval', days)}
                        disabled={isSaving || isExpoGo}
                      >
                        <Text style={[
                          styles.intervalOptionText,
                          localSettings.waterTestInterval === days && styles.intervalOptionTextActive
                        ]}>
                          {getIntervalText(days)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Clock size={24} color="#666666" />
              <Text style={styles.infoTitle}>How Reminders Work</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Reminders are sent at 9:00 AM based on your selected frequency
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  You can change reminder settings anytime
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Reminders help maintain consistent koi care routines
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Regular monitoring leads to healthier, happier koi
                </Text>
              </View>
            </View>
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                Note: Push notifications are not available in web browsers. 
                Please use the mobile app for reminder notifications.
              </Text>
            </View>
          )}

          {isExpoGo && (
            <View style={styles.expoGoNotice}>
              <Text style={styles.webNoticeText}>
                Note: You&apos;re using Expo Go. Notifications will work in a development build or published app.
              </Text>
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
  permissionCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
  },
  permissionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  intervalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  intervalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  intervalOptionActive: {
    backgroundColor: '#2E7D8A',
    borderColor: '#2E7D8A',
  },
  intervalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  intervalOptionTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    color: '#2E7D8A',
    fontWeight: '700',
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  webNotice: {
    backgroundColor: '#F0F9FC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E7D8A',
  },
  webNoticeText: {
    fontSize: 14,
    color: '#2E7D8A',
    textAlign: 'center',
    lineHeight: 20,
  },
  expoGoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  expoGoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  expoGoNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
});