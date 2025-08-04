// Placeholder content for chart.tsx
import { useKoiStore } from '@/hooks/koi-store';
import { Stack } from 'expo-router';
import { BarChart3, Filter, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface ChartDataPoint {
  date: Date;
  length: number;
  weight: number;
  koiName: string;
  koiId: string;
}

interface CustomLineChartProps {
  data: ChartDataPoint[];
  metric: 'length' | 'weight';
  selectedKoi: string[];
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({ data, metric, selectedKoi }) => {
  const chartWidth = screenWidth - 16;

  const filteredData = useMemo(() => {
    return data.filter(point => 
      selectedKoi.length === 0 || selectedKoi.includes(point.koiId)
    );
  }, [data, selectedKoi]);

  const koiGroups = useMemo(() => {
    return filteredData.reduce((groups, point) => {
      if (!groups[point.koiId]) {
        groups[point.koiId] = [];
      }
      groups[point.koiId].push(point);
      return groups;
    }, {} as Record<string, ChartDataPoint[]>);
  }, [filteredData]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const datasets = Object.entries(koiGroups).map(([koiId, points], index) => {
      const sortedPoints = points.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (labels.length === 0) {
        labels.push(...sortedPoints.map(p => p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })));
      }

      return {
        data: sortedPoints.map(p => p[metric]),
        color: (opacity = 1) => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${opacity})`,
        strokeWidth: 2,
        legend: sortedPoints[0]?.koiName || 'Unknown Koi'
      };
    });

    return {
      labels,
      datasets,
      legend: datasets.map(d => d.legend)
    };
  }, [koiGroups, metric]);

  if (chartData.datasets.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={250}
        yAxisLabel={metric === 'length' ? '' : ''}
        yAxisSuffix={metric === 'length' ? ' cm' : ' g'}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(46, 125, 138, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
          },
          propsForBackgroundLines: {
            strokeDasharray: '', 
            stroke: '#E5E5E5',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={true}
        withOuterLines={true}
        fromZero={true}
      />
    </View>
  );
};

export default function ChartScreen() {
  const { koi } = useKoiStore();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKoi, setSelectedKoi] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'length' | 'weight'>('length');

  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    
    koi.forEach(koiItem => {
      koiItem.photos.forEach(photo => {
        if (photo.length && photo.weight) {
          data.push({
            date: new Date(photo.date),
            length: photo.length,
            weight: photo.weight,
            koiName: koiItem.name,
            koiId: koiItem.id,
          });
        }
      });
    });
    
    return data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [koi]);

  const filteredKoi = useMemo(() => {
    return koi.filter(koiItem => 
      koiItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [koi, searchQuery]);

  const toggleKoiSelection = (koiId: string) => {
    setSelectedKoi(prev => 
      prev.includes(koiId) 
        ? prev.filter(id => id !== koiId)
        : [...prev, koiId]
    );
  };

  const clearSelection = () => {
    setSelectedKoi([]);
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Growth Chart',
          headerStyle: { backgroundColor: '#2E7D8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <BarChart3 size={28} color="#2E7D8A" />
          </View>
          <Text style={styles.title}>Koi Growth Over Time</Text>
          <Text style={styles.subtitle}>Track your koi&apos;s development journey</Text>
        </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search koi by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Metric</Text>
        <View style={styles.metricButtons}>
          <TouchableOpacity
            style={[
              styles.metricButton,
              selectedMetric === 'length' && styles.metricButtonActive,
            ]}
            onPress={() => setSelectedMetric('length')}
          >
            <Text style={[
              styles.metricButtonText,
              selectedMetric === 'length' && styles.metricButtonTextActive,
            ]}>
              Length (cm)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.metricButton,
              selectedMetric === 'weight' && styles.metricButtonActive,
            ]}
            onPress={() => setSelectedMetric('weight')}
          >
            <Text style={[
              styles.metricButtonText,
              selectedMetric === 'weight' && styles.metricButtonTextActive,
            ]}>
              Weight (g)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>Filter by Koi</Text>
          {selectedKoi.length > 0 && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.koiFilters}>
          {filteredKoi.map(koiItem => {
            const isSelected = selectedKoi.includes(koiItem.id);
            const hasData = koiItem.photos.some(photo => photo.length && photo.weight);
            
            return (
              <TouchableOpacity
                key={koiItem.id}
                style={[
                  styles.koiFilter,
                  isSelected && styles.koiFilterSelected,
                  !hasData && styles.koiFilterDisabled,
                ]}
                onPress={() => hasData && toggleKoiSelection(koiItem.id)}
                disabled={!hasData}
              >
                <Text style={[
                  styles.koiFilterText,
                  isSelected && styles.koiFilterTextSelected,
                  !hasData && styles.koiFilterTextDisabled,
                ]}>
                  {koiItem.name}
                </Text>
                {!hasData && (
                  <Text style={styles.noDataText}>No data</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>
          {selectedMetric === 'length' ? 'Length Growth' : 'Weight Growth'}
        </Text>
        <CustomLineChart 
          data={chartData} 
          metric={selectedMetric} 
          selectedKoi={selectedKoi}
        />
      </View>

        {selectedKoi.length === 0 && chartData.length > 0 && (
          <View style={styles.hintContainer}>
            <Filter size={16} color="#666" />
            <Text style={styles.hintText}>
              Select koi above to filter the chart, or view all data
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  metricsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  metricButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricButtonActive: {
    backgroundColor: '#2E7D8A',
    borderColor: '#2E7D8A',
    shadowColor: '#2E7D8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  metricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  metricButtonTextActive: {
    color: '#FFFFFF',
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  koiFilters: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  koiFilter: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  koiFilterSelected: {
    backgroundColor: '#2E7D8A',
    borderColor: '#2E7D8A',
    shadowColor: '#2E7D8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  koiFilterDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },
  koiFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  koiFilterTextSelected: {
    color: '#FFFFFF',
  },
  koiFilterTextDisabled: {
    color: '#999',
  },
  noDataText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  chartSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  chartContainer: {
    marginTop: 20,
  },
  emptyChart: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginHorizontal: 24,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
