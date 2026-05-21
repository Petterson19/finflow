/**
 * Transaction management module
 */
let transactions = Storage.getTransactions();
let txView = 'list';
let typeFilter = 'all';
let catFilter = 'all';
let chartType = 'expense';

const TransactionManager = (() => {
  return {
    getAll: () => transactions,

    setView: (view, btn) => {
      txView = view;
      document.querySelectorAll('.vtbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('txListView').style.display = view === 'list' ? 'block' : 'none';
      document.getElementById('txPieView').style.display = view === 'pie' ? 'block' : 'none';
      if (view === 'pie') TransactionManager.renderPie();
    },

    setTypeFilter: (f, btn) => {
      typeFilter = f;
      catFilter = 'all';
      document.querySelectorAll('#typeFilters .fchip').forEach(c => c.className = 'fchip');
      btn.className = 'fchip ' + (f === 'all' ? 'fa' : f === 'income' ? 'fi' : 'fe');
      TransactionManager.renderCatFilters();
      TransactionManager.render();
    },

    setCatFilter: (f, btn) => {
      catFilter = f;
      document.querySelectorAll('#catFilters .fchip').forEach(c => c.className = 'fchip');
      btn.className = f === 'all' ? 'fchip fa' : 'fchip fc';
      TransactionManager.render();
    },

    renderCatFilters: () => {
      const el = document.getElementById('catFilters');
      let pool = typeFilter === 'all' ? transactions : transactions.filter(t => t.type === typeFilter);
      const used = [...new Set(pool.map(t => t.cat))];
      if (used.length < 2) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = `<button class="fchip ${catFilter === 'all' ? 'fa' : ''}" onclick="TransactionManager.setCatFilter('all',this)">Todas</button>` +
        used.map(id => {
          const c = CategoryManager.getById(id);
          return `<button class="fchip ${catFilter === id ? 'fc' : ''}" onclick="TransactionManager.setCatFilter('${id}',this)">${c.emoji} ${c.label}</button>`;
        }).join('');
    },

    render: () => {
      const list = document.getElementById('txList');
      let data = [...transactions];
      if (typeFilter !== 'all') data = data.filter(t => t.type === typeFilter);
      if (catFilter !== 'all') data = data.filter(t => t.cat === catFilter);
      document.getElementById('txCount').textContent = data.length + ' lançamento' + (data.length !== 1 ? 's' : '');
      if (!data.length) {
        list.innerHTML = '<div class="empty"><div>💸</div>Nenhum lançamento</div>';
        if (txView === 'pie') TransactionManager.renderPie();
        return;
      }
      list.innerHTML = data.map(t => {
        const c = CategoryManager.getById(t.cat);
        return `<div class="tx-item">
          <div class="tx-icon ${t.type}">${c.emoji}</div>
          <div class="tx-info">
            <div class="tx-name">${t.desc}</div>
            <div class="tx-meta">${Utils.fmtDate(t.date)} · ${c.label}</div>
          </div>
          <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'} ${Utils.fmt(t.amount)}</div>
          <div class="tx-actions">
            <button class="act-btn edit" onclick="TransactionManager.openEdit(${t.id})" title="Editar">✏️</button>
            <button class="act-btn del" onclick="TransactionManager.delete(${t.id})" title="Remover">✕</button>
          </div>
        </div>`;
      }).join('');
      if (txView === 'pie') TransactionManager.renderPie();
    },

    delete: (id) => {
      transactions = transactions.filter(t => t.id !== id);
      Storage.save(transactions, BillManager.getAll(), customCats);
      TransactionManager.render();
      BalanceManager.update();
      TransactionManager.renderCatFilters();
      Utils.showToast('🗑️ Lançamento removido');
    },

    openEdit: (id) => {
      const t = transactions.find(t => t.id === id);
      if (!t) return;
      document.getElementById('editId').value = id;
      document.getElementById('editDesc').value = t.desc;
      document.getElementById('editAmount').value = t.amount;
      document.getElementById('editDate').value = t.date;
      FormManager.populateCatSelect('editCat', t.type);
      document.getElementById('editCat').value = t.cat;
      document.getElementById('editOverlay').classList.add('open');
    },

    closeEdit: () => {
      document.getElementById('editOverlay').classList.remove('open');
    },

    saveEdit: () => {
      const id = parseInt(document.getElementById('editId').value);
      const desc = document.getElementById('editDesc').value.trim();
      const amount = parseFloat(document.getElementById('editAmount').value);
      const date = document.getElementById('editDate').value;
      const cat = document.getElementById('editCat').value;
      if (!desc || !amount || amount <= 0 || !date) {
        Utils.showToast('⚠️ Preencha todos os campos');
        return;
      }
      const idx = transactions.findIndex(t => t.id === id);
      if (idx > -1) transactions[idx] = { ...transactions[idx], desc, amount, date, cat };
      Storage.save(transactions, BillManager.getAll(), customCats);
      TransactionManager.closeEdit();
      TransactionManager.render();
      BalanceManager.update();
      TransactionManager.renderCatFilters();
      Utils.showToast('✅ Lançamento atualizado!');
    },

    setChartType: (type, btn) => {
      chartType = type;
      document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      TransactionManager.renderPie();
    },

    renderPie: () => {
      const svg = document.getElementById('pieSvg');
      const leg = document.getElementById('pieLegend');
      if (!svg) return;
      const data = transactions.filter(t => t.type === chartType);
      if (!data.length) {
        svg.innerHTML = '<circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="28"/>';
        leg.innerHTML = '<div style="color:var(--hint);font-size:13px">Sem dados para exibir</div>';
        return;
      }
      const totals = {};
      data.forEach(t => { totals[t.cat] = (totals[t.cat] || 0) + t.amount; });
      const total = Object.values(totals).reduce((a, b) => a + b, 0);
      const items = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      const cx = 80, cy = 80, r = 66, ri = 34;
      let ang = -Math.PI / 2, paths = '';
      items.forEach(([catId, val], i) => {
        const a = (val / total) * 2 * Math.PI, end = ang + a;
        const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        const xi1 = cx + ri * Math.cos(ang), yi1 = cy + ri * Math.sin(ang);
        const xi2 = cx + ri * Math.cos(end), yi2 = cy + ri * Math.sin(end);
        const lf = a > Math.PI ? 1 : 0, col = Utils.PIE_COLORS[i % Utils.PIE_COLORS.length];
        paths += `<path d="M${xi1} ${yi1} L${x1} ${y1} A${r} ${r} 0 ${lf} 1 ${x2} ${y2} L${xi2} ${yi2} A${ri} ${ri} 0 ${lf} 0 ${xi1} ${yi1} Z" fill="${col}" opacity=".88"/>`;
        ang = end;
      });
      svg.innerHTML = paths;
      leg.innerHTML = items.map(([catId, val], i) => {
        const c = CategoryManager.getById(catId), pct = Math.round(val / total * 100);
        return `<div class="pie-leg-item"><div class="pie-dot" style="background:${Utils.PIE_COLORS[i % Utils.PIE_COLORS.length]}"></div><span class="pie-leg-label">${c.emoji} ${c.label}</span><span class="pie-leg-val">${Utils.fmt(val)}</span><span class="pie-leg-pct">${pct}%</span></div>`;
      }).join('');
    }
  };
})();