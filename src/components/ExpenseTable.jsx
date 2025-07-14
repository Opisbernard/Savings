function ExpenseTable({ expenseList }) {
  const total = expenseList.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <section className="expense-history" aria-label="Expense History">
      <h2>📜 Expense History</h2>
      <p>Total Expenses: ₱{total.toFixed(2)}</p>
      <table id="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {expenseList.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>₱{entry.amount.toFixed(2)}</td>
              <td>{entry.category}</td>
              <td>{entry.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ExpenseTable;