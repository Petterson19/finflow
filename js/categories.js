/**
 * Category management module
 */
const DEFAULT_CATS = [
  { id: 'salario', emoji: '💼', label: 'Salário', type: 'income' },
  { id: 'freelance', emoji: '💻', label: 'Freelance', type: 'income' },
  { id: 'investimento', emoji: '📈', label: 'Investimento', type: 'income' },
  { id: 'outro_r', emoji: '✨', label: 'Outro (entrada)', type: 'income' },
  { id: 'moradia', emoji: '🏠', label: 'Moradia', type: 'expense' },
  { id: 'alimentacao', emoji: '🍽️', label: 'Alimentação', type: 'expense' },
  { id: 'transporte', emoji: '🚗', label: 'Transporte', type: 'expense' },
  { id: 'saude', emoji: '💊', label: 'Saúde', type: 'expense' },
  { id: 'lazer', emoji: '🎮', label: 'Lazer', type: 'expense' },
  { id: 'educacao', emoji: '📚', label: 'Educação', type: 'expense' },
  { id: 'outro_d', emoji: '📦', label: 'Outro (saída)', type: 'expense' }
];

let customCats = Storage.getCategories();

const CategoryManager = (() => {
  const allCats = () => [...DEFAULT_CATS, ...customCats];

  return {
    getAll: allCats,

    getById: (id) => {
      return allCats().find(c => c.id === id) || { emoji: '📦', label: id, type: 'expense' };
    },

    toggle: () => {
      const manager = document.getElementById('catManager');
      if (manager) manager.classList.toggle('open');
      CategoryManager.render();
    },

    render: () => {
      const el = document.getElementById('catListManage');
      if (!el) return;
      el.innerHTML = DEFAULT_CATS.map(c => `<div class="cat-pill" title="Padrão">${c.emoji} ${c.label}</div>`).join('') +
        customCats.map(c => `<div class="cat-pill">${c.emoji} ${c.label} <button class="cat-pill-del" onclick="CategoryManager.delete('${c.id}')">✕</button></div>`).join('');
    },

    add: () => {
      const emoji = document.getElementById('newCatEmoji').value.trim() || '🏷️';
      const name = document.getElementById('newCatName').value.trim();
      if (!name) {
        Utils.showToast('⚠️ Digite o nome da categoria');
        return;
      }
      const type = FormManager.getCurrentTab() === 'income' ? 'income' : 'expense';
      customCats.push({ id: 'c_' + Date.now(), emoji, label: name, type });
      Storage.save(TransactionManager.getAll(), BillManager.getAll(), customCats);
      document.getElementById('newCatEmoji').value = '';
      document.getElementById('newCatName').value = '';
      CategoryManager.render();
      FormManager.populateCatSelect('fCategory');
      Utils.showToast(`✅ Categoria "${name}" criada!`);
    },

    delete: (id) => {
      customCats = customCats.filter(c => c.id !== id);
      Storage.save(TransactionManager.getAll(), BillManager.getAll(), customCats);
      CategoryManager.render();
      FormManager.populateCatSelect('fCategory');
      Utils.showToast('🗑️ Categoria removida');
    }
  };
})();