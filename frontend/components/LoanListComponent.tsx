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
import { Colors } from '../constants/theme';

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
  // Calculate amount to pay for each loan
  const loansWithCalculations = useMemo(
    () =>
      loans.map((loan) => ({
        ...loan,
        montantAPayer: loan.montant * (1 + loan.taux_pret / 100),
      })),
    [loans]
  );

  const renderLoanItem = ({ item }: { item: Loan & { montantAPayer: number } }) => {
    const formattedDate = format(new Date(item.date_pret), 'dd/MM/yyyy');

    return (
      <View style={styles.loanCard}>
        <View style={styles.loanContent}>
          <View style={styles.loanHeader}>
            <Text style={styles.clientName}>{item.nom_client}</Text>
            <Text style={styles.accountNumber}>{item.n_compte}</Text>
          </View>

          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Banque:</Text>
              <Text style={styles.detailValue}>{item.nom_banque}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant:</Text>
              <Text style={styles.detailValue}>{item.montant.toLocaleString('fr-FR')} DA</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taux:</Text>
              <Text style={styles.detailValue}>{item.taux_pret}%</Text>
            </View>
            <View style={[styles.detailRow, styles.amountToPay]}>
              <Text style={[styles.detailLabel, styles.amountLabel]}>Montant à Payer:</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>
                {item.montantAPayer.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })} DA
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id)}
          >
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
        <MaterialIcons name="folder-open" size={60} color="#ccc" />
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  loanContent: {
    flex: 1,
    padding: 15,
  },
  loanHeader: {
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  loanDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
  amountToPay: {
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  amountLabel: {
    color: '#1976d2',
  },
  amountValue: {
    color: '#1976d2',
    fontSize: 14,
  },
  actionButtons: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 20,
    padding: 10,
  },
});
