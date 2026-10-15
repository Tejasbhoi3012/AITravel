import { Sparkles } from 'lucide-react';

const ExpenseDashboard = ({
  expenses = {},
  budget = 1000,
  currency = 'USD',
  travelers = { count: 1 },
  onOpenAIOptimizer,
}) => {
  const transportation = Number(expenses.transportation) || 0;
  const hotel = Number(expenses.hotel) || 0;
  const food = Number(expenses.food) || 0;
  const activities = Number(expenses.activities) || 0;
  const localTravel = Number(expenses.localTravel) || 0;
  const misc = Number(expenses.miscellaneous) || 0;

  const total = expenses.total || (transportation + hotel + food + activities + localTravel + misc);
  const count = Number(travelers?.count) || 1;
  const costPerPerson = expenses.costPerPerson || Math.round(total / count);
  const remainingBudget = expenses.remainingBudget ?? (Number(budget) - total);
  const isOverBudget = remainingBudget < 0;

  const categories = [
    { label: 'Accommodation', amount: hotel, color: '#3b82f6', percent: total > 0 ? Math.round((hotel / total) * 100) : 0 },
    { label: 'Flights / Transit', amount: transportation, color: '#8b5cf6', percent: total > 0 ? Math.round((transportation / total) * 100) : 0 },
    { label: 'Food & Dining', amount: food, color: '#10b981', percent: total > 0 ? Math.round((food / total) * 100) : 0 },
    { label: 'Activities & Entry', amount: activities, color: '#f59e0b', percent: total > 0 ? Math.round((activities / total) * 100) : 0 },
    { label: 'Local Commute', amount: localTravel, color: '#06b6d4', percent: total > 0 ? Math.round((localTravel / total) * 100) : 0 },
    { label: 'Miscellaneous', amount: misc, color: '#64748b', percent: total > 0 ? Math.round((misc / total) * 100) : 0 },
  ];

  return (
    <div className="expense-dashboard">
      {/* Overview Cards */}
      <div className="expense-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Allocated Budget</div>
          <div className="stat-value">{budget} <span className="stat-unit">{currency}</span></div>
          <div className="stat-sub">Planned limit</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-label">Estimated Total Expense</div>
          <div className="stat-value">{total} <span className="stat-unit">{currency}</span></div>
          <div className="stat-sub">Across all categories</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Cost Per Person ({count} {count === 1 ? 'traveler' : 'travelers'})</div>
          <div className="stat-value">{costPerPerson} <span className="stat-unit">{currency}</span></div>
          <div className="stat-sub">Formula: total / {count}</div>
        </div>

        <div className={`stat-card ${isOverBudget ? 'alert' : 'success'}`}>
          <div className="stat-label">Remaining Budget</div>
          <div className="stat-value">
            {remainingBudget >= 0 ? `+${remainingBudget}` : remainingBudget}{' '}
            <span className="stat-unit">{currency}</span>
          </div>
          <div className="stat-sub">
            {isOverBudget ? 'Over budget by ' + Math.abs(remainingBudget) : 'Safe margin available'}
          </div>
        </div>
      </div>

      {/* AI Optimize CTA Banner */}
      {onOpenAIOptimizer && (
        <div className="ai-optimizer-banner">
          <div className="banner-left">
            <div className="sparkle-circle">
              <Sparkles size={20} />
            </div>
            <div>
              <h4>Want to optimize these expenses?</h4>
              <p>Gemini AI can analyze your categories and suggest smart ways to save up to 20%.</p>
            </div>
          </div>
          <button className="btn-ai-optimize" onClick={onOpenAIOptimizer}>
            <Sparkles size={16} /> Optimize with AI
          </button>
        </div>
      )}

      {/* Breakdown Progress Bars */}
      <div className="expense-breakdown-card">
        <h3>Expense Breakdown by Category</h3>
        <div className="category-bars">
          {categories.map((cat) => (
            <div key={cat.label} className="cat-bar-item">
              <div className="cat-bar-header">
                <span className="cat-title" style={{ borderLeft: `4px solid ${cat.color}`, paddingLeft: '8px' }}>
                  {cat.label}
                </span>
                <span className="cat-val">
                  <strong>{cat.amount} {currency}</strong> ({cat.percent}%)
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(cat.percent, 100)}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
