/**
 * Utility functions for formatting and common operations
 */
const Utils = (() => {
  const TOAST_TIMEOUT = 2500;
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const DOWS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const PIE_COLORS = ['#7c6af7', '#3ecf8e', '#f59e0b', '#f87171', '#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#60a5fa', '#4ade80', '#facc15'];

  return {
    MONTHS,
    MONTHS_SHORT,
    DOWS,
    PIE_COLORS,

    fmt: (n) => {
      return 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    fmtDate: (d) => {
      if (!d) return '';
      const [y, m, day] = d.split('-');
      return `${day}/${m}/${y}`;
    },

    today: () => new Date().toISOString().split('T')[0],

    getDaysUntil: (dateStr) => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return Math.round((new Date(dateStr + 'T00:00:00') - t) / 86400000);
    },

    showToast: (msg) => {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), TOAST_TIMEOUT);
    }
  };
})();