import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Info } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function MetrologyScreen() {
  const { timeBlocks, currentMetrics, chronoFingerprint } = useChrona();

  const chartConfig = {
    backgroundGradientFrom: '#1A1A1A',
    backgroundGradientTo: '#1A1A1A',
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 10,
      fill: '#6B7280',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#2A2A2A',
    },
  };

  const jitterData = useMemo(() => {
    const last7Days = timeBlocks.slice(-168); // Last week of data
    const hourlyJitter = Array(24).fill(0).map((_, hour) => {
      const hourBlocks = last7Days.filter(b => new Date(b.startTime).getHours() === hour);
      if (hourBlocks.length === 0) return 0;
      
      const avgDuration = hourBlocks.reduce((sum, b) => sum + b.duration, 0) / hourBlocks.length;
      const variance = hourBlocks.reduce((sum, b) => sum + Math.pow(b.duration - avgDuration, 2), 0) / hourBlocks.length;
      return Math.sqrt(variance);
    });

    return {
      labels: Array(24).fill(0).map((_, i) => i % 4 === 0 ? `${i}h` : ''),
      datasets: [{
        data: hourlyJitter,
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      }],
    };
  }, [timeBlocks]);

  const resolutionData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyResolution = Array(7).fill(0).map((_, day) => {
      const dayBlocks = timeBlocks.filter(b => new Date(b.startTime).getDay() === day);
      if (dayBlocks.length === 0) return 0;
      
      // Resolution = smallest meaningful time unit tracked
      const minDuration = Math.min(...dayBlocks.map(b => b.duration));
      return minDuration;
    });

    return {
      labels: dayNames,
      datasets: [{
        data: weeklyResolution,
      }],
    };
  }, [timeBlocks]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Chrono-Fingerprint */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Chrono-Fingerprint</Text>
          <Info size={16} color="#6B7280" />
        </View>
        <Text style={styles.fingerprintText}>
          Peak Focus: {chronoFingerprint.peakFocusHour}:00 - {chronoFingerprint.peakFocusHour + 2}:00
        </Text>
        <Text style={styles.fingerprintText}>
          Stability Window: {chronoFingerprint.stabilityWindow}
        </Text>
        <Text style={styles.fingerprintText}>
          Avg Resolution: {chronoFingerprint.avgResolution} min
        </Text>
      </View>

      {/* Current Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Resolution</Text>
            <Text style={styles.metricValue}>{currentMetrics.resolution}m</Text>
            <Text style={styles.metricDescription}>Smallest tracked unit</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Jitter</Text>
            <Text style={styles.metricValue}>{currentMetrics.jitter.toFixed(1)}m</Text>
            <Text style={styles.metricDescription}>Timing variance</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Drift</Text>
            <Text style={styles.metricValue}>{currentMetrics.drift.toFixed(1)}m</Text>
            <Text style={styles.metricDescription}>Plan deviation</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Latency</Text>
            <Text style={styles.metricValue}>{currentMetrics.latency.toFixed(1)}m</Text>
            <Text style={styles.metricDescription}>Start delay</Text>
          </View>
        </View>
      </View>

      {/* Jitter Over Time */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hourly Jitter Pattern</Text>
        <Text style={styles.chartDescription}>Timing variance throughout the day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={jitterData}
            width={screenWidth * 1.5}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        </ScrollView>
      </View>

      {/* Resolution by Day */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Resolution</Text>
        <Text style={styles.chartDescription}>Minimum time units by day</Text>
        <BarChart
          data={resolutionData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={true}
          showBarTops={false}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix="m"
        />
      </View>

      {/* Drift Analysis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drift Analysis</Text>
        <View style={styles.driftGrid}>
          <View style={styles.driftItem}>
            <Text style={styles.driftLabel}>Daily Drift</Text>
            <Text style={styles.driftValue}>+{(currentMetrics.drift * 8).toFixed(0)}m</Text>
          </View>
          <View style={styles.driftItem}>
            <Text style={styles.driftLabel}>Weekly Slope</Text>
            <Text style={styles.driftValue}>+{(currentMetrics.drift * 40).toFixed(0)}m</Text>
          </View>
        </View>
        <Text style={styles.driftInsight}>
          Your schedule drifts {currentMetrics.drift > 5 ? 'significantly' : 'moderately'}. 
          Consider {currentMetrics.drift > 5 ? 'larger entropy budgets' : 'tighter estimates'}.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  card: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metricItem: {
    width: '50%',
    padding: 12,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#0EA5E9',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricDescription: {
    color: '#4B5563',
    fontSize: 10,
  },
  fingerprintText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  driftGrid: {
    flexDirection: 'row',
    marginTop: 8,
  },
  driftItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  driftLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  driftValue: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '600',
  },
  driftInsight: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
});