import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
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
  incomeBalance,
  setIncomeBalance
}) {
  const safeIncome = typeof income === 'number' && !isNaN(income) ? income : null;
  const safeExpenses = typeof expenses === 'number' && !isNaN(expenses) ? expenses : null;
  const totalSavings = personalSavings + expenseSavings;
  const remainingBalance = totalSavings;

  const progress =
    typeof goal === 'number' && goal > 0 && remainingBalance !== null
      ? Math.min((remainingBalance / goal) * 100, 100).toFixed(1)
      : null;

  const [incomeHistory, setIncomeHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSavingsDetails, setShowSavingsDetails] = useState(false);
  const [breakdownType, setBreakdownType] = useState('expense');
  const [sortIncomeBy, setSortIncomeBy] = useState('newest');

// JSX — Goal Section and Savings Breakdown.
  // 🧠 Show modal if expenses exceed income
useEffect(() => {
  if (safeIncome !== null && safeExpenses !== null && safeExpenses > safeIncome) {
    setShowModal(true);
  }
}, [safeExpenses, safeIncome]);

// 🧠 Load income history from localStorage on mount
useEffect(() => {
  const savedHistory = localStorage.getItem('incomeHistory');
  if (savedHistory) {
    try {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed)) {
        setIncomeHistory(parsed);
      }
    } catch (err) {
      console.error('Failed to parse income history from localStorage:', err);
    }
  }
}, []);

// 🧠 Save income history to localStorage whenever it updates
useEffect(() => {
  localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));
}, [incomeHistory]);

// 🧠 Add new income and log it
const handleUpdateIncome = () => {
  const input = document.getElementById('income-input');
  const newIncome = parseFloat(input.value);
  if (!isNaN(newIncome) && newIncome > 0) {
    const updatedIncome = income + newIncome;
    setIncome(updatedIncome);
    logIncome(newIncome);
    input.value = '';
  }
};

