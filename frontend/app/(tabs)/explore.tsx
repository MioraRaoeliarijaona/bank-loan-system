import React, { useCallback } from 'react';
import { View, SafeAreaView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useLoans, useStatistics } from '@/hooks/useLoans';
import { StatisticsComponent } from '@/components/StatisticsComponent';
import { Colors } from '@/constants/theme';

export default function StatisticsScreen() {
  const { loans, loading: loansLoading } = useLoans();
  const { statistics, loading: statsLoading, refetch } = useStatistics();

  // Refresh statistics when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques des Prêts</Text>
        <Text style={styles.subtitle}>Analyses et visualisations</Text>
      </View>

      <StatisticsComponent
        statistics={statistics}
        loading={statsLoading || loansLoading}
        loans={loans}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
