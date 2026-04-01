import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';

import { Colors } from '@/constants/theme';
import { PaymentStats } from '@/utils/paymentStats';

interface PaymentStatsChartProps {
  stats: PaymentStats;
  title?: string;
}

const BAR_COLORS = ['#0F766E', '#F59E0B', '#1D4ED8'];

export const PaymentStatsChart: React.FC<PaymentStatsChartProps> = ({
  stats,
  title = 'Montants à payer',
}) => {
  const { width } = useWindowDimensions();

  const chartData = useMemo(
    () => [
      { x: 'Total', y: stats.total, fill: BAR_COLORS[0] },
      { x: 'Min', y: stats.min, fill: BAR_COLORS[1] },
      { x: 'Max', y: stats.max, fill: BAR_COLORS[2] },
    ],
    [stats]
  );

  const chartWidth = Math.max(width - 72, 260);

  const formatNumber = (value: number) =>
    value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }

    return `${Math.round(value)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Comparaison du montant total, minimal et maximal</Text>
      <View style={styles.chartCard}>
        <VictoryChart
          width={chartWidth}
          height={290}
          theme={VictoryTheme.material}
          domainPadding={{ x: 38, y: 22 }}
          padding={{ top: 32, bottom: 48, left: 76, right: 36 }}>
          <VictoryAxis
            style={{
              axis: { stroke: '#D6E4EC' },
              tickLabels: { fill: '#5B6B79', fontSize: 12, fontWeight: '600' },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={formatAxisTick}
            style={{
              axis: { stroke: 'transparent' },
              grid: { stroke: '#E6EEF3', strokeDasharray: '6,8' },
              tickLabels: { fill: '#7A8B98', fontSize: 11 },
            }}
          />
          <VictoryBar
            data={chartData}
            x="x"
            y="y"
            barWidth={36}
            cornerRadius={{ top: 10 }}
            labels={({ datum }) => `${formatNumber(datum.y)} DA`}
            labelComponent={
              <VictoryLabel
                dy={-10}
                style={{ fill: Colors.light.text, fontSize: 10, fontWeight: '700' }}
              />
            }
            style={{
              data: {
                fill: ({ datum }) => datum.fill,
                opacity: 0.95,
              },
            }}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7B88',
  },
  chartCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E5EEF3',
    shadowColor: '#0B3B52',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
});
