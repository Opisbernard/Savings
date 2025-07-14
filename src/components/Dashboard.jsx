import { useState } from 'react';

function SavingsTable({ savingsList }) {
  const personal = savingsList.filter((entry) => entry.type === 'personal');
  const expense = savingsList.filter((entry) => entry.type === 'expense');

  const expenseCategories = Array.from(
    new Set(expense.map((entry) => entry.category || 'Uncategorized'))
  );

  const totalPersonal = personal.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = expense.reduce((sum, entry) => sum + entry.amount, 0);

  const [showDeductions, setShowDeductions] = useState(false);

  return (
    <section className="savings-overview">
      <h2>💼 Savings Overview</h2>

      <div className="summary-totals">
        <p><strong>Total Personal Savings:</strong> ₱{totalPersonal.toFixed(2)}</p>
        <p><strong>Total Expense Savings:</strong> ₱{totalExpense.toFixed(2)}</p>
        <button onClick={() => setShowDeductions(!showDeductions)}>
          {showDeductions ? 'Hide' : 'Show'} Deduction History
        </button>
      </div>

      <h3>Personal Savings</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>₱{entry.amount.toFixed(2)}</td>
              <td>
                {(entry.savingsLog || []).map((log, i) => (
                  <div key={i}>
                    <small>{log.date}</small> — ₱{log.amount.toFixed(2)} ({log.note})
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Expense Savings by Category</h3>
      {expenseCategories.map((cat, index) => {
        const entries = expense.filter((entry) => entry.category === cat);
        const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
        const savingsLogs = entries.flatMap((entry) => entry.savingsLog || []);
        const deductionLogs = entries.flatMap((entry) => entry.deductionLog || []);
        const remaining = entries.reduce((sum, entry) => sum + entry.amount, 0);

        return (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>
              {cat} — Remaining: ₱{remaining.toFixed(2)}
            </h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {savingsLogs.map((log, i) => (
                  <tr key={i}>
                    <td>{log.date}</td>
                    <td>₱{log.amount.toFixed(2)}</td>
                    <td>{log.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showDeductions && deductionLogs.length > 0 && (
              <>
                <h5 style={{ marginTop: '1rem', color: '#ff4c4c' }}>Deductions</h5>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionLogs.map((log, i) => (
                      <tr key={i}>
                        <td>{log.date}</td>
                        <td>-₱{log.amount.toFixed(2)}</td>
                        <td>{log.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default SavingsTable;
