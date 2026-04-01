import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  Modal,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

import { Colors } from '@/constants/theme';

interface LoanFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const BANK_OPTIONS = ['BNI', 'BRED', 'BOA', 'Banque Nationale', 'BanqueOne'];
const WEEK_DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateString = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

export const LoanForm: React.FC<LoanFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false,
}) => {
  const toast = useToast();
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());
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
      const nextDate = initialData.date_pret?.substring(0, 10) || '';

      setFormData({
        n_compte: initialData.n_compte || '',
        nom_client: initialData.nom_client || '',
        nom_banque: initialData.nom_banque || '',
        montant: initialData.montant?.toString() || '',
        date_pret: nextDate,
        taux_pret: initialData.taux_pret?.toString() || '',
      });
      setDisplayMonth(nextDate ? parseDateString(nextDate) : new Date());
    } else {
      setFormData({
        n_compte: '',
        nom_client: '',
        nom_banque: '',
        montant: '',
        date_pret: '',
        taux_pret: '',
      });
      setDisplayMonth(new Date());
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

  const calendarDays = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: { key: string; day?: number }[] = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ key: `empty-start-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ key: `day-${day}`, day });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ key: `empty-end-${cells.length}` });
    }

    return cells;
  }, [displayMonth]);

  const selectedDate = formData.date_pret || formatDateInput(new Date());

  const changeMonth = (delta: number) => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    handleInputChange('date_pret', formatDateInput(selected));
    setCalendarVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>
                  {isEditMode ? 'Modifier le prêt' : 'Nouveau prêt'}
                </Text>
                <Text style={styles.subtitle}>
                  Saisie rapide, pensée pour un usage confortable sur téléphone.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                style={styles.closeButtonWrap}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom de la Banque</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setBankModalVisible(true)}
                  disabled={isLoading}>
                  <Text style={formData.nom_banque ? styles.selectText : styles.placeholderText}>
                    {formData.nom_banque || 'Choisir une banque'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={22} color="#6D7D88" />
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formHalf]}>
                  <Text style={styles.label}>Montant (DA)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50000"
                    value={formData.montant}
                    onChangeText={(value) => handleInputChange('montant', value)}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                </View>

                <View style={[styles.formGroup, styles.formHalf]}>
                  <Text style={styles.label}>Taux (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3.5"
                    value={formData.taux_pret}
                    onChangeText={(value) => handleInputChange('taux_pret', value)}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date du Prêt</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setCalendarVisible(true)}
                  disabled={isLoading}>
                  <View style={styles.dateValueWrap}>
                    <MaterialIcons name="calendar-month" size={20} color="#0F766E" />
                    <Text style={formData.date_pret ? styles.selectText : styles.placeholderText}>
                      {formData.date_pret || 'Choisir une date'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#6D7D88" />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={isLoading}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isEditMode ? 'Mettre à jour' : 'Créer'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>

          <Modal visible={bankModalVisible} animationType="fade" transparent>
            <Pressable style={styles.innerOverlay} onPress={() => setBankModalVisible(false)}>
              <Pressable style={styles.selectionCard}>
                <Text style={styles.selectionTitle}>Choisir une banque</Text>
                {BANK_OPTIONS.map((bank) => (
                  <TouchableOpacity
                    key={bank}
                    style={[
                      styles.selectionOption,
                      formData.nom_banque === bank && styles.selectionOptionActive,
                    ]}
                    onPress={() => {
                      handleInputChange('nom_banque', bank);
                      setBankModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.selectionOptionText,
                        formData.nom_banque === bank && styles.selectionOptionTextActive,
                      ]}>
                      {bank}
                    </Text>
                    {formData.nom_banque === bank && (
                      <MaterialIcons name="check-circle" size={20} color="#0F766E" />
                    )}
                  </TouchableOpacity>
                ))}
              </Pressable>
            </Pressable>
          </Modal>

          <Modal visible={calendarVisible} animationType="fade" transparent>
            <Pressable style={styles.innerOverlay} onPress={() => setCalendarVisible(false)}>
              <Pressable style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    style={styles.calendarNavButton}>
                    <MaterialIcons name="chevron-left" size={22} color={Colors.light.text} />
                  </TouchableOpacity>
                  <Text style={styles.calendarTitle}>{getMonthLabel(displayMonth)}</Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNavButton}>
                    <MaterialIcons name="chevron-right" size={22} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekHeader}>
                  {WEEK_DAYS.map((day) => (
                    <Text key={day} style={styles.weekDay}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarDays.map((cell) => {
                    if (typeof cell.day !== 'number') {
                      return <View key={cell.key} style={styles.dayCell} />;
                    }

                    const day: number = cell.day;

                    const dateValue = formatDateInput(
                      new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
                    );
                    const isSelected = selectedDate === dateValue;

                    return (
                      <TouchableOpacity
                        key={cell.key}
                        style={[styles.dayCell, styles.dayButton, isSelected && styles.dayButtonActive]}
                        onPress={() => handleDateSelect(day)}>
                        <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 21, 34, 0.36)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
  },
  sheet: {
    height: '88%',
    width: '100%',
    backgroundColor: '#F7FBFD',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#6D7D88',
  },
  closeButtonWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1F5',
  },
  closeButton: {
    fontSize: 24,
    color: '#5B6A75',
  },
  form: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#31424E',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E4EC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: Colors.light.text,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#D6E4EC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: '#92A3AF',
  },
  dateValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EAF1F5',
  },
  submitButton: {
    backgroundColor: '#0F766E',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: '#4B5D69',
    fontSize: 16,
    fontWeight: '700',
  },
  innerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 21, 34, 0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 14,
  },
  selectionOption: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E3EDF3',
    marginBottom: 10,
  },
  selectionOptionActive: {
    borderColor: '#A7D7CB',
    backgroundColor: '#ECFDF5',
  },
  selectionOptionText: {
    fontSize: 15,
    color: '#425560',
    fontWeight: '600',
  },
  selectionOptionTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#7C8E99',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '12.9%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    borderRadius: 14,
    backgroundColor: '#F5F9FB',
  },
  dayButtonActive: {
    backgroundColor: '#0F766E',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#43535F',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
});
