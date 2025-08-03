// Placeholder content for koi-data.ts
import { Koi } from '@/types/koi';

export const MOCK_KOI: Koi[] = [
  {
    id: '1',
    name: 'Sakura',
    variety: 'Kohaku',
    birthDate: '2023-03-15',
    currentLength: 25,
    currentWeight: 450,
    photos: [
      {
        id: '1-1',
        uri: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        date: '2023-03-15',
        length: 8,
        weight: 45,
        notes: 'Just arrived home'
      },
      {
        id: '1-2',
        uri: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800&h=600&fit=crop',
        date: '2023-09-15',
        length: 18,
        weight: 180,
        notes: '6 months growth'
      },
      {
        id: '1-3',
        uri: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
        date: '2024-03-15',
        length: 25,
        weight: 450,
        notes: '1 year old - beautiful colors developing'
      }
    ]
  },
  {
    id: '2',
    name: 'Kenzo',
    variety: 'Showa Sanshoku',
    birthDate: '2022-05-20',
    currentLength: 35,
    currentWeight: 800,
    photos: [
      {
        id: '2-1',
        uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        date: '2022-05-20',
        length: 12,
        weight: 85,
        notes: 'Young Showa with great potential'
      },
      {
        id: '2-2',
        uri: 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&h=600&fit=crop',
        date: '2023-05-20',
        length: 28,
        weight: 520,
        notes: '1 year - black patterns emerging'
      },
      {
        id: '2-3',
        uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
        date: '2024-05-20',
        length: 35,
        weight: 800,
        notes: '2 years - stunning Showa pattern'
      }
    ]
  },
  {
    id: '3',
    name: 'Yuki',
    variety: 'Platinum Ogon',
    birthDate: '2023-08-10',
    currentLength: 20,
    currentWeight: 280,
    photos: [
      {
        id: '3-1',
        uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        date: '2023-08-10',
        length: 6,
        weight: 25,
        notes: 'Tiny platinum baby'
      },
      {
        id: '3-2',
        uri: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
        date: '2024-02-10',
        length: 15,
        weight: 150,
        notes: '6 months - metallic sheen developing'
      },
      {
        id: '3-3',
        uri: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800&h=600&fit=crop',
        date: '2024-08-10',
        length: 20,
        weight: 280,
        notes: '1 year - beautiful platinum shine'
      }
    ]
  }
];