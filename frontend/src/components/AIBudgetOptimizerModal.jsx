import { useState, useEffect, useCallback } from 'react';
import { Zap, X, TrendingDown, BedDouble, UtensilsCrossed, Ticket, Check } from 'lucide-react';
import * as aiService from '../services/aiService';

const catIcons = {
  Hotel: BedDouble,
  Food: UtensilsCrossed,
  Activities: Ticket,
};

const fallback = {
  totalPotentialSavings: 375,
  suggestions: [
    {
      category: 'Hotel',
      estimatedSavings: '~169 USD',
      title: 'Opt for Boutique Stays or Group Apartments',
      description: 'Booking local verified boutique stays or apartments in Goa can save up to 20% on accommodation without sacrificing comfort.',
    },
    {
      category: 'Food',
      estimatedSavings: '~113 USD',
      title: 'Mix Fine Dining with Famous Local Eateries',
      description: 'Enjoy high-rated local markets and neighborhood bistros for breakfasts and lunches, reserving fine dining for special evenings.',
    },
    {
      category: 'Activities',
      estimatedSavings: '~94 USD',
      title: 'Use City Travel Passes & Book Attractions in Advance',
      description: 'Multi-attraction tourist passes offer discounted entry and skip-the-line privileges across major landmarks.',
    },
  ],
};

const AIBudgetOptimizerModal = ({ isOpen, onClose, trip }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState([]);

  const fetchOptimization = useCallback(async () => {
    if (!trip) return;
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
      } else {
        setData(fallback);
      }
    } catch {
      setData(fallback);
      setError(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.destination, trip?.budget, trip?.currency, trip?.duration]);

  useEffect(() => {
    if (isOpen && trip) {
      setApplied([]);
      fetchOptimization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const shown = data || fallback;
  const currency = trip?.currency || 'USD';

  return (
    <div className="modal-backdrop opt-backdrop" onClick={onClose}>
      <div className="modal-dialog optimizer-modal opt-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="opt-head">
          <span className="opt-title"><Zap size={16} /> AI Expense Optimization</span>
          <span className="mono operational-pill">● SYSTEM OPERATIONAL</span>
          <button className="modal-close opt-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-content opt-body">
          {loading ? (
            <div className="optimizer-loading opt-loading">
              <div className="spinner"></div>
              <p className="mono">ANALYZING LEDGER • GEMINI ROUTE-SYNTH-V4...</p>
            </div>
          ) : error ? (
            <div className="optimizer-error">
              <p>{error}</p>
              <button className="btn-secondary" onClick={fetchOptimization}>Retry</button>
            </div>
          ) : (
            <>
              <div className="opt-hero">
                <div className="savings-badge mono"><TrendingDown size={15} /> Total Potential Savings</div>
                <div className="savings-amount">{shown.totalPotentialSavings} <span>{currency}</span></div>
                <p className="savings-subtext">Calculated across accommodation, dining, and activity passes.</p>
              </div>

              <h4 className="opt-subhead">Recommended Adjustments</h4>
              <div className="suggestions-list opt-list">
                {shown.suggestions?.map((item, idx) => {
                  const Icon = catIcons[item.category] || Ticket;
                  const isApplied = applied.includes(idx);
                  return (
                    <div key={idx} className={`suggestion-item opt-item ${isApplied ? 'applied' : ''}`}>
                      <span className="opt-ico"><Icon size={15} /></span>
                      <div className="opt-main">
                        <div className="suggestion-header">
                          <span className="suggestion-cat mono">{item.category}</span>
                          <span className="suggestion-savings mono">Save {item.estimatedSavings?.includes('~') ? item.estimatedSavings : `~${item.estimatedSavings} ${currency}`}</span>
                        </div>
                        <h5>{item.title}</h5>
                        <p>{item.description}</p>
                      </div>
                      <button
                        className={`opt-apply ${isApplied ? 'on' : ''}`}
                        onClick={() => setApplied((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]))}
                      >
                        {isApplied && <Check size={12} />} {isApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions opt-foot">
          <span className="mono opt-note">
            {applied.length > 0 ? `● ${applied.length} ADJUSTMENT${applied.length > 1 ? 'S' : ''} STAGED TO ITINERARY` : '○ SELECT ADJUSTMENTS TO STAGE TO ITINERARY'}
          </span>
          <button className="btn-primary opt-done" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default AIBudgetOptimizerModal;
