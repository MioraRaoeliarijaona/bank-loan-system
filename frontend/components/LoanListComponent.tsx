import React, { useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Colors } from '@/constants/theme';
import { PaymentStatsChart } from '@/components/PaymentStatsChart';
import { calculatePaymentAmount, calculatePaymentStats } from '@/utils/paymentStats';

interface Loan {
  id: number;
  n_compte: string;
  nom_client: string;
  nom_banque: string;
  montant: number;
  date_pret: string;
  taux_pret: number;
}

interface LoanListProps {
  loans: Loan[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loanId: number) => void;
  refreshing?: boolean;
}

export const LoanList: React.FC<LoanListProps> = ({
  loans,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  refreshing = false,
}) => {
  const loansWithCalculations = useMemo(
    () =>
      loans.map((loan) => ({
        ...loan,
        montantAPayer: calculatePaymentAmount(loan),
      })),
    [loans]
  );

  const paymentStats = useMemo(() => calculatePaymentStats(loans), [loans]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const renderLoanItem = ({ item }: { item: Loan & { montantAPayer: number } }) => {
    const formattedDate = format(new Date(item.date_pret), 'dd/MM/yyyy');

    return (
      <View style={styles.loanCard}>
        <View style={styles.loanContent}>
          <View style={styles.loanHeader}>
            <View>
              <Text style={styles.clientName}>{item.nom_client}</Text>
              <Text style={styles.accountNumber}>{item.n_compte}</Text>
            </View>
            <View style={styles.bankBadge}>
              <Text style={styles.bankBadgeText}>{item.nom_banque}</Text>
            </View>
          </View>

          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant prêté</Text>
              <Text style={styles.detailValue}>{formatCurrency(item.montant)} DA</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taux</Text>
              <Text style={styles.detailValue}>{item.taux_pret}%</Text>
            </View>
            <View style={[styles.detailRow, styles.amountToPay]}>
              <Text style={[styles.detailLabel, styles.amountLabel]}>Montant à payer</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>
                {formatCurrency(item.montantAPayer)} DA
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(item)}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
            <MaterialIcons name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && loans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (loans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="folder-open" size={60} color="#B7C8D5" />
        <Text style={styles.emptyText}>Aucun prêt trouvé</Text>
        <Text style={styles.emptySubtext}>
          Appuyez sur &quot;Ajouter&quot; pour créer un nouveau prêt
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={loansWithCalculations}
      renderItem={renderLoanItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <View style={styles.summaryPanel}>
            <Text style={styles.summaryTitle}>Statistiques du montant à payer</Text>
            <Text style={styles.summarySubtitle}>
              Résumé global affiché directement sous la liste des prêts.
            </Text>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.summaryCardWide]}>
                <Text style={styles.summaryLabel}>Montant total</Text>
                <Text style={[styles.summaryValue, styles.totalAccent]}>
                  {formatCurrency(paymentStats.total)} DA
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Montant minimal</Text>
                <Text style={[styles.summaryValue, styles.minAccent]}>
                  {formatCurrency(paymentStats.min)} DA
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Montant maximal</Text>
                <Text style={[styles.summaryValue, styles.maxAccent]}>
                  {formatCurrency(paymentStats.max)} DA
                </Text>
              </View>
            </View>
          </View>

          <PaymentStatsChart stats={paymentStats} title="Histogramme des montants à payer" />
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  centerContainer: {
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
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A4AF',
    marginTop: 8,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: '#0B3B52',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E7EFF5',
  },
  loanContent: {
    flex: 1,
    padding: 18,
  },
  loanHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
    color: '#7A8B98',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  bankBadge: {
    backgroundColor: '#E7F2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bankBadgeText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  loanDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6E7F8D',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  amountToPay: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  amountLabel: {
    color: '#0F766E',
  },
  amountValue: {
    color: '#0F766E',
    fontSize: 15,
  },
  actionButtons: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderLeftWidth: 1,
    borderLeftColor: '#E7EFF5',
    backgroundColor: '#F8FBFD',
  },
  editButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 11,
  },
  footerContainer: {
    marginTop: 10,
  },
  summaryPanel: {
    marginTop: 6,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#F4FAF8',
    borderWidth: 1,
    borderColor: '#DCEFE7',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  summarySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#6D817D',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  summaryCardWide: {
    minWidth: '100%',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#70828D',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  totalAccent: {
    color: '#0F766E',
  },
  minAccent: {
    color: '#F59E0B',
  },
  maxAccent: {
    color: '#1D4ED8',
  },
});
