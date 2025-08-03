// Placeholder content for koi-store.ts
import { MOCK_KOI } from '@/mocks/koi-data';
import { Koi, KoiPhoto, NotificationSettings, WaterParameter } from '@/types/koi';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

const STORAGE_KEY = 'koi-gallery-data';
const WATER_PARAMS_KEY = 'water-parameters';
const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

// Check if we're in Expo Go environment
const isExpoGo = Platform.OS !== 'web' && __DEV__ && !Platform.constants?.systemName;

// Conditionally import and setup notifications only if not in Expo Go
let Notifications: any = null;
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('expo-notifications not available in this environment:', error);
  }
}

export const [KoiStoreProvider, useKoiStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  const koiQuery = useQuery({
    queryKey: ['koi'],
    queryFn: async (): Promise<Koi[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
        // Initialize with mock data on first load
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_KOI));
        return MOCK_KOI;
      } catch (error) {
        console.error('Error loading koi data:', error);
        return MOCK_KOI;
      }
    }
  });

  const waterParamsQuery = useQuery({
    queryKey: ['waterParameters'],
    queryFn: async (): Promise<WaterParameter[]> => {
      try {
        const stored = await AsyncStorage.getItem(WATER_PARAMS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error loading water parameters:', error);
        return [];
      }
    }
  });

  const notificationSettingsQuery = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async (): Promise<NotificationSettings> => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        return stored ? JSON.parse(stored) : {
          measurementReminders: true,
          waterTestReminders: true,
          measurementInterval: 7, // days
          waterTestInterval: 3, // days
        };
      } catch (error) {
        console.error('Error loading notification settings:', error);
        return {
          measurementReminders: true,
          waterTestReminders: true,
          measurementInterval: 7,
          waterTestInterval: 3,
        };
      }
    }
  });

  const saveKoiMutation = useMutation({
    mutationFn: async (koi: Koi[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(koi));
      return koi;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['koi'] });
    }
  });

  const addKoi = (koi: Omit<Koi, 'id'>) => {
    const currentKoi = koiQuery.data || [];
    const newKoi: Koi = {
      ...koi,
      id: Date.now().toString()
    };
    const updatedKoi = [...currentKoi, newKoi];
    saveKoiMutation.mutate(updatedKoi);
  };

  const updateKoi = (koiId: string, updates: Partial<Koi>) => {
    const currentKoi = koiQuery.data || [];
    const updatedKoi = currentKoi.map(koi => 
      koi.id === koiId ? { ...koi, ...updates } : koi
    );
    saveKoiMutation.mutate(updatedKoi);
  };

  const addPhotoToKoi = (koiId: string, photo: Omit<KoiPhoto, 'id'>) => {
    const currentKoi = koiQuery.data || [];
    const newPhoto: KoiPhoto = {
      ...photo,
      id: `${koiId}-${Date.now()}`
    };
    
    const updatedKoi = currentKoi.map(koi => {
      if (koi.id === koiId) {
        const updatedPhotos = [...koi.photos, newPhoto].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return {
          ...koi,
          photos: updatedPhotos,
          currentLength: photo.length || koi.currentLength,
          currentWeight: photo.weight || koi.currentWeight
        };
      }
      return koi;
    });
    
    saveKoiMutation.mutate(updatedKoi);
  };

  const deleteKoi = (koiId: string) => {
    const currentKoi = koiQuery.data || [];
    const updatedKoi = currentKoi.filter(koi => koi.id !== koiId);
    saveKoiMutation.mutate(updatedKoi);
  };

  const saveWaterParamsMutation = useMutation({
    mutationFn: async (params: WaterParameter[]) => {
      await AsyncStorage.setItem(WATER_PARAMS_KEY, JSON.stringify(params));
      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterParameters'] });
    }
  });

  const addWaterParameter = (param: Omit<WaterParameter, 'id'>) => {
    const currentParams = waterParamsQuery.data || [];
    const newParam: WaterParameter = {
      ...param,
      id: Date.now().toString()
    };
    const updatedParams = [...currentParams, newParam].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    saveWaterParamsMutation.mutate(updatedParams);
  };

  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
    }
  });

  const updateNotificationSettings = (settings: NotificationSettings) => {
    saveNotificationSettingsMutation.mutate(settings);
    scheduleNotifications(settings);
  };

  const scheduleNotifications = async (settings: NotificationSettings) => {
    if (Platform.OS === 'web' || isExpoGo || !Notifications) {
      console.log('Notifications not available in this environment');
      return;
    }
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      if (settings.measurementReminders) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🐟 Koi Measurement Reminder',
            body: 'Time to measure your koi growth!',
            data: { type: 'measurement' },
          },
          trigger: {
            seconds: settings.measurementInterval * 24 * 60 * 60,
            repeats: true,
          },
        });
      }
      
      if (settings.waterTestReminders) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Water Test Reminder',
            body: 'Time to test your pond water parameters!',
            data: { type: 'waterTest' },
          },
          trigger: {
            seconds: settings.waterTestInterval * 24 * 60 * 60,
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to schedule notifications:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web' || isExpoGo || !Notifications) {
      console.log('Notifications not available in this environment');
      return false;
    }
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.warn('Failed to request notification permissions:', error);
      return false;
    }
  };

  return {
    koi: koiQuery.data || [],
    waterParameters: waterParamsQuery.data || [],
    notificationSettings: notificationSettingsQuery.data || {
      measurementReminders: true,
      waterTestReminders: true,
      measurementInterval: 7,
      waterTestInterval: 3,
    },
    isLoading: koiQuery.isLoading || waterParamsQuery.isLoading,
    addKoi,
    updateKoi,
    addPhotoToKoi,
    deleteKoi,
    addWaterParameter,
    updateNotificationSettings,
    requestNotificationPermissions,
    isSaving: saveKoiMutation.isPending || saveWaterParamsMutation.isPending
  };
});