import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { Colors } from '../constants/theme';

interface LoanFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditMode?: boolean;
  isLoading?: boolean;
}

export const LoanForm: React.FC<LoanFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    n_compte: '',
    nom_client: '',
    nom_banque: '',
    montant: '',
    date_pret: '',
    taux_pret: '',
  });

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData({
        n_compte: initialData.n_compte || '',
        nom_client: initialData.nom_client || '',
        nom_banque: initialData.nom_banque || '',
        montant: initialData.montant?.toString() || '',
        date_pret: initialData.date_pret?.substring(0, 10) || '',
        taux_pret: initialData.taux_pret?.toString() || '',
      });
    } else {
      setFormData({
        n_compte: '',
        nom_client: '',
        nom_banque: '',
        montant: '',
        date_pret: '',
        taux_pret: '',
      });
    }
  }, [visible, initialData, isEditMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.n_compte.trim()) {
      toast.show('Le numéro de compte est requis', { type: 'danger' });
      return false;
    }
    if (!formData.nom_client.trim()) {
      toast.show('Le nom du client est requis', { type: 'danger' });
      return false;
    }
    if (!formData.nom_banque.trim()) {
      toast.show('Le nom de la banque est requis', { type: 'danger' });
      return false;
    }
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      toast.show('Le montant doit être positif', { type: 'danger' });
      return false;
    }
    if (!formData.date_pret) {
      toast.show('La date du prêt est requise', { type: 'danger' });
      return false;
    }
    if (formData.taux_pret === '' || parseFloat(formData.taux_pret) < 0) {
      toast.show('Le taux doit être positif ou 0', { type: 'danger' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        n_compte: formData.n_compte,
        nom_client: formData.nom_client,
        nom_banque: formData.nom_banque,
        montant: parseFloat(formData.montant),
        date_pret: formData.date_pret,
        taux_pret: parseFloat(formData.taux_pret),
      });
      setFormData({
        n_compte: '',
        nom_client: '',
        nom_banque: '',
        montant: '',
        date_pret: '',
        taux_pret: '',
      });
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditMode ? 'Modifier le prêt' : 'Nouveau prêt'}
          </Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Account Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Numéro de Compte</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ACC001"
              value={formData.n_compte}
              onChangeText={(value) => handleInputChange('n_compte', value)}
              editable={!isLoading || !isEditMode}
            />
          </View>

          {/* Client Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du Client</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ahmed Mohamed"
              value={formData.nom_client}
              onChangeText={(value) => handleInputChange('nom_client', value)}
              editable={!isLoading}
            />
          </View>

          {/* Bank Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de la Banque</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Banque Nationale"
              value={formData.nom_banque}
              onChangeText={(value) => handleInputChange('nom_banque', value)}
              editable={!isLoading}
            />
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Montant (DA)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50000"
              value={formData.montant}
              onChangeText={(value) => handleInputChange('montant', value)}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          {/* Loan Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date du Prêt (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2024-01-15"
              value={formData.date_pret}
              onChangeText={(value) => handleInputChange('date_pret', value)}
              editable={!isLoading}
            />
          </View>

          {/* Loan Rate */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Taux de Prêt (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.5"
              value={formData.taux_pret}
              onChangeText={(value) => handleInputChange('taux_pret', value)}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditMode ? 'Mettre à jour' : 'Créer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.light.text,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
