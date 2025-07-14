import { useState } from 'react';

function SavingsTable({ savingsList }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const personal = savingsList.filter((entry) => entry.type === 'personal');
  const expense = savingsList.filter((entry) => entry.type === 'expense');

  const expenseCategories = Array.from(
    new Set(expense.map((entry) => entry.category || 'Uncategorized'))
  );

  const filteredLogs = expense.flatMap((entry) => {
    return (entry.deductionLog || []).filter((log) => {
      const logDate = new Date(log.date);
      const matchCategory = !filterCategory || log.category === filterCategory;
      const matchStart = !startDate || logDate >= new Date(startDate);
      const matchEnd = !endDate || logDate <= new Date(endDate);
      return matchCategory && matchStart && matchEnd;
    });
  });

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Amount'];
    const rows = filteredLogs.map((log) => [log.date, log.category, log.amount]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'deduction_logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="savings-overview">
      <h2>💼 Savings Overview</h2>

      <h3>Personal Savings</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>₱{entry.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Expense Savings by Category</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenseCategories.map((cat, index) => {
            const total = expense
              .filter((entry) => entry.category === cat)
              .reduce((sum, entry) => sum + entry.amount, 0);
            return (
              <tr key={index}>
                <td>{cat}</td>
                <td>₱{total.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>📜 Deduction Logs</h3>
      <div className="filters">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {expenseCategories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.date}</td>
              <td>{log.category}</td>
              <td>₱{log.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default SavingsTable;
