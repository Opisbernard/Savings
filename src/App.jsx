import { useState, useEffect } from 'react';
import './style.css';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import SavingsForm from './components/SavingsForm';
import SavingsTable from './components/SavingsTable';

function App() {
  const [income, setIncome] = useState(() => {
    const stored = localStorage.getItem('income');
    return stored ? parseFloat(stored) : '';
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

  const [incomeBalance, setIncomeBalance] = useState(() => {
    const initial = income - expenses - personalSavings - expenseSavings;
    return !isNaN(initial) ? initial : 0;
  });

  useEffect(() => {
    const updatedBalance = income - expenses - personalSavings - expenseSavings;
    if (!isNaN(updatedBalance)) {
      setIncomeBalance(updatedBalance);
    }
  }, [income, expenses, personalSavings, expenseSavings]);

  useEffect(() => {
    if (income !== '') localStorage.setItem('income', income);
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
        setIncomeBalance={setIncomeBalance}
      />
      <ExpenseForm
        expenseList={expenseList}
        setExpenseList={setExpenseList}
        setExpenses={setExpenses}
        expenseSavings={expenseSavings}
        savingsList={savingsList}
        setSavingsList={setSavingsList}
        income={income}
        setIncomeBalance={setIncomeBalance}
      />
      <ExpenseTable expenseList={expenseList} />
      <SavingsForm
        savingsList={savingsList}
        setSavingsList={setSavingsList}
        income={income}
        setIncomeBalance={setIncomeBalance}
      />
      <SavingsTable savingsList={savingsList} />
    </main>
  );
}

export default App;
