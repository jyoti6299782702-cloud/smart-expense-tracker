let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const form = document.getElementById('expense-form');
const list = document.getElementById('transaction-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');

function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            income += parseFloat(t.amount);
        } else {
            expense += parseFloat(t.amount);
        }
    });

    totalIncomeEl.innerText = `₹${income.toFixed(2)}`;
    totalExpenseEl.innerText = `₹${expense.toFixed(2)}`;
    netBalanceEl.innerText = `₹${(income - expense).toFixed(2)}`;

    renderChart(income, expense);
}

function renderList() {
    list.innerHTML = '';
    transactions.slice().reverse().forEach((t, index) => {
        const actualIndex = transactions.length - 1 - index;
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <div>
                <strong>${t.title}</strong>
                <small>${t.category} • ${t.date}</small>
            </div>
            <div>
                <span class="amount">${t.type === 'income' ? '+' : '-'}₹${parseFloat(t.amount).toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteTransaction(${actualIndex})">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderChart(income, expense) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#4caf50', '#ff4d6d'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTx = {
        title: titleInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        type: typeInput.value,
        date: new Date().toLocaleDateString('en-IN')
    };

    transactions.push(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    form.reset();
    renderList();
    updateSummary();
});

window.deleteTransaction = function(index) {
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderList();
    updateSummary();
};

// Initial load
renderList();
updateSummary();