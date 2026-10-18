import { useState } from 'react';
import { X, Send } from 'lucide-react';
import * as aiService from '../services/aiService';

/* Minimal markdown renderer for replies — bold, bullets, line breaks (no deps). */
const renderInline = (text, keyPrefix) =>
  String(text)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{part}</strong> : part));

const renderMessageText = (text) => {
  const blocks = [];
  let bullets = [];
  const flushBullets = (key) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} style={{ margin: '6px 0', paddingLeft: 18 }}>
        {bullets.map((item, index) => (
          <li key={`li-${key}-${index}`} style={{ marginBottom: 3 }}>
            {renderInline(item, `li-${key}-${index}`)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  String(text || '')
    .split('\n')
    .forEach((line, index) => {
      const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
      if (bullet) {
        bullets.push(bullet[1]);
        return;
      }
      flushBullets(index);
      if (!line.trim()) return;
      blocks.push(
        <p key={`p-${index}`} style={{ margin: '4px 0' }}>
          {renderInline(line, `p-${index}`)}
        </p>
      );
    });
  flushBullets('end');
  return blocks;
};

const AIChatDrawer = ({ isOpen, onClose, trip }) => {
  const destination = trip?.destination || 'your trip';
  const shortDest = destination.split(',')[0].trim() || 'your trip';
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'AED ' };
  const currencySymbol = currencySymbols[trip?.currency] || '';
  const budget = Number(trip?.budget) || 0;
  const travelersCount = Number(trip?.travelers?.count) || 1;
  const days = Number(trip?.duration) || 0;
  const money = (amount) => `${currencySymbol}${Number(amount || 0).toLocaleString('en-IN')}`;

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'user',
      text: 'Can you make Day 3 cheaper? The activity costs seem a bit high.',
    },
    {
      id: 2,
      role: 'ai',
      isAlternativeRoute: true,
      text: `Absolutely! I swapped the private charter option in ${shortDest} for a verified shared experience — same highlights, noticeably lower cost.`,
      savingsText: '~12% Estimated Net Savings',
      savingsSub: `Keeps 100% of the ${shortDest} day plan intact.`,
    },
    {
      id: 3,
      role: 'user',
      text: 'What are the best local food spots near my stay?',
    },
    {
      id: 4,
      role: 'ai',
      text: `I'll rank top dining venues within a short ride of your ${shortDest} stay by traveler rating, local cuisine match, and your budget. 🚀`,
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [appliedSavings, setAppliedSavings] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputVal).trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setSending(true);

    try {
      const res = await aiService.chat({
        message: text,
        trip,
        chatHistory: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      });
      const aiText = res?.reply || res?.message || `I couldn't process that just now — try rephrasing, or ask about food, budget, taxis or your day plan.`;
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: aiText }]);
    } catch {
      // Backend offline — tell the user instead of faking a reply
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: `I couldn't reach the trip assistant just now. Check your connection and send that again — I'll answer from your live plan.`,
        },
      ]);
    } finally {
      setSending(false);
    }
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
        <div className="chat-drawer-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              My Trips &gt; {days ? `${days}-Day ` : ''}{shortDest} Journey • <strong style={{ color: '#025a9e' }}>LIVE BUDGET</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="chat-sync-chip" style={{ fontSize: '0.7rem', color: '#025a9e', fontWeight: 600 }}>● Synchronized 2 mins ago</span>
              <button className="chat-close-btn" onClick={onClose}><X size={18} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="chat-budget-val">{money(budget)}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {money(Math.round(budget / Math.max(1, travelersCount)))} / person ({travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}{days ? ` • ${days} Days` : ''})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#f0f9ff', color: '#025a9e', border: '1px solid #bae6fd', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
              ● Budget Cap {money(budget)}
            </span>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
              🛡️ AI Savings Optimization Active
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div
                className={`chat-bubble ${m.role}`}
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '0.85rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {m.isAlternativeRoute && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#025a9e', marginBottom: 4 }}>
                    ⚡ Calculated Alternative Route
                  </div>
                )}
                {renderMessageText(m.text)}

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
                      {appliedSavings ? '✔ Applied' : '✔ Apply Day 3 Savings'}
                    </button>
                    <button className="chat-alt-secondary">
                      Keep Original
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="chat-quickbar">
          {[
            `Split ${shortDest} taxi with others?`,
            'Suggest cheap sunset spot',
            'Check baggage charges',
          ].map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="chat-quick-chip"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your trip, budget or itinerary..."
            className="chat-input"
          />
          <button
            onClick={() => handleSend()}
            disabled={sending}
            style={{ padding: '10px 16px', background: '#0b2545', color: '#fff', border: 'none', borderRadius: 8, cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.7 : 1 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatDrawer;
