// Function to get transactions from LocalStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('expense_tracker_data')) || [];
}

// Function to save transactions
function saveTransactions(data) {
    localStorage.setItem('expense_tracker_data', JSON.stringify(data));
}

function updateUI() {
    const transactions = getTransactions();
    const list = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netBalanceEl = document.getElementById('net-balance');

    let income = 0;
    let expense = 0;

    if (list) list.innerHTML = '';

    transactions.slice().reverse().forEach((t, index) => {
        const actualIndex = transactions.length - 1 - index;
        const amt = parseFloat(t.amount) || 0;

        if (t.type === 'income') {
            income += amt;
        } else {
            expense += amt;
        }

        if (list) {
            const li = document.createElement('li');
            li.className = `transaction-item ${t.type}`;
            li.innerHTML = `
                <div>
                    <strong>${t.title}</strong><br>
                    <small>${t.category} • ${t.date}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="amount" style="font-weight: bold; color: ${t.type === 'income' ? '#2e7d32' : '#d32f2f'};">
                        ${t.type === 'income' ? '+' : '-'}₹${amt.toFixed(2)}
                    </span>
                    <button style="background: none; border: none; cursor: pointer; font-size: 16px;" onclick="deleteItem(${actualIndex})">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        }
    });

    if (totalIncomeEl) totalIncomeEl.innerText = `₹${income.toFixed(2)}`;
    if (totalExpenseEl) totalExpenseEl.innerText = `₹${expense.toFixed(2)}`;
    if (netBalanceEl) netBalanceEl.innerText = `₹${(income - expense).toFixed(2)}`;
}

// Add transaction function
function addTransaction(e) {
    if (e) e.preventDefault();

    const title = document.getElementById('title')?.value.trim();
    const amount = parseFloat(document.getElementById('amount')?.value);
    const category = document.getElementById('category')?.value || 'General';
    const type = document.getElementById('type')?.value || 'expense';

    if (!title || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid title and amount!');
        return;
    }

    const newTx = {
        title: title,
        amount: amount,
        category: category,
        type: type,
        date: new Date().toLocaleDateString('en-IN')
    };

    const transactions = getTransactions();
    transactions.push(newTx);
    saveTransactions(transactions);

    // Reset Form
    const form = document.getElementById('expense-form');
    if (form) form.reset();

    updateUI();
}

// Delete transaction
window.deleteItem = function(index) {
    const transactions = getTransactions();
    transactions.splice(index, 1);
    saveTransactions(transactions);
    updateUI();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', addTransaction);
    }
    updateUI();
});