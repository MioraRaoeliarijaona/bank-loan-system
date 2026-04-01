import { Loan } from '@/hooks/useLoans';

export interface PaymentStats {
  total: number;
  min: number;
  max: number;
}

export const calculatePaymentAmount = (loan: Pick<Loan, 'montant' | 'taux_pret'>) =>
  loan.montant * (1 + loan.taux_pret / 100);

export const calculatePaymentStats = (loans: Pick<Loan, 'montant' | 'taux_pret'>[]): PaymentStats => {
  if (loans.length === 0) {
    return {
      total: 0,
      min: 0,
      max: 0,
    };
  }

  const paymentAmounts = loans.map(calculatePaymentAmount);

  return {
    total: paymentAmounts.reduce((sum, amount) => sum + amount, 0),
    min: Math.min(...paymentAmounts),
    max: Math.max(...paymentAmounts),
  };
};
