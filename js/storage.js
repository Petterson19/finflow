/**
 * Storage module - Handles all localStorage operations
 */
const Storage = (() => {
  const KEYS = {
    TRANSACTIONS: 'ff_tx',
    BILLS: 'ff_bills',
    CATEGORIES: 'ff_cats'
  };

  return {
    getTransactions: () => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
    getBills: () => JSON.parse(localStorage.getItem(KEYS.BILLS) || '[]'),
    getCategories: () => JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]'),

    save: (transactions, bills, customCats) => {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(customCats));
    }
  };
})();