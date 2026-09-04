import { useState, useEffect } from 'react';
import { Sparkles, X, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';
import * as aiService from '../services/aiService';

const AIBudgetOptimizerModal = ({ isOpen, onClose, trip, onApplyOptimization }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && trip) {
      fetchOptimization();
    }
  }, [isOpen, trip]);

  const fetchOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.optimizeBudget({
        trip,
        expenses: trip.expenses || {},
        budget: trip.budget || 1000,
        currency: trip.currency || 'USD',
        travelers: trip.travelers?.count || 1,
      });

      if (res.success && res.optimization) {
        setData(res.optimization);
      }
    } catch (err) {
      setError(err.message || 'Could not calculate optimizations');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog optimizer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Sparkles size={20} className="sparkle-icon" />
            <h3>AI Expense Optimization</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="optimizer-loading">
              <div className="spinner"></div>
              <p>Analyzing trip expenses with Gemini AI...</p>
            </div>
          ) : error ? (
            <div className="optimizer-error">
              <p>{error}</p>
              <button className="btn-secondary" onClick={fetchOptimization}>Retry</button>
            </div>
          ) : data ? (
            <div className="optimizer-results">
              <div className="savings-highlight-card">
                <div className="savings-badge">
                  <TrendingDown size={18} />
                  <span>Total Potential Savings</span>
                </div>
                <div className="savings-amount">
                  {data.totalPotentialSavings} <span className="savings-curr">{trip?.currency || 'USD'}</span>
                </div>
                <p className="savings-subtext">Calculated across accommodation, dining, and activity passes.</p>
              </div>

              <div className="suggestions-list">
                <h4>Recommended Adjustments</h4>
                {data.suggestions?.map((item, idx) => (
                  <div key={idx} className="suggestion-item">
                    <div className="suggestion-header">
                      <span className="suggestion-cat">{item.category || 'Strategy'}</span>
                      <span className="suggestion-savings">Save ~{item.estimatedSavings} {trip?.currency || 'USD'}</span>
                    </div>
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default AIBudgetOptimizerModal;
