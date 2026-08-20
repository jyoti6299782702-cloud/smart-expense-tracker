function getTransactions() {
    return JSON.parse(localStorage.getItem('expense_tracker_data')) || [];
}

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
                    <small>${t.category || 'General'} • ${t.date}</small>
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

window.addTransaction = function(e) {
    if (e) e.preventDefault();

    const titleEl = document.getElementById('title');
    const amountEl = document.getElementById('amount');
    const categoryEl = document.getElementById('category');
    const typeEl = document.getElementById('type');

    const title = titleEl ? titleEl.value.trim() : '';
    const amount = amountEl ? parseFloat(amountEl.value) : 0;
    const category = categoryEl ? categoryEl.value : 'General';
    const type = typeEl ? typeEl.value : 'expense';

    if (!title || isNaN(amount) || amount <= 0) {
        alert('Kripya Title aur Valid Amount bharein!');
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

    if (titleEl) titleEl.value = '';
    if (amountEl) amountEl.value = '';

    updateUI();
};

window.deleteItem = function(index) {
    const transactions = getTransactions();
    transactions.splice(index, 1);
    saveTransactions(transactions);
    updateUI();
};

window.onload = function() {
    updateUI();
};