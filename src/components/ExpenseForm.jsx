import { useState } from 'react';

function ExpenseForm({
  expenseList,
  setExpenseList,
  setExpenses,
  expenseSavings,
  savingsList,
  setSavingsList,
  income,
  setIncomeBalance
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  const expenseCategories = Array.from(
    new Set(
      savingsList
        .filter((entry) => entry.type === 'expense' && entry.amount > 0 && entry.category)
        .map((entry) => entry.category)
    )
  );

  const categoryBalance = savingsList
    .filter((entry) => entry.type === 'expense' && entry.category === category)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!category || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (parsedAmount > categoryBalance) {
      setShowModal(true);
      return;
    }

    let remaining = parsedAmount;
    const now = new Date().toLocaleString();
    const updatedSavings = savingsList.map((entry) => {
      if (
        entry.type === 'expense' &&
        entry.category === category &&
        remaining > 0 &&
        entry.amount > 0
      ) {
        const deduction = Math.min(entry.amount, remaining);
        remaining -= deduction;

        const updatedLog = [
          ...(entry.deductionLog || []),
          {
            amount: deduction,
            date: now,
            category,
          },
        ];

        return {
          ...entry,
          amount: entry.amount - deduction,
          deductionLog: updatedLog,
        };
      }
      return entry;
    });

    const newEntry = {
      date: now,
      amount: parsedAmount,
      category,
      note,
    };

    const updatedExpenses = [...expenseList, newEntry];
    setExpenseList(updatedExpenses);
    setExpenses(updatedExpenses.reduce((sum, entry) => sum + entry.amount, 0));
    setSavingsList(updatedSavings);

    // 🔄 Update income balance
    const totalSavings = updatedSavings.reduce((sum, entry) => sum + entry.amount, 0);
    const updatedIncomeBalance = income - parsedAmount - totalSavings;
    if (!isNaN(updatedIncomeBalance)) {
      setIncomeBalance(updatedIncomeBalance);
    }

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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {expenseCategories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
            <p>
              You don't have enough balance in your <strong>{category}</strong> savings to cover this expense.
            </p>
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
