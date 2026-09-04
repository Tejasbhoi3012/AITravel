import { useState } from 'react';
import { Sparkles, X, Send, Check, TrendingDown, Bot, User } from 'lucide-react';
import * as aiService from '../services/aiService';

const AIChatDrawer = ({ isOpen, onClose, trip }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'user',
      text: 'Can you make Day 3 cheaper? The island cruise seems a bit high.',
    },
    {
      id: 2,
      role: 'ai',
      isAlternativeRoute: true,
      text: 'Absolute! I swapped the private catamaran charter with a verified shared speed boat cruise with standard snorkeling.',
      savingsText: '₹2,400 Estimated Net Savings',
      savingsSub: 'Keeps 100% of the island visit & marine sightseeing intact.',
    },
    {
      id: 3,
      role: 'user',
      text: 'What is the best vegetarian breakfast near Baga?',
    },
    {
      id: 4,
      role: 'ai',
      text: 'I recommend Cafe Tato (famous for Goan Sukha Puri & filter coffee) and Infantaria Bakery for fresh cinnamon rolls and herbal teas! 🚀 Both within 1.2 km of Casa De Goa',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [appliedSavings, setAppliedSavings] = useState(false);

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text },
      {
        id: Date.now() + 1,
        role: 'ai',
        text: `Understood! Optimizing itinerary and recalculating budgets for "${text}".`,
      },
    ]);
    setInputVal('');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-drawer-overlay" onClick={onClose}>
      <div
        className="chat-drawer"
        style={{ width: 680, maxWidth: '100%', background: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              My Trips &gt; 5-Day Tropical Goa Escape • <strong style={{ color: '#025a9e' }}>LIVE BUDGET</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.7rem', color: '#025a9e', fontWeight: 600 }}>● Synchronized 2 mins ago</span>
              <button className="chat-close-btn" onClick={onClose}><X size={18} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>₹42,500</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              ₹21,250 / person (2 Travelers • 5 Days • Oct 14 - 19)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#f0f9ff', color: '#025a9e', border: '1px solid #bae6fd', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
              ● ₹7,500 Under Target (Budget ₹50k)
            </span>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
              🛡️ 15% Savings Optimized by AI
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-messages" style={{ background: '#f8fafc', flex: 1, padding: 20 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: m.role === 'user' ? '#0b2545' : '#ffffff',
                  color: m.role === 'user' ? '#ffffff' : '#0f172a',
                  border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                  fontSize: '0.85rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {m.isAlternativeRoute && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#025a9e', marginBottom: 4 }}>
                    ⚡ Calculated Alternative Route
                  </div>
                )}
                <p>{m.text}</p>

                {m.savingsText && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px', marginTop: 8 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>{m.savingsText}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.savingsSub}</div>
                  </div>
                )}

                {m.isAlternativeRoute && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                      onClick={() => setAppliedSavings(true)}
                      style={{
                        padding: '6px 12px',
                        background: appliedSavings ? '#16a34a' : '#025a9e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {appliedSavings ? '✔ Applied (-₹2,400)' : '✔ Apply Day 3 Savings (-₹2,400)'}
                    </button>
                    <button
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Keep Original
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {[
            'Split Goa taxi with others?',
            'Suggest cheap sunset shack',
            'Check baggage charges',
          ].map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: 16, background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your trip, budget or itinerary..."
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem' }}
          />
          <button
            onClick={() => handleSend()}
            style={{ padding: '10px 16px', background: '#0b2545', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatDrawer;