// 🧠 Log income entry with timestamp
const logIncome = (amount) => {
  const now = new Date().toLocaleString();
  setIncomeHistory((prev) => [...prev, { date: now, amount }]);
};


  const exportDashboardLogsAsPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title Section
  doc.setFontSize(20);
  doc.setTextColor('#333');
  doc.text('Budget Report', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor('#666');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

  let yOffset = 40;

  // Income History Table
  doc.setFontSize(14);
  doc.setTextColor('#000');
  doc.text('Income History', 14, yOffset);
  yOffset += 6;

  const incomeTable = incomeHistory.map((entry, index) => [
    index + 1,
    entry.date,
    `₱${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  ]);

  const totalIncome = incomeHistory.reduce((sum, entry) => sum + entry.amount, 0);
  incomeTable.push(['', 'Total Income', `₱${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]);

  autoTable(doc, {
    startY: yOffset,
    head: [['#', 'Date', 'Amount Added']],
    body: incomeTable,
    styles: {
      fontSize: 11,
      cellPadding: 4,
      halign: 'left',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [0, 123, 255],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    footStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: 14, right: 14 },
  });

  // 🖨 Save the PDF
  doc.save('dashboard-report.pdf');
};



// Chart Data and Category Breakdown Setup
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

  const expenseCategories = Array.from(
    new Set(
      savingsList
        .filter((entry) => entry.type === 'expense' && entry.category)
        .map((entry) => entry.category)
    )
  );

  const getRemainingByCategory = (cat) =>
    savingsList
      .filter((entry) => entry.type === 'expense' && entry.category === cat)
      .reduce((sum, entry) => sum + entry.amount, 0);


// JSX — Header, Modal, KPI Tiles
    return (
    <section className="dashboard" aria-label="Budget Summary Dashboard">
      <h2>📊 Budget Summary</h2>

      <div className="income-edit">
        <input type="number" id="income-input" placeholder="Enter income to add" />
        <button onClick={handleUpdateIncome}>Add Income</button>
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
        <div className="kpi-tile"><h3>Total Income</h3><p>{safeIncome !== null ? `₱${safeIncome.toFixed(2)}` : '—'}</p></div>
        <div className="kpi-tile"><h3>Total Expenses</h3><p>{safeExpenses !== null ? `₱${safeExpenses.toFixed(2)}` : '—'}</p></div>
        <div className="kpi-tile"><h3>Total Savings</h3><p>₱{remainingBalance.toFixed(2)}</p></div>
        <div className="kpi-tile"><h3>Personal Savings</h3><p>₱{personalSavings.toFixed(2)}</p></div>
        <div className="kpi-tile"><h3>Expense Savings</h3><p>₱{expenseSavings.toFixed(2)}</p></div>
        <div className="kpi-tile">
          <h3>Available Funds</h3>
          <p style={{ color: incomeBalance < 0 ? '#ff4c4c' : '#00ff88' }}>
            {incomeBalance !== null && !isNaN(incomeBalance)
              ? `₱${incomeBalance.toFixed(2)}`
              : '—'}
          </p>
        </div>
      </div>

{/* Goal Section and Savings Breakdown. */}
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

        {goal > 0 && progress !== null && (
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

      <div className="savings-breakdown">
        <h3>💡 Savings Breakdown</h3>
        <button onClick={() => setShowSavingsDetails(!showSavingsDetails)}>
          {showSavingsDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showSavingsDetails && (
          <div className="category-summary">
            <div className="breakdown-toggle">
              <label>View:</label>
              <select value={breakdownType} onChange={(e) => setBreakdownType(e.target.value)}>
                <option value="expense">Expense Savings</option>
                <option value="personal">Personal Savings</option>
              </select>
            </div>

            {breakdownType === 'expense' && (
              <>
                <p><strong>Total Expense Savings:</strong> ₱{expenseSavings.toFixed(2)}</p>
                {expenseCategories.map((cat, index) => {
                  const amount = getRemainingByCategory(cat);
                  const percent = expenseSavings > 0 ? ((amount / expenseSavings) * 100).toFixed(1) : 0;
                  return (
                    <div key={index} className="category-tile">
                      <strong>{cat}</strong>: ₱{amount.toFixed(2)} ({percent}%)
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {breakdownType === 'personal' && (
              <>
                <p><strong>Total Personal Savings:</strong> ₱{personalSavings.toFixed(2)}</p>
                {savingsList
                  .filter((entry) => entry.type === 'personal')
                  .map((entry, index) => {
                    const percent = personalSavings > 0 ? ((entry.amount / personalSavings) * 100).toFixed(1) : 0;
                    return (
                      <div key={index} className="category-tile">
                        <strong>{entry.date}</strong>: ₱{entry.amount.toFixed(2)} ({percent}%)
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        )}
      </div>

<div className="chart-wrapper">
  <Doughnut data={expenseChartData} options={expenseChartOptions} />
</div>

<section className="history">
  <h2>📜 Income History</h2>
  <p><strong>Total Income Added:</strong> ₱{incomeHistory.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}</p>

  <div className="history-controls">
    <label>Sort by:</label>
    <select value={sortIncomeBy} onChange={(e) => setSortIncomeBy(e.target.value)}>
      <option value="newest">Newest First</option>
      <option value="amount">Amount (High to Low)</option>
    </select>

    <button onClick={exportDashboardLogsAsPDF}>Export Full Report (PDF)</button>
    <button className="clear-button" onClick={() => {
      setIncomeHistory([]);
      localStorage.removeItem('incomeHistory');
    }}>Clear Income History</button>
  </div>

  <table id="income-history">
    <thead>
      <tr>
        <th>Date</th>
        <th>Amount Added</th>
      </tr>
    </thead>
    <tbody>
      {[...incomeHistory]
        .sort((a, b) => {
          if (sortIncomeBy === 'newest') return new Date(b.date) - new Date(a.date);
          if (sortIncomeBy === 'amount') return b.amount - a.amount;
          return 0;
        })
        .map((entry, index) => (
          <tr key={index}>
            <td>{entry.date}</td>
            <td style={{ color: '#00ff88' }}>+₱{entry.amount.toFixed(2)}</td>
          </tr>
        ))}
    </tbody>
  </table>
</section>


    </section>
  );
}

export default Dashboard;
