import { useState, useEffect } from 'react';

function SavingsForm({ savingsList, setSavingsList, income, incomeBalance, setIncomeBalance }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('personal');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [pendingCategory, setPendingCategory] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const trimmedCategory = category.trim().toLowerCase();
    const available = parseFloat(incomeBalance);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWarningMessage('Please enter a valid amount greater than ₱0.');
      setShowWarning(true);
      return;
    }

    if (type === 'expense' && !trimmedCategory) {
      setWarningMessage('Please enter a category for expense savings.');
      setShowWarning(true);
      return;
    }

    if (!isFinite(available) || available <= 0) {
      setWarningMessage('You have no available funds to save.');
      setShowWarning(true);
      return;
    }

    if (parsedAmount > available) {
      setWarningMessage(`You only have ₱${available.toFixed(2)} available. Please enter a smaller amount.`);
      setShowWarning(true);
      return;
    }

    // ✅ Trigger confirmation modal
    setConfirmData({
      amount: parsedAmount,
      type,
      category: trimmedCategory || null,
    });
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    const now = new Date().toLocaleString();
    const { amount, type, category } = confirmData;

    let newEntry;
    if (type === 'expense') {
      const existingIndex = savingsList.findIndex(
        (entry) =>
          entry.type === 'expense' &&
          entry.category &&
          entry.category.trim().toLowerCase() === category
      );

      if (existingIndex !== -1) {
        setPendingAmount(amount);
        setPendingCategory(category);
        setShowModal(true);
        setShowConfirmModal(false);
        return;
      }

      newEntry = {
        date: now,
        timestamp: Date.now(),
        amount,
        type: 'expense',
        category,
        deductionLog: [],
        savingsLog: [
          {
            date: now,
            amount,
            note: 'Initial savings added',
          },
        ],
      };
    } else {
      newEntry = {
        date: now,
        timestamp: Date.now(),
        amount,
        type: 'personal',
        category: null,
        deductionLog: [],
        savingsLog: [
          {
            date: now,
            amount,
            note: 'Personal savings added',
          },
        ],
      };
    }

    const updatedList = [...savingsList, newEntry];
    setSavingsList(updatedList);

    const totalSavings = updatedList.reduce((sum, entry) => sum + entry.amount, 0);
    const updatedIncomeBalance = income - totalSavings;
    if (!isNaN(updatedIncomeBalance)) {
      setIncomeBalance(updatedIncomeBalance);
    }

    setShowConfirmModal(false);
    setConfirmData(null);
    setAmount('');
    setType('personal');
    setCategory('');
  };

  const cancelConfirmSave = () => {
    setShowConfirmModal(false);
    setConfirmData(null);
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

      const totalSavings = updatedList.reduce((sum, entry) => sum + entry.amount, 0);
      const updatedIncomeBalance = income - totalSavings;
      if (!isNaN(updatedIncomeBalance)) {
        setIncomeBalance(updatedIncomeBalance);
      }
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

  const closeWarningModal = () => {
    setShowWarning(false);
    setWarningMessage('');
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

      {/* ⚠️ Warning Modal */}
      {showWarning && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal-content">
            <h3>⚠️ Action Blocked</h3>
            <p>{warningMessage}</p>
            <div className="modal-actions">
              <button onClick={closeWarningModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirmation Modal */}
      {showConfirmModal && confirmData && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal-content">
            <h3>📝 Confirm Savings</h3>
            <p>
              Are you sure you want to add <strong>₱{confirmData.amount.toFixed(2)}</strong> to{' '}
              <strong>{confirmData.type === 'personal' ? 'Personal Savings' : `Expense Savings (${confirmData.category})`}</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={confirmSave}>Yes, Save</button>
              <button onClick={cancelConfirmSave}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔁 Merge Modal for existing expense category */}
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
