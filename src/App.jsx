import { useState, useEffect } from 'react';
import './style.css';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import SavingsForm from './components/SavingsForm';
import SavingsTable from './components/SavingsTable';

function App() {
  const [income, setIncome] = useState(() => {
    const stored = parseFloat(localStorage.getItem('income'));
    return !isNaN(stored) ? stored : 10000;
  });

  const [expenseList, setExpenseList] = useState(() => {
    try {
      const stored = localStorage.getItem('expenseList');
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState(() => {
    return expenseList.reduce((sum, entry) => sum + entry.amount, 0);
  });

  const [goal, setGoal] = useState(() => {
    const stored = parseFloat(localStorage.getItem('goal'));
    return !isNaN(stored) && stored > 0 ? stored : null;
  });

  const [savingsList, setSavingsList] = useState(() => {
    try {
      const stored = localStorage.getItem('savingsList');
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const personalSavings = savingsList
    .filter((entry) => entry.type === 'personal')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const expenseSavings = savingsList
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const incomeBalance = income - personalSavings - expenseSavings;

  useEffect(() => {
    localStorage.setItem('income', income);
    localStorage.setItem('expenses', expenses);
    localStorage.setItem('expenseList', JSON.stringify(expenseList));
    localStorage.setItem('savingsList', JSON.stringify(savingsList));
    if (goal !== null) {
      localStorage.setItem('goal', goal);
    } else {
      localStorage.removeItem('goal');
    }
  }, [income, expenses, expenseList, savingsList, goal]);

  return (
    <main className="container" role="main">
      <h1>💸 Budget Planner</h1>
      <Dashboard
        income={income}
        setIncome={setIncome}
        expenses={expenses}
        setExpenses={setExpenses}
        goal={goal}
        setGoal={setGoal}
        savingsList={savingsList}
        expenseList={expenseList}
        personalSavings={personalSavings}
        expenseSavings={expenseSavings}
        incomeBalance={incomeBalance}
      />
      <ExpenseForm
        expenseList={expenseList}
        setExpenseList={setExpenseList}
        setExpenses={setExpenses}
        expenseSavings={expenseSavings}
        savingsList={savingsList}
        setSavingsList={setSavingsList}
      />
      <ExpenseTable expenseList={expenseList} />
      <SavingsForm
        savingsList={savingsList}
        setSavingsList={setSavingsList}
      />
      <SavingsTable savingsList={savingsList} />
    </main>
  );
}

export default App;
