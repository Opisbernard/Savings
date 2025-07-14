import { useState } from 'react';

function SavingsForm({ savingsList, setSavingsList }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('personal');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [pendingCategory, setPendingCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const trimmedCategory = category.trim().toLowerCase();

    if (isNaN(parsedAmount) || parsedAmount <= 0 || (type === 'expense' && !trimmedCategory)) return;

    const now = new Date().toLocaleString();

    if (type === 'expense') {
      const existingIndex = savingsList.findIndex(
        (entry) =>
          entry.type === 'expense' &&
          entry.category &&
          entry.category.trim().toLowerCase() === trimmedCategory
      );

      if (existingIndex !== -1) {
        // 🚨 Show modal before adding to existing category
        setPendingAmount(parsedAmount);
        setPendingCategory(trimmedCategory);
        setShowModal(true);
        return;
      }

      // ➕ Create new category
      const newEntry = {
        date: now,
        timestamp: Date.now(),
        amount: parsedAmount,
        type: 'expense',
        category: category.trim(),
        deductionLog: [],
        savingsLog: [
          {
            date: now,
            amount: parsedAmount,
            note: 'Initial savings added',
          },
        ],
      };
      setSavingsList([...savingsList, newEntry]);
    } else {
      // Personal savings — always add new
      const newEntry = {
        date: now,
        timestamp: Date.now(),
        amount: parsedAmount,
        type: 'personal',
        category: null,
        deductionLog: [],
        savingsLog: [
          {
            date: now,
            amount: parsedAmount,
            note: 'Personal savings added',
          },
        ],
      };
      setSavingsList([...savingsList, newEntry]);
    }

    setAmount('');
    setType('personal');
    setCategory('');
  };

  const confirmAddToExisting = () => {
    const now = new Date().toLocaleString();
    const updatedList = [...savingsList];
    const index = updatedList.findIndex(
      (entry) =>
        entry.type === 'expense' &&
        entry.category &&
        entry.category.trim().toLowerCase() === pendingCategory
    );

    if (index !== -1) {
      updatedList[index].amount += pendingAmount;
      updatedList[index].date = now;
      updatedList[index].savingsLog = [
        ...(updatedList[index].savingsLog || []),
        {
          date: now,
          amount: pendingAmount,
          note: 'User added savings to existing category',
        },
      ];
      setSavingsList(updatedList);
    }

    setShowModal(false);
    setAmount('');
    setType('personal');
    setCategory('');
    setPendingAmount(null);
    setPendingCategory('');
  };

  const cancelAddToExisting = () => {
    setShowModal(false);
    setPendingAmount(null);
    setPendingCategory('');
  };

  return (
    <>
      <form id="savings-form" onSubmit={handleSubmit}>
        <h2>💰 Add Savings</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="personal">Personal</option>
          <option value="expense">Expense</option>
        </select>
        {type === 'expense' && (
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Expense Category (e.g. Rent, Food)"
            required
          />
        )}
        <button type="submit">Add Savings</button>
      </form>

      {showModal && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal-content">
            <h3>⚠️ Category Exists</h3>
            <p>
              The category <strong>{pendingCategory}</strong> already exists.
              The ₱{pendingAmount?.toFixed(2)} you entered will be added to its balance.
              This will be logged in the savings overview.
            </p>
            <div className="modal-actions">
              <button onClick={confirmAddToExisting}>Yes, Add</button>
              <button onClick={cancelAddToExisting}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SavingsForm;
