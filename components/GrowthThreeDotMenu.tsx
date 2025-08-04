import { Edit, MoreVertical, Trash } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

interface GrowthThreeDotMenuProps {
  koiId: string;
  photoId: string;
  onDelete: () => void;
  onEdit: () => void;
}

export default function GrowthThreeDotMenu({ koiId, photoId, onDelete, onEdit }: GrowthThreeDotMenuProps) {
  return (
    <Menu>
      <MenuTrigger>
        <MoreVertical size={24} color="#666" />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={onEdit}>
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
