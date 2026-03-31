import { useState, useEffect, useCallback } from 'react';
import { loanAPI } from '../services/api';

export interface Loan {
  id: number;
  n_compte: string;
  nom_client: string;
  nom_banque: string;
  montant: number;
  date_pret: string;
  taux_pret: number;
  created_at?: string;
  updated_at?: string;
}

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanAPI.getAllLoans();
      setLoans(response.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching loans';
      setError(errorMessage);
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const addLoan = useCallback(async (loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await loanAPI.createLoan(loanData);
      setLoans((prevLoans) => [response.data.loan, ...prevLoans]);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding loan';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateLoan = useCallback(async (id: number, loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await loanAPI.updateLoan(id, loanData);
      setLoans((prevLoans) => prevLoans.map((loan) => (loan.id === id ? response.data.loan : loan)));
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating loan';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteLoan = useCallback(async (id: number) => {
    try {
      await loanAPI.deleteLoan(id);
      setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting loan';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    addLoan,
    updateLoan,
    deleteLoan,
  };
};

export interface Statistics {
  total_loans: number;
  montant_total_payer: number | string;
  montant_min_payer: number | string;
  montant_max_payer: number | string;
  montant_avg_payer: number | string;
  montant_total_pret: number | string;
}

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanAPI.getStatistics();
      setStatistics(response.data || null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};
