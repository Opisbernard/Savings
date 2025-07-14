import { useState } from 'react';

function ExpenseForm({
  expenseList,
  setExpenseList,
  setExpenses,
  expenseSavings,
  savingsList,
  setSavingsList
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!category || isNaN(parsedAmount) || parsedAmount <= 0) return;

    // 🚫 Block if expenseSavings is insufficient
    if (parsedAmount > expenseSavings) {
      setShowModal(true);
      return;
    }

    // 💸 Deduct from expense savings entries
    let remaining = parsedAmount;
    const updatedSavings = savingsList.map((entry) => {
      if (entry.type === 'expense' && remaining > 0 && entry.amount > 0) {
        const deduction = Math.min(entry.amount, remaining);
        remaining -= deduction;
        return { ...entry, amount: entry.amount - deduction };
      }
      return entry;
    });

    // ✅ Save expense
    const newEntry = {
      date: new Date().toLocaleString(),
      amount: parsedAmount,
      category,
      note,
    };

    const updatedExpenses = [...expenseList, newEntry];
    setExpenseList(updatedExpenses);
    setExpenses(updatedExpenses.reduce((sum, entry) => sum + entry.amount, 0));
    setSavingsList(updatedSavings);

    // 🔄 Reset form
    setAmount('');
    setCategory('');
    setNote('');
  };

  return (
    <>
      <form id="expense-form" onSubmit={handleSubmit}>
        <h2>🧾 Add Expense</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
        />
        <button type="submit">Add Expense</button>
      </form>

      {showModal && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal-content">
            <h3>🚫 Expense Blocked</h3>
            <p>You don't have enough balance in your expense savings to cover this expense.</p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExpenseForm;
