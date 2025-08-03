// Placeholder content for water.tsx
import { useKoiStore } from '@/hooks/koi-store';
import { WaterParameter } from '@/types/koi';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Activity, AlertTriangle, Droplets, Plus, Thermometer } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WaterScreen() {
  const insets = useSafeAreaInsets();
  const { waterParameters, addWaterParameter, isSaving } = useKoiStore();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<WaterParameter, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    temperature: 0,
    ph: 7.0,
    ammonia: 0,
    nitrite: 0,
    nitrate: 0,
    oxygen: 8,
    notes: '',
  });

  const handleAddParameter = () => {
    if (formData.temperature <= 0 || formData.ph <= 0) {
      Alert.alert('Error', 'Please enter valid values for all required fields.');
      return;
    }

    addWaterParameter(formData);
    setShowAddForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      temperature: 0,
      ph: 7.0,
      ammonia: 0,
      nitrite: 0,
      nitrate: 0,
      oxygen: 8,
      notes: '',
    });
  };

  const getParameterStatus = (param: WaterParameter) => {
    const warnings = [];
    if (param.ph < 6.5 || param.ph > 8.5) warnings.push('pH');
    if (param.ammonia > 0.25) warnings.push('Ammonia');
    if (param.nitrite > 0.25) warnings.push('Nitrite');
    if (param.nitrate > 40) warnings.push('Nitrate');
    if (param.temperature < 15 || param.temperature > 25) warnings.push('Temperature');
    return warnings;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Water Parameters',
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
              <Droplets size={32} color="#2E7D8A" />
              <Text style={styles.title}>Water Quality Tracking</Text>
              <Text style={styles.subtitle}>
                Monitor your pond&apos;s water parameters for healthy koi
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(!showAddForm)}
              testID="add-water-parameter"
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Test</Text>
            </TouchableOpacity>
          </View>

          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>New Water Test</Text>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Temperature (°C)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.temperature.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, temperature: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="20"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>pH</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ph.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, ph: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="7.0"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ammonia (ppm)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ammonia.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, ammonia: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nitrite (ppm)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nitrite.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, nitrite: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nitrate (ppm)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nitrate.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, nitrate: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dissolved Oxygen (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.oxygen?.toString() || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, oxygen: parseFloat(text) || undefined })
                  }
                  keyboardType="numeric"
                  placeholder="8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Any observations or notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleAddParameter}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Test'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.parametersList}>
            {waterParameters.length === 0 ? (
              <View style={styles.emptyState}>
                <Droplets size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Water Tests Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start tracking your pond&apos;s water quality by adding your first test
                </Text>
              </View>
            ) : (
              waterParameters.map((param) => {
                const warnings = getParameterStatus(param);
                const hasWarnings = warnings.length > 0;

                return (
                  <View key={param.id} style={styles.parameterCard}>
                    <View style={styles.parameterHeader}>
                      <View style={styles.parameterDate}>
                        <Text style={styles.parameterDateText}>
                          {formatDate(param.date)}
                        </Text>
                        {hasWarnings && (
                          <View style={styles.warningBadge}>
                            <AlertTriangle size={16} color="#FF6B6B" />
                            <Text style={styles.warningText}>
                              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.parameterGrid}>
                      <View style={styles.parameterItem}>
                        <Thermometer size={20} color="#2E7D8A" />
                        <Text style={styles.parameterLabel}>Temperature</Text>
                        <Text style={styles.parameterValue}>{param.temperature}°C</Text>
                      </View>
                      <View style={styles.parameterItem}>
                        <Activity size={20} color="#2E7D8A" />
                        <Text style={styles.parameterLabel}>pH</Text>
                        <Text style={styles.parameterValue}>{param.ph}</Text>
                      </View>
                      <View style={styles.parameterItem}>
                        <Text style={styles.parameterLabel}>NH₃</Text>
                        <Text style={styles.parameterValue}>{param.ammonia} ppm</Text>
                      </View>
                      <View style={styles.parameterItem}>
                        <Text style={styles.parameterLabel}>NO₂</Text>
                        <Text style={styles.parameterValue}>{param.nitrite} ppm</Text>
                      </View>
                      <View style={styles.parameterItem}>
                        <Text style={styles.parameterLabel}>NO₃</Text>
                        <Text style={styles.parameterValue}>{param.nitrate} ppm</Text>
                      </View>
                      {param.oxygen && (
                        <View style={styles.parameterItem}>
                          <Text style={styles.parameterLabel}>O₂</Text>
                          <Text style={styles.parameterValue}>{param.oxygen} ppm</Text>
                        </View>
                      )}
                    </View>

                    {param.notes && (
                      <View style={styles.parameterNotes}>
                        <Text style={styles.notesText}>{param.notes}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
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
  addButton: {
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
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
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2E7D8A',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  parametersList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  parameterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  parameterHeader: {
    marginBottom: 16,
  },
  parameterDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  parameterDateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  parameterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  parameterItem: {
    alignItems: 'center',
    minWidth: '30%',
    flex: 1,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginTop: 4,
    marginBottom: 2,
  },
  parameterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  parameterNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});