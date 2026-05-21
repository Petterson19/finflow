/**
 * Notification management module
 */
let notifOpen = false;

const NotificationManager = (() => {
  return {
    toggle: () => {
      notifOpen = !notifOpen;
      document.getElementById('notifOverlay').classList.toggle('open', notifOpen);
    },

    render: () => {
      const notifs = bills.filter(b => Utils.getDaysUntil(b.dueDate) <= 7);
      const badge = document.getElementById('notifBadge');
      badge.style.display = notifs.length ? 'flex' : 'none';
      badge.textContent = notifs.length;
      const nl = document.getElementById('notifList');
      if (!notifs.length) {
        nl.innerHTML = '<div class="no-notif">✅ Nenhuma notificação pendente</div>';
        return;
      }
      nl.innerHTML = [...notifs].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(b => {
        const days = Utils.getDaysUntil(b.dueDate), urg = days <= 0 ? 'urgent' : 'warn';
        const msg = days < 0 ? `Venceu há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}. Regularize o quanto antes!` :
          days === 0 ? `Vence hoje! Valor: ${Utils.fmt(b.amount)}.` :
            `Vence em ${days} dia${days !== 1 ? 's' : ''} (${Utils.fmtDate(b.dueDate)}). Reserve ${Utils.fmt(b.amount)}.`;
        const c = CategoryManager.getById(b.cat);
        return `<div class="notif-item ${urg}"><div class="ni-title">${c.emoji} ${b.desc}</div><div class="ni-body">${msg}</div></div>`;
      }).join('');
    }
  };
})();

document.addEventListener('click', e => {
  const overlay = document.getElementById('notifOverlay');
  const panel = document.getElementById('notifPanel');
  const btns = document.querySelectorAll('.icon-btn');
  let clickedBtn = false;
  btns.forEach(b => { if (b.contains(e.target)) clickedBtn = true; });
  if (notifOpen && !panel.contains(e.target) && !clickedBtn) {
    notifOpen = false;
    overlay.classList.remove('open');
  }
});