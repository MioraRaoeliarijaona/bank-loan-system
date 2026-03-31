import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';

import { useLoans } from '@/hooks/useLoans';
import { LoanForm } from '@/components/LoanForm';
import { LoanList } from '@/components/LoanListComponent';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Colors } from '@/constants/theme';

export default function LoansScreen() {
  const toast = useToast();
  const { loans, loading, fetchLoans, addLoan, updateLoan, deleteLoan } = useLoans();

  const [formVisible, setFormVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Refresh loans when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [fetchLoans])
  );

  const handleAddPress = () => {
    setSelectedLoan(null);
    setIsEditMode(false);
    setFormVisible(true);
  };

  const handleEditPress = (loan: any) => {
    setSelectedLoan(loan);
    setIsEditMode(true);
    setFormVisible(true);
  };

  const handleDeletePress = (loanId: number) => {
    const loan = loans.find((l) => l.id === loanId);
    setSelectedLoan(loan);
    setDeleteConfirmVisible(true);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedLoan) {
        await updateLoan(selectedLoan.id, formData);
        toast.show('Prêt modifié avec succès', {
          type: 'success',
          placement: 'top',
          duration: 3000,
        });
      } else {
        await addLoan(formData);
        toast.show('Prêt créé avec succès', {
          type: 'success',
          placement: 'top',
          duration: 3000,
        });
      }
      setFormVisible(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Une erreur est survenue';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'top',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteLoan(selectedLoan.id);
      toast.show('Prêt supprimé avec succès', {
        type: 'success',
        placement: 'top',
        duration: 3000,
      });
      setDeleteConfirmVisible(false);
      setSelectedLoan(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression';
      toast.show(errorMessage, {
        type: 'danger',
        placement: 'top',
        duration: 3000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestion des Prêts</Text>
          <Text style={styles.subtitle}>{loans.length} prêt(s) au total</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          disabled={isSubmitting}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <LoanList
        loans={loans}
        loading={loading}
        onRefresh={fetchLoans}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
        refreshing={loading}
      />

      <LoanForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLoan}
        isEditMode={isEditMode}
        isLoading={isSubmitting}
      />

      <DeleteConfirmDialog
        visible={deleteConfirmVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmVisible(false)}
        loading={deleteLoading}
        loanInfo={
          selectedLoan
            ? {
                nom_client: selectedLoan.nom_client,
                n_compte: selectedLoan.n_compte,
              }
            : undefined
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
