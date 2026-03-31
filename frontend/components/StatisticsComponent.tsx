import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { VictoryBar, VictoryPie, VictoryChart } from 'victory-native';
import { Colors } from '../constants/theme';

interface Statistics {
  total_loans: number;
  montant_total_payer: number;
  montant_min_payer: number;
  montant_max_payer: number;
  montant_avg_payer: number;
  montant_total_pret: number;
}

interface StatisticsComponentProps {
  statistics: Statistics | null;
  loading: boolean;
  loans: any[];
}

export const StatisticsComponent: React.FC<StatisticsComponentProps> = ({
  statistics,
  loading,
  loans,
}) => {
  // Format number to French locale
  const formatNumber = (num: number) => {
    return num?.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || '0.00';
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!statistics) return [];
    return [
      {
        x: 'Total',
        y: Number(statistics.montant_total_payer) || 0,
      },
      {
        x: 'Min',
        y: Number(statistics.montant_min_payer) || 0,
      },
      {
        x: 'Max',
        y: Number(statistics.montant_max_payer) || 0,
      },
    ];
  }, [statistics]);

  const pieChartData = useMemo(() => {
    if (!statistics || statistics.montant_total_payer === 0) return [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    
    return [
      {
        x: 'Total',
        y: Number(statistics.montant_total_payer) || 0,
        color: colors[0],
      },
      {
        x: 'Moyenne',
        y: Number(statistics.montant_avg_payer) || 0,
        color: colors[1],
      },
      {
        x: 'Intervalle',
        y: (Number(statistics.montant_max_payer) || 0) - (Number(statistics.montant_min_payer) || 0),
        color: colors[2],
      },
    ];
  }, [statistics]);

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Statistics */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Résumé des Statistiques</Text>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Nombre de Prêts</Text>
            <Text style={styles.statValue}>{statistics.total_loans}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant Total Prêté</Text>
            <Text style={styles.statValue}>{formatNumber(statistics.montant_total_pret)}</Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total à Payer</Text>
            <Text style={[styles.statValue, styles.totalValue]}>
              {formatNumber(statistics.montant_total_payer)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant Minimal</Text>
            <Text style={[styles.statValue, styles.minValue]}>
              {formatNumber(statistics.montant_min_payer)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant Maximal</Text>
            <Text style={[styles.statValue, styles.maxValue]}>
              {formatNumber(statistics.montant_max_payer)}
            </Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant Moyen</Text>
            <Text style={styles.statValue}>{formatNumber(statistics.montant_avg_payer)}</Text>
            <Text style={styles.statUnit}>DA</Text>
          </View>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Graphique en Barres</Text>
        <View style={styles.chartWrapper}>
          <VictoryChart domainPadding={{ x: 50, y: 50 }}>
            <VictoryBar
              data={chartData}
              x="x"
              y="y"
              style={{
                data: { fill: "#4ECDC4" }
              }}
            />
          </VictoryChart>
        </View>
      </View>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Diagramme Circulaire</Text>
        <View style={styles.chartWrapper}>
          <VictoryPie
            data={pieChartData}
            x="x"
            y="y"
            colorScale={pieChartData.map(item => item.color)}
          />
        </View>
      </View>

      {/* Breakdown by Bank */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>Répartition par Banque</Text>
        {loans.length > 0 && (
          <View>
            {Array.from(
              new Map(
                loans.map((loan) => [
                  loan.nom_banque,
                  {
                    name: loan.nom_banque,
                    count: 0,
                    total: 0,
                    montantAPayer: 0,
                  },
                ])
              ).entries()
            )
              .map(([_, bank]) => {
                const bankLoans = loans.filter((l) => l.nom_banque === bank.name);
                const count = bankLoans.length;
                const total = bankLoans.reduce((sum, l) => sum + l.montant, 0);
                const montantAPayer = bankLoans.reduce(
                  (sum, l) => sum + l.montant * (1 + l.taux_pret / 100),
                  0
                );
                return (
                  <View key={bank.name} style={styles.bankCard}>
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankName}>{bank.name}</Text>
                      <View style={styles.bankStats}>
                        <Text style={styles.bankStat}>
                          Prêts: <Text style={styles.bankStatValue}>{count}</Text>
                        </Text>
                        <Text style={styles.bankStat}>
                          Total: <Text style={styles.bankStatValue}>{formatNumber(total)}</Text> DA
                        </Text>
                        <Text style={styles.bankStat}>
                          À payer:{' '}
                          <Text style={[styles.bankStatValue, styles.bankHighlight]}>
                            {formatNumber(montantAPayer)}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 15,
    marginTop: 20,
  },
  summaryContainer: {
    marginBottom: 30,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 10,
    color: '#bbb',
    marginTop: 4,
  },
  totalValue: {
    color: '#FF6B6B',
  },
  minValue: {
    color: '#4ECDC4',
  },
  maxValue: {
    color: '#45B7D1',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    alignSelf: 'center',
  },
  breakdownContainer: {
    marginBottom: 30,
  },
  bankCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfo: {
    gap: 10,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  bankStats: {
    gap: 6,
  },
  bankStat: {
    fontSize: 12,
    color: '#666',
  },
  bankStatValue: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  bankHighlight: {
    color: '#FF6B6B',
  },
});
