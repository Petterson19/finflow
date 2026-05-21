/**
 * Balance calculation module
 */
const BalanceManager = (() => {
  return {
    update: () => {
      const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const balance = income - expense;
      const pending = bills.filter(b => Utils.getDaysUntil(b.dueDate) >= 0).reduce((s, b) => s + b.amount, 0);
      const proj = balance - pending;
      const hb = document.getElementById('heroBalance');
      hb.textContent = (balance < 0 ? '- ' : '') + Utils.fmt(balance);
      hb.className = 'hero-balance' + (balance > 0 ? ' pos' : balance < 0 ? ' neg' : '');
      document.getElementById('heroIncome').textContent = Utils.fmt(income);
      document.getElementById('heroExpense').textContent = Utils.fmt(expense);
      document.getElementById('heroBills').textContent = Utils.fmt(pending);
      const hp = document.getElementById('heroProjected');
      hp.textContent = (proj < 0 ? '- ' : '') + Utils.fmt(proj);
      hp.style.color = proj < 0 ? 'var(--expense)' : proj === 0 ? 'var(--muted)' : 'var(--accent)';
    }
  };
})();

/**
 * Utility functions for data import/export
 */
const AppUtils = (() => {
  return {
    exportData: () => {
      const data = { transactions, bills, customCats, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const d = new Date();
      a.download = `finflow-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
      a.click();
      Utils.showToast('💾 Backup exportado!');
    },

    importData: (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.transactions && !data.bills) {
            Utils.showToast('⚠️ Arquivo inválido');
            return;
          }
          const ds = data.exportedAt ? new Date(data.exportedAt).toLocaleString('pt-BR') : 'data desconhecida';
          if (!confirm(`Importar backup de ${ds}?\n\nIsso vai substituir todos os dados atuais.`)) return;
          transactions = data.transactions || [];
          bills = data.bills || [];
          customCats = data.customCats || [];
          Storage.save(transactions, bills, customCats);
          FormManager.populateCatSelect('fCategory');
          CategoryManager.render();
          TransactionManager.render();
          TransactionManager.renderCatFilters();
          BalanceManager.update();
          CalendarManager.render();
          NotificationManager.render();
          Utils.showToast('✅ Dados importados!');
        } catch (err) {
          Utils.showToast('⚠️ Erro ao ler o arquivo');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    }
  };
})();

/**
 * Modal management
 */
document.addEventListener('click', e => {
  if (e.target === document.getElementById('editOverlay')) {
    TransactionManager.closeEdit();
  }
});

/**
 * Application initialization
 */
(function init() {
  // Set current month
  const d = new Date();
  document.getElementById('currentMonth').textContent = `${Utils.MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  // Set default form date
  document.getElementById('fDate').value = Utils.today();

  // Initialize UI
  FormManager.populateCatSelect('fCategory');
  CategoryManager.render();
  TransactionManager.render();
  TransactionManager.renderCatFilters();
  BalanceManager.update();
  CalendarManager.render();
  NotificationManager.render();

  // Refresh notifications every minute
  setInterval(() => NotificationManager.render(), 60000);
})();