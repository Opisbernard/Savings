import { useState } from 'react';

function SavingsForm({ savingsList, setSavingsList }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('personal');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newEntry = {
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      amount: parsedAmount,
      type,
      category: type === 'expense' ? category.trim() : null,
      deductionLog: [], // 🧾 Initialize empty log
    };

    setSavingsList([...savingsList, newEntry]);
    setAmount('');
    setType('personal');
    setCategory('');
  };

  return (
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
  );
}

export default SavingsForm;
