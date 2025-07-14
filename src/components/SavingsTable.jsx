function SavingsTable({ savingsList }) {
  const personal = savingsList.filter((entry) => entry.type === 'personal');
  const expense = savingsList.filter((entry) => entry.type === 'expense');

  const expenseByCategory = {};
  expense.forEach((entry) => {
    const cat = entry.category || 'Uncategorized';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + entry.amount;
  });

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
          {Object.entries(expenseByCategory).map(([cat, total], index) => (
            <tr key={index}>
              <td>{cat}</td>
              <td>₱{total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default SavingsTable;
