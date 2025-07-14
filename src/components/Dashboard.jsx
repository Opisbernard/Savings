import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

function Dashboard({
  income,
  setIncome,
  expenses,
  goal,
  setGoal,
  savingsList,
  expenseList,
  personalSavings,
  expenseSavings,
  incomeBalance
}) {
  const safeIncome = typeof income === 'number' && !isNaN(income) ? income : 0;
  const safeExpenses = typeof expenses === 'number' && !isNaN(expenses) ? expenses : 0;
  const remainingBalance = safeIncome - safeExpenses;
  const totalSavings = personalSavings + expenseSavings;

  const progress =
    typeof goal === 'number' && goal > 0
      ? Math.min((remainingBalance / goal) * 100, 100).toFixed(1)
      : '0';

  const [incomeHistory, setIncomeHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (safeExpenses > safeIncome) {
      setShowModal(true);
    }
  }, [safeExpenses, safeIncome]);

  const handleUpdateIncome = () => {
    const input = document.getElementById('income-input');
    const newIncome = parseFloat(input.value);
    if (!isNaN(newIncome) && newIncome > 0) {
      setIncome(newIncome);
      logIncome(newIncome);
      input.value = '';
    }
  };

  const logIncome = (amount) => {
    const now = new Date().toLocaleString();
    setIncomeHistory((prev) => [...prev, { date: now, amount }]);
  };

  const categoryTotals = {};
  expenseList.forEach((entry) => {
    const category = entry.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + entry.amount;
  });

  const expenseChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#ff4c4c', '#ffa500', '#00f0ff', '#00ff88', '#ff00ff', '#8888ff', '#ffff00'
        ],
        borderWidth: 1,
      },
    ],
  };

  const expenseChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <section className="dashboard" aria-label="Budget Summary Dashboard">
      <h2>📊 Budget Summary</h2>

      <div className="income-edit">
        <input type="number" id="income-input" placeholder="Enter new income" />
        <button onClick={handleUpdateIncome}>Update Income</button>
      </div>

      {showModal && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal-content">
            <h3>⚠️ Overspending Alert</h3>
            <p>Are you going to continue the expenses? You're exceeding your daily income.</p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Yes</button>
              <button onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      <div className="kpi-container">
        <div className="kpi-tile">
          <h3>Income</h3>
          <p>₱{safeIncome.toFixed(2)}</p>
        </div>
        <div className="kpi-tile">
          <h3>Expenses</h3>
          <p>₱{safeExpenses.toFixed(2)}</p>
        </div>
        <div className="kpi-tile">
          <h3>Remaining Balance</h3>
          <p>₱{remainingBalance.toFixed(2)}</p>
        </div>
        <div className="kpi-tile">
          <h3>Personal Savings</h3>
          <p>₱{personalSavings.toFixed(2)}</p>
        </div>
        <div className="kpi-tile">
          <h3>Expense Savings</h3>
          <p>₱{expenseSavings.toFixed(2)}</p>
        </div>
        <div className="kpi-tile">
          <h3>Income Balance</h3>
          <p style={{ color: incomeBalance < 0 ? '#ff4c4c' : '#00ff88' }}>
            ₱{incomeBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="goal-section">
        <h3>Set Your Savings Goal</h3>
        <div className="goal-edit">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={goal !== null ? goal : ''}
            onChange={(e) => {
              const newGoal = e.target.value === '' ? null : parseFloat(e.target.value);
              setGoal(!isNaN(newGoal) && newGoal > 0 ? newGoal : null);
            }}
            placeholder="Enter savings goal"
          />
        </div>

        {goal > 0 && (
          <div className="progress-bar-wrapper">
            <h4>Progress toward ₱{goal.toLocaleString()}</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chart-wrapper">
        <Doughnut data={expenseChartData} options={expenseChartOptions} />
      </div>

      <section className="history">
        <h2>📜 Income History</h2>
        <table id="income-history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {incomeHistory.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>
                  ₱{typeof entry.amount === 'number' && !isNaN(entry.amount)
                    ? entry.amount.toFixed(2)
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

export default Dashboard;
