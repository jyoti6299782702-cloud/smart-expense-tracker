

from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = 'database.db'

# 1. Database initialize karne ka function
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
init_db()
# 2. Main Page Render
@app.route('/')
def home():
    return render_template('index.html')

# 3. Saari transactions lana (Fetch API ke liye)
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row  # Dict format me data lene ke liye
        cursor = conn.cursor()
        rows = cursor.execute('SELECT * FROM transactions ORDER BY id DESC').fetchall()
        return jsonify([dict(row) for row in rows])

# 4. Naya expense/income add karna
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO transactions (title, amount, category, type) VALUES (?, ?, ?, ?)',
            (data['title'], float(data['amount']), data['category'], data['type'])
        )
        conn.commit()
        return jsonify({'message': 'Transaction added successfully!'}), 201

# 5. Transaction delete karna
@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM transactions WHERE id = ?', (id,))
        conn.commit()
        return jsonify({'message': 'Transaction deleted!'})

if __name__ == '__main__':
    init_db()  # App start hote hi table ready ho jayegi
    app.run(debug=True)
#terminal me 
#python app.py 
#lekhege and jo no. aayaga usko run kr denge....
