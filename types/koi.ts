// Placeholder content for koi.ts
export interface KoiPhoto {
  id: string;
  uri: string;
  date: string;
  length?: number;
  weight?: number;
  notes?: string;
}

export interface Koi {
  id: string;
  name: string;
  variety: string;
  birthDate: string;
  photos: KoiPhoto[];
  currentLength?: number;
  currentWeight?: number;
  notes?: string;
}

export interface WaterParameter {
  id: string;
  date: string;
  temperature: number;
  ph: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  oxygen?: number;
  notes?: string;
}

export interface NotificationSettings {
  measurementReminders: boolean;
  waterTestReminders: boolean;
  measurementInterval: number; // days
  waterTestInterval: number; // days
}