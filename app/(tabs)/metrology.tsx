import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Platform } from 'react-native';
import { Info, TrendingUp, Clock, Target, Zap, BarChart3, Activity, Brain, Download, Share } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const { width: screenWidth } = Dimensions.get('window');

export default function MetrologyScreen() {
  const { timeBlocks, currentMetrics, chronoFingerprint } = useChrona();

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 11,
      fill: '#6B7280',
      fontWeight: '500',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F3F4F6',
      strokeWidth: 1,
    },
    fillShadowGradientFrom: '#6366F1',
    fillShadowGradientTo: '#8B5CF6',
    fillShadowGradientFromOpacity: 0.4,
    fillShadowGradientToOpacity: 0.1,
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
        strokeWidth: 3,
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

  const handleExportData = () => {
    Alert.alert(
      'Export Analytics Data',
      'Choose your export format for temporal metrics and insights:',
      [
        { text: 'CSV Report', onPress: () => Alert.alert('Export', 'CSV export would generate a comprehensive spreadsheet with all temporal metrics') },
        { text: 'JSON Data', onPress: () => Alert.alert('Export', 'JSON export would provide raw data for external analysis tools') },
        { text: 'PDF Summary', onPress: () => Alert.alert('Export', 'PDF export would create a formatted analytics report') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShareInsights = () => {
    Alert.alert(
      'Share Insights',
      'Share your productivity insights with your team or coach:',
      [
        { text: 'Share Summary', onPress: () => Alert.alert('Share', 'Anonymized productivity summary would be shared') },
        { text: 'Generate Report', onPress: () => Alert.alert('Share', 'Detailed report would be generated for sharing') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Enterprise productivity insights</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleShareInsights}
            >
              <Share size={18} color={Colors.primary[500]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleExportData}
            >
              <Download size={18} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Chrono-Fingerprint */}
        <View style={styles.gradientCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.gradientCardTitle}>Your Focus Profile</Text>
            <TouchableOpacity>
              <Info size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.fingerprintGrid}>
            <View style={styles.fingerprintItem}>
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.fingerprintLabel}>Peak Focus</Text>
              <Text style={styles.fingerprintValue}>
                {chronoFingerprint.peakFocusHour}:00 - {chronoFingerprint.peakFocusHour + 2}:00
              </Text>
            </View>
            <View style={styles.fingerprintItem}>
              <Target size={20} color="#FFFFFF" />
              <Text style={styles.fingerprintLabel}>Stability Window</Text>
              <Text style={styles.fingerprintValue}>{chronoFingerprint.stabilityWindow}</Text>
            </View>
            <View style={styles.fingerprintItem}>
              <Zap size={20} color="#FFFFFF" />
              <Text style={styles.fingerprintLabel}>Resolution</Text>
              <Text style={styles.fingerprintValue}>{chronoFingerprint.avgResolution} min</Text>
            </View>
          </View>
        </View>

        {/* Current Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Live Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#EFF6FF' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#3B82F6' }]}>
                <Target size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Resolution</Text>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{currentMetrics.resolution}m</Text>
              <Text style={styles.metricDescription}>Smallest tracked unit</Text>
            </View>
            
            <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#F59E0B' }]}>
                <TrendingUp size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Jitter</Text>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{currentMetrics.jitter.toFixed(1)}m</Text>
              <Text style={styles.metricDescription}>Timing variance</Text>
            </View>
            
            <View style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#10B981' }]}>
                <Clock size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Drift</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{currentMetrics.drift.toFixed(1)}m</Text>
              <Text style={styles.metricDescription}>Plan deviation</Text>
            </View>
            
            <View style={[styles.metricCard, { backgroundColor: '#FDF2F8' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#EC4899' }]}>
                <Zap size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Latency</Text>
              <Text style={[styles.metricValue, { color: '#EC4899' }]}>{currentMetrics.latency.toFixed(1)}m</Text>
              <Text style={styles.metricDescription}>Start delay</Text>
            </View>
          </View>
        </View>

        {/* Jitter Over Time */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Rhythm</Text>
            <Text style={styles.chartDescription}>Timing variance throughout the day</Text>
          </View>
          {Platform.OS !== 'web' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={jitterData}
                width={screenWidth * 1.2}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
            </ScrollView>
          ) : (
            <View style={styles.webChartPlaceholder}>
              <Text style={styles.webChartText}>📊 Chart visualization available on mobile</Text>
              <Text style={styles.webChartSubtext}>Interactive charts work best in the native app</Text>
            </View>
          )}
        </View>

        {/* Resolution by Day */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Precision</Text>
            <Text style={styles.chartDescription}>Minimum time units by day</Text>
          </View>
          {Platform.OS !== 'web' ? (
            <BarChart
              data={resolutionData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={true}
              showBarTops={false}
              fromZero={true}
              yAxisLabel=""
              yAxisSuffix="m"
            />
          ) : (
            <View style={styles.webChartPlaceholder}>
              <Text style={styles.webChartText}>📊 Chart visualization available on mobile</Text>
              <Text style={styles.webChartSubtext}>Weekly precision metrics work best in the native app</Text>
            </View>
          )}
        </View>

        {/* Drift Analysis */}
        <View style={styles.insightCard}>
          <Text style={styles.sectionTitle}>Schedule Insights</Text>
          <View style={styles.driftGrid}>
            <View style={styles.driftItem}>
              <Text style={styles.driftLabel}>Daily Drift</Text>
              <Text style={styles.driftValue}>+{(currentMetrics.drift * 8).toFixed(0)}m</Text>
              <View style={styles.driftIndicator} />
            </View>
            <View style={styles.driftItem}>
              <Text style={styles.driftLabel}>Weekly Trend</Text>
              <Text style={styles.driftValue}>+{(currentMetrics.drift * 40).toFixed(0)}m</Text>
              <View style={styles.driftIndicator} />
            </View>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>
              💡 Your schedule drifts {currentMetrics.drift > 5 ? 'significantly' : 'moderately'}. 
              Consider {currentMetrics.drift > 5 ? 'larger entropy budgets' : 'tighter estimates'}.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.normal,
  },
  gradientCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    backgroundColor: Colors.accent[600],
    ...Shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gradientCardTitle: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  fingerprintGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fingerprintItem: {
    alignItems: 'center',
    flex: 1,
  },
  fingerprintLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  fingerprintValue: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (screenWidth - 56) / 2,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  metricDescription: {
    fontSize: 10,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  chartDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  insightCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing['4xl'],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  driftGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  driftItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.lg,
  },
  driftLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  driftValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning[600],
    marginBottom: Spacing.sm,
  },
  driftIndicator: {
    width: 24,
    height: 4,
    backgroundColor: Colors.warning[600],
    borderRadius: BorderRadius.sm,
  },
  insightBox: {
    backgroundColor: Colors.info[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info[600],
  },
  insightText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  webChartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderStyle: 'dashed',
  },
  webChartText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  webChartSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },
});