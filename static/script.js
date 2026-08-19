document.addEventListener('DOMContentLoaded', () => {
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
    const chartCanvas = document.getElementById('expenseChart');

    function updateSummary() {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += parseFloat(t.amount || 0);
            } else {
                expense += parseFloat(t.amount || 0);
            }
        });

        if (totalIncomeEl) totalIncomeEl.innerText = `₹${income.toFixed(2)}`;
        if (totalExpenseEl) totalExpenseEl.innerText = `₹${expense.toFixed(2)}`;
        if (netBalanceEl) netBalanceEl.innerText = `₹${(income - expense).toFixed(2)}`;

        if (chartCanvas && typeof Chart !== 'undefined') {
            renderChart(income, expense);
        }
    }

    function renderList() {
        if (!list) return;
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
        const ctx = chartCanvas.getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [income || 1, expense || 0],
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

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTx = {
                title: titleInput.value.trim(),
                amount: parseFloat(amountInput.value),
                category: categoryInput ? categoryInput.value : 'General',
                type: typeInput ? typeInput.value : 'expense',
                date: new Date().toLocaleDateString('en-IN')
            };

            transactions.push(newTx);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            form.reset();
            renderList();
            updateSummary();
        });
    }

    window.deleteTransaction = function(index) {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderList();
        updateSummary();
    };

    renderList();
    updateSummary();
});