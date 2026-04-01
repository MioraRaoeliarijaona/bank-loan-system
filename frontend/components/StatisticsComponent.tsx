import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { Colors } from '@/constants/theme';
import { PaymentStatsChart } from '@/components/PaymentStatsChart';

interface Statistics {
  total_loans: number;
  montant_total_payer: number | string;
  montant_min_payer: number | string;
  montant_max_payer: number | string;
}

interface StatisticsComponentProps {
  statistics: Statistics | null;
  loading: boolean;
  loans: any[];
}

export const StatisticsComponent: React.FC<StatisticsComponentProps> = ({
  statistics,
  loading,
  loans: _loans,
}) => {
  const formatNumber = (num: number) =>
    num?.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || '0.00';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!statistics || statistics.total_loans === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Pas de statistiques disponibles</Text>
        <Text style={styles.emptySubtext}>Ajoutez des prêts pour voir les statistiques</Text>
      </View>
    );
  }

  const paymentStats = {
    total: Number(statistics.montant_total_payer) || 0,
    min: Number(statistics.montant_min_payer) || 0,
    max: Number(statistics.montant_max_payer) || 0,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Montants à payer</Text>
        <Text style={styles.sectionSubtitle}>
          Vue simplifiée avec les trois indicateurs demandés et un histogramme modernisé.
        </Text>

        <View style={styles.statGrid}>
          <View style={[styles.statCard, styles.statCardLarge]}>
            <Text style={styles.statLabel}>Montant total</Text>
            <Text style={[styles.statValue, styles.totalValue]}>
              {formatNumber(paymentStats.total)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant minimal</Text>
            <Text style={[styles.statValue, styles.minValue]}>
              {formatNumber(paymentStats.min)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant maximal</Text>
            <Text style={[styles.statValue, styles.maxValue]}>
              {formatNumber(paymentStats.max)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>
        </View>
      </View>

      <PaymentStatsChart stats={paymentStats} title="Graphique en barres" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6D7F8C',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#93A3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  sectionSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#69808F',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EEF3',
    shadowColor: '#0B3B52',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statCardLarge: {
    minWidth: '100%',
  },
  statLabel: {
    fontSize: 12,
    color: '#6E7F8D',
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statUnit: {
    fontSize: 11,
    color: '#8B9AA5',
    marginTop: 6,
  },
  totalValue: {
    color: '#0F766E',
  },
  minValue: {
    color: '#F59E0B',
  },
  maxValue: {
    color: '#1D4ED8',
  },
});
