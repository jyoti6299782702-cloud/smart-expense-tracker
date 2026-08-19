let chartInstance = null;

// Page load hote hi data fetch karo
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  document.getElementById('expense-form').addEventListener('submit', handleAddTransaction);
});

// 1. Backend se data mangwana
async function loadData() {
  const response = await fetch('/api/expenses');
  const transactions = await response.json();
  
  updateSummary(transactions);
  renderHistory(transactions);
  renderChart(transactions);
}

// 2. Form submit hone par backend ko bhejna
async function handleAddTransaction(e) {
  e.preventDefault();

  const payload = {
    title: document.getElementById('title').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    category: document.getElementById('category').value
  };

  await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  document.getElementById('expense-form').reset();
  loadData();
}

// 3. Transaction delete function
async function deleteEntry(id) {
  await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  loadData();
}

// 4. Cards me balance update karna
function updateSummary(transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });

  const balance = income - expense;

  document.getElementById('total-balance').textContent = `₹${balance.toFixed(2)}`;
  document.getElementById('total-income').textContent = `₹${income.toFixed(2)}`;
  document.getElementById('total-expense').textContent = `₹${expense.toFixed(2)}`;
}

// 5. Recent list populate karna
function renderHistory(transactions) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.innerHTML = '<li style="text-align:center; color:#9ca3af; padding: 1rem;">No transactions yet 🌸</li>';
    return;
  }

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="item-info">
        <strong>${t.title}</strong>
        <span>${t.category} • ${t.date.split(' ')[0]}</span>
      </div>
      <div>
        <span class="item-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}
        </span>
        <button class="delete-btn" onclick="deleteEntry(${t.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// 6. Theme ke hisab se Chart Render karna (POINT 2)
function renderChart(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const ctx = document.getElementById('expenseChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const themePalettes = {
    pink: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#db2777'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9'],
    dark: ['#fb7185', '#f43f5e', '#e11d48', '#f472b6', '#fda4af']
  };

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'pink';
  const selectedPalette = themePalettes[currentTheme] || themePalettes.pink;

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        data: data.length > 0 ? data : [1],
        backgroundColor: data.length > 0 ? selectedPalette : ['#fce7f3'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 15 }
        }
      }
    }
  });
}

// ===================================
// THEME SWITCHER EVENT LISTENER
// ===================================
const themeSelector = document.getElementById('theme-selector');
const savedTheme = localStorage.getItem('app-theme') || 'pink';
document.documentElement.setAttribute('data-theme', savedTheme);

if (themeSelector) {
  themeSelector.value = savedTheme;
  themeSelector.addEventListener('change', (e) => {
    const chosenTheme = e.target.value;
    document.documentElement.setAttribute('data-theme', chosenTheme);
    localStorage.setItem('app-theme', chosenTheme);
    loadData();
  });
}