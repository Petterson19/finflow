/**
 * Calendar and bill management module
 */
let bills = Storage.getBills();
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
let selectedDay = null;

const BillManager = (() => {
  return {
    getAll: () => bills
  };
})();

const CalendarManager = (() => {
  return {
    move: (dir) => {
      calMonth += dir;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      selectedDay = null;
      document.getElementById('dayDetail').innerHTML = '';
      CalendarManager.render();
    },

    render: () => {
      document.getElementById('billCount').textContent = `${bills.length} conta${bills.length !== 1 ? 's' : ''}`;
      document.getElementById('calLabel').textContent = `${Utils.MONTHS[calMonth]} ${calYear}`;

      const billsByDay = {};
      bills.forEach(b => {
        const [y, m, d] = b.dueDate.split('-').map(Number);
        if (y === calYear && m - 1 === calMonth) {
          if (!billsByDay[d]) billsByDay[d] = [];
          billsByDay[d].push(b);
        }
      });

      const firstDay = new Date(calYear, calMonth, 1).getDay();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const todayStr = Utils.today();
      const todayParts = todayStr.split('-').map(Number);

      let html = Utils.DOWS.map(d => `<div class="cal-dow">${d}</div>`).join('');

      const prevDays = new Date(calYear, calMonth, 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other"><span class="cal-num">${prevDays - i}</span></div>`;
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = todayParts[0] === calYear && todayParts[1] - 1 === calMonth && todayParts[2] === d;
        const dayBills = billsByDay[d] || [];
        const hasBills = dayBills.length > 0;
        const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSel = selectedDay === ds;

        const dots = dayBills.map(b => {
          const days = Utils.getDaysUntil(b.dueDate);
          const urg = days < 0 ? 'urgent' : days <= 7 ? 'warn' : 'ok';
          return `<span class="cal-dot ${urg}"></span>`;
        }).join('');

        html += `<div class="cal-day${isToday ? ' today' : ''}${hasBills ? ' has-bills' : ''}${isSel ? ' selected' : ''}" ${hasBills ? `onclick="CalendarManager.selectDay('${ds}')"` : ''}>
          <span class="cal-num">${d}</span>
          ${hasBills ? `<div class="cal-dots">${dots}</div>` : ''}
        </div>`;
      }

      const total = firstDay + daysInMonth;
      const trailing = (7 - total % 7) % 7;
      for (let d = 1; d <= trailing; d++) {
        html += `<div class="cal-day other"><span class="cal-num">${d}</span></div>`;
      }

      document.getElementById('calGrid').innerHTML = html;
    },

    selectDay: (ds) => {
      if (selectedDay === ds) {
        selectedDay = null;
        document.getElementById('dayDetail').innerHTML = '';
        CalendarManager.render();
        return;
      }
      selectedDay = ds;
      CalendarManager.render();
      const dayBills = bills.filter(b => b.dueDate === ds);
      const [y, m, d] = ds.split('-');
      const detail = document.getElementById('dayDetail');
      detail.innerHTML = `<div class="day-detail">
        <div class="day-detail-title">📅 ${d}/${m}/${y}</div>
        ${dayBills.map(b => {
          const days = Utils.getDaysUntil(b.dueDate);
          const urgColor = days < 0 ? 'var(--expense)' : days <= 7 ? 'var(--warn)' : 'var(--muted)';
          const c = CategoryManager.getById(b.cat);
          return `<div class="day-bill-row">
            <span class="day-bill-dot" style="background:${urgColor}"></span>
            <span class="day-bill-name">${c.emoji} ${b.desc}</span>
            <span class="day-bill-val">${Utils.fmt(b.amount)}</span>
            <button class="day-bill-del" onclick="CalendarManager.deleteBill(${b.id})" title="Remover">✕</button>
          </div>`;
        }).join('')}
      </div>`;
    },

    deleteBill: (id) => {
      bills = bills.filter(b => b.id !== id);
      Storage.save(TransactionManager.getAll(), bills, customCats);
      if (selectedDay) {
        const remaining = bills.filter(b => b.dueDate === selectedDay);
        if (!remaining.length) {
          selectedDay = null;
          document.getElementById('dayDetail').innerHTML = '';
        } else {
          CalendarManager.selectDay(selectedDay);
        }
      }
      CalendarManager.render();
      NotificationManager.render();
      BalanceManager.update();
      Utils.showToast('🗑️ Conta removida');
    }
  };
})();