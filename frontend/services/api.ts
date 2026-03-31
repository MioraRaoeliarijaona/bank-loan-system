import axios, { AxiosResponse } from 'axios';

const API_URL = "http://192.168.1.185:3001";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const axiosError = error instanceof Error ? error : new Error('Unknown error');
    console.error('API Error:', axiosError.message);
    return Promise.reject(error);
  }
);

export const loanAPI = {
  // Get all loans
  getAllLoans: () => apiClient.get('/api/loans'),

  // Get single loan
  getLoanById: (id: number) => apiClient.get(`/api/loans/${id}`),

  // Create new loan
  createLoan: (loanData: any) => apiClient.post('/api/loans', loanData),

  // Update loan
  updateLoan: (id: number, loanData: any) => apiClient.put(`/api/loans/${id}`, loanData),

  // Delete loan
  deleteLoan: (id: number) => apiClient.delete(`/api/loans/${id}`),

  // Get summary statistics
  getStatistics: () => apiClient.get('/api/statistics/summary'),

  // Get statistics by bank
  getStatisticsByBank: () => apiClient.get('/api/statistics/by-bank'),
};

export default apiClient;
