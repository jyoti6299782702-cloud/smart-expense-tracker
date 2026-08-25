let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart;
const MONTHLY_BUDGET = 50000;

const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const formEl = document.getElementById('tracker-form');
const categoryGroup = document.getElementById('category-group');
const typeEl = document.getElementById('type');
const timeFilterEl = document.getElementById('time-filter');

const budgetProgress = document.getElementById('budget-progress');
const budgetBadge = document.getElementById('budget-percentage');
const spentAmountEl = document.getElementById('spent-amount');
const txCountEl = document.getElementById('tx-count');

function toggleCategory() {
  categoryGroup.style.display = typeEl.value === 'income' ? 'none' : 'flex';
}

const categoryIcons = {
  'Food & Dining': '🍔',
  'Shopping': '🛍️',
  'Transportation': '🚗',
  'Bills & Utilities': '⚡',
  'Entertainment': '🎬',
  'Others': '📦',
  'Income': '💰'
};

// --- DATE FILTERING LOGIC ---
function getFilteredTransactions() {
  const filter = timeFilterEl ? timeFilterEl.value : 'all';
  const now = new Date();

  return transactions.filter(t => {
    const itemDate = new Date(t.timestamp); // Use saved timestamp

    if (filter === 'week') {
      // Calculate start of current week (Sunday/Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return itemDate >= startOfWeek;
    } 
    else if (filter === 'month') {
      // Compare Month and Year
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } 
    else if (filter === 'year') {
      // Compare Year
      return itemDate.getFullYear() === now.getFullYear();
    }

    return true; // 'all' selected
  });
}

function updateUI() {
  // Filter transactions based on selection (Week, Month, Year, All)
  const filteredData = getFilteredTransactions();

  // 1. Calculate Sums for Selected Time Period
  const income = filteredData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const total = income - expense;

  balanceEl.innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  incomeEl.innerText = `+₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  expenseEl.innerText = `-₹${expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  txCountEl.innerText = `${filteredData.length} items`;

  // 2. Update Budget Bar
  const budgetPercentage = Math.min((expense / MONTHLY_BUDGET) * 100, 100).toFixed(0);
  budgetProgress.style.width = `${budgetPercentage}%`;
  budgetBadge.innerText = `${budgetPercentage}% Used`;
  spentAmountEl.innerText = `₹${expense.toLocaleString('en-IN')}`;

  // 3. Render Activity List
  listEl.innerHTML = filteredData.length === 0 
    ? '<div style="text-align:center; color:var(--text-muted); padding:2rem; font-weight:600;">No transactions for this timeframe!</div>' 
    : '';

  filteredData.forEach(t => {
    const item = document.createElement('li');
    const icon = t.type === 'income' ? categoryIcons['Income'] : categoryIcons[t.category];
    
    item.innerHTML = `
      <div class="item-left">
        <div class="item-icon">${icon}</div>
        <div>
          <div class="item-title">${t.desc}</div>
          <div class="item-date">${t.dateStr} ${t.type === 'expense' ? '• ' + t.category : ''}</div>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount" style="color: ${t.type === 'income' ? 'var(--income)' : 'var(--text-dark)'}">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}
        </span>
        <button class="del-btn" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;
    listEl.appendChild(item);
  });

  updateChart(filteredData);
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateChart(filteredData) {
  const expenses = filteredData.filter(t => t.type === 'expense');
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const ctx = document.getElementById('expenseChart').getContext('2d');

  if (data.length === 0) {
    labels.push("No Expenses");
    data.push(1);
  }

  if (expenseChart) {
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.data.datasets[0].backgroundColor = data[0] === 1 && labels[0] === "No Expenses" 
      ? ['#ebd9d3'] 
      : ['#ff7e5f', '#feb47b', '#48bb78', '#acc2ef', '#9f7aea', '#ed64a6'];
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#ff7e5f', '#feb47b', '#48bb78', '#acc2ef', '#9f7aea', '#ed64a6'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, font: { family: 'Plus Jakarta Sans', weight: '600' } } }
        }
      }
    });
  }
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = typeEl.value;
  const now = new Date();
  
  const newTransaction = {
    id: Date.now(),
    desc: document.getElementById('desc').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: type,
    category: type === 'expense' ? document.getElementById('category').value : 'Income',
    timestamp: now.toISOString(), // Standard date format for filter calculation
    dateStr: now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  };

  transactions.unshift(newTransaction);
  updateUI();
  formEl.reset();
  toggleCategory();
});

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateUI();
}

toggleCategory();
updateUI();