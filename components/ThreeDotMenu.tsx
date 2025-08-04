import { router } from 'expo-router';
import { BarChart3, Edit, MoreVertical, Trash } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

interface ThreeDotMenuProps {
  koiId: string;
  onDelete: () => void;
}

export default function ThreeDotMenu({ koiId, onDelete }: ThreeDotMenuProps) {
  const handleEdit = () => {
    router.push(`/koi/edit/${koiId}`);
  };

  const handleViewGrowth = () => {
    router.push(`/koi/growth/${koiId}`);
  };

  return (
    <Menu>
      <MenuTrigger>
        <MoreVertical size={24} color="#FFFFFF" />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={handleEdit}>
          <View style={styles.menuOption}>
            <Edit size={20} color="#333" />
            <Text style={styles.menuText}>Edit</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onDelete}>
          <View style={styles.menuOption}>
            <Trash size={20} color="#E74C3C" />
            <Text style={[styles.menuText, { color: '#E74C3C' }]}>Delete</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={handleViewGrowth}>
          <View style={styles.menuOption}>
            <BarChart3 size={20} color="#2E7D8A" />
            <Text style={styles.menuText}>View Growth</Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
