/**
 * Form management module
 */
let currentTab = 'income';

const FormManager = (() => {
  return {
    getCurrentTab: () => currentTab,

    setTab: (tab, btn) => {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.className = 'tab-btn');
      btn.className = 'tab-btn ' + (tab === 'income' ? 'ti' : tab === 'expense' ? 'te' : 'tb');
      const sb = document.getElementById('submitBtn');
      const dl = document.getElementById('dateLabel');
      const br = document.getElementById('billRepeatRow');
      if (tab === 'income') {
        sb.className = 'submit-btn btn-i';
        sb.textContent = 'Adicionar Receita';
        dl.textContent = 'Data';
        br.style.display = 'none';
      } else if (tab === 'expense') {
        sb.className = 'submit-btn btn-e';
        sb.textContent = 'Adicionar Despesa';
        dl.textContent = 'Data';
        br.style.display = 'none';
      } else {
        sb.className = 'submit-btn btn-b';
        sb.textContent = 'Cadastrar Conta';
        dl.textContent = 'Vencimento';
        br.style.display = 'block';
      }
      FormManager.populateCatSelect('fCategory');
      document.getElementById('outroCatRow').style.display = 'none';
      const hint = document.getElementById('catTypeHint');
      if (hint) hint.textContent = '(' + (tab === 'income' ? 'receita' : 'despesa') + ')';
    },

    populateCatSelect: (id, forType) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const type = forType || (currentTab === 'bill' ? 'expense' : currentTab);
      const prev = sel.value;
      sel.innerHTML = CategoryManager.getAll()
        .filter(c => c.type === type)
        .map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`)
        .join('');
      if (CategoryManager.getAll().find(c => c.id === prev)) sel.value = prev;
    },

    onCatChange: (sel) => {
      const isOutro = sel && (sel.value === 'outro_r' || sel.value === 'outro_d');
      document.getElementById('outroCatRow').style.display = isOutro ? 'block' : 'none';
      if (isOutro) document.getElementById('outroCatName').focus();
    },

    saveOutroCategory: () => {
      const emoji = document.getElementById('outroCatEmoji').value.trim() || '🏷️';
      const name = document.getElementById('outroCatName').value.trim();
      if (!name) {
        Utils.showToast('⚠️ Digite o nome da categoria');
        return;
      }
      const type = currentTab === 'income' ? 'income' : 'expense';
      const id = 'c_' + Date.now();
      customCats.push({ id, emoji, label: name, type });
      Storage.save(TransactionManager.getAll(), BillManager.getAll(), customCats);
      document.getElementById('outroCatEmoji').value = '';
      document.getElementById('outroCatName').value = '';
      document.getElementById('outroCatRow').style.display = 'none';
      FormManager.populateCatSelect('fCategory');
      document.getElementById('fCategory').value = id;
      CategoryManager.render();
      Utils.showToast(`✅ Categoria "${name}" criada!`);
    },

    addEntry: () => {
      const desc = document.getElementById('fDesc').value.trim();
      const amount = parseFloat(document.getElementById('fAmount').value);
      const date = document.getElementById('fDate').value;
      const cat = document.getElementById('fCategory').value;
      if (!desc) {
        Utils.showToast('⚠️ Preencha a descrição');
        return;
      }
      if (!amount || amount <= 0) {
        Utils.showToast('⚠️ Valor inválido');
        return;
      }
      if (!date) {
        Utils.showToast('⚠️ Selecione uma data');
        return;
      }
      if (currentTab === 'bill') {
        bills.push({ id: Date.now(), desc, amount, dueDate: date, cat, repeat: document.getElementById('fRepeat').value });
        Storage.save(TransactionManager.getAll(), bills, customCats);
        CalendarManager.render();
        NotificationManager.render();
        BalanceManager.update();
        Utils.showToast('✅ Conta cadastrada!');
      } else {
        transactions.unshift({ id: Date.now(), desc, amount, type: currentTab, date, cat });
        Storage.save(transactions, BillManager.getAll(), customCats);
        TransactionManager.render();
        BalanceManager.update();
        TransactionManager.renderCatFilters();
        Utils.showToast(currentTab === 'income' ? '✅ Receita adicionada!' : '✅ Despesa adicionada!');
      }
      document.getElementById('fDesc').value = '';
      document.getElementById('fAmount').value = '';
      document.getElementById('fDate').value = '';
    }
  };
})();