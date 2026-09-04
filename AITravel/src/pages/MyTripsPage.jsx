import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Share2,
  Download,
  Mail,
  MessageCircle,
  Copy,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Receipt,
  Search,
  Check,
  Calendar,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  const completedTrips = [
    {
      id: 'goa_1',
      title: '5-Day Tropical Goa Escape',
      dates: 'Oct 14 – Oct 19, 2025',
      travelers: '2 Travelers',
      totalCost: '₹42,500',
      status: '15% Under Target (50k)',
      desc: 'Boutique heritage stay, private catamaran charter, and culinary tour.',
      savings: 'Saved ₹6,300 via dynamic rebooking',
      bars: [
        { label: 'Stays', val: '₹15k' },
        { label: 'Flight', val: '₹12k' },
        { label: 'Dining', val: '₹8k' },
        { label: 'Act', val: '₹4k' },
        { label: 'Transit', val: '₹3.5k' },
      ],
    },
    {
      id: 'dubai_1',
      title: '4-Day Dubai Luxury & Dune Safari',
      dates: 'Aug 10 – Aug 14, 2025',
      travelers: '2 Travelers',
      totalCost: '₹78,200',
      status: '2.2% Under Target (80k)',
      desc: 'Marina suites, Desert camp stargazing, and fine dining experiences.',
      savings: 'Saved ₹12,400 via automated lounge & hotel coupons',
      bars: [
        { label: 'Stays', val: '₹34k' },
        { label: 'Flight', val: '₹19.6k' },
        { label: 'Dining', val: '₹14.2k' },
        { label: 'Safari', val: '₹10.4k' },
      ],
    },
    {
      id: 'bali_1',
      title: '7-Day Bali Cultural & Villa Retreat',
      dates: 'Apr 03 – Apr 09, 2025',
      travelers: '2 Travelers',
      totalCost: '₹64,800',
      status: 'Matched Target Budget',
      desc: 'Ubud rainforest sanctuary, temple excursions, and scooter transit.',
      savings: 'Zero FX fee card saved ₹2,140 on foreign conversion',
      bars: [
        { label: 'Villa', val: '₹24.6k' },
        { label: 'Flight', val: '₹22k' },
        { label: 'Food', val: '₹11.4k' },
        { label: 'Spa', val: '₹7.8k' },
      ],
    },
    {
      id: 'himachal_1',
      title: '3-Day Himachal Mountain Expedition',
      dates: 'Jan 16 – Jan 18, 2025',
      travelers: 'Solo Adventure',
      totalCost: '₹32,900',
      status: 'Within Budget',
      desc: 'Winter cabin stay, licensed 4x4 trails, and mountain trekking permits.',
      savings: 'Early bird cabin reservation locked 25% discount',
      bars: [
        { label: 'Cabin', val: '₹13.2k' },
        { label: 'Transit', val: '₹10.5k' },
        { label: 'Permits', val: '₹6k' },
        { label: 'Food', val: '₹3.2k' },
      ],
    },
  ];

  const transactionLogs = [
    {
      date: 'Oct 14, 2025',
      trip: 'Goa Escape',
      item: 'IndiGo Flight 6E-4001 (BOM -> GOI)',
      itemSub: 'PNR: GK-V6Z3EF • Seat 14A, 14B',
      category: 'Flights',
      payer: 'You (Direct)\nSplit: 50/50 with Priya',
      receipt: 'View Voucher',
      status: 'Verified AI Spot',
      amount: '₹12,000',
    },
    {
      date: 'Oct 15, 2025',
      trip: 'Goa Escape',
      item: 'Heritage Portuguese Villa & Spa',
      itemSub: 'Anjuna, North Goa • 4 Nights Deluxe Suite',
      category: 'Stays',
      payer: 'You (HDFC Card)\nSplit: 50/50',
      receipt: 'GST Invoice',
      status: 'Settled',
      amount: '₹15,000',
    },
    {
      date: 'Oct 16, 2025',
      trip: 'Goa Escape',
      item: "Chef's Table Seafood Experience",
      itemSub: 'Gunpowder Restaurant, Assagao',
      category: 'Dining',
      payer: 'Priya Sharma (UPI)\nReimbursed by You (50%)',
      receipt: 'Bill OCR',
      status: 'Settled',
      amount: '₹8,000',
    },
    {
      date: 'Oct 17, 2025',
      trip: 'Goa Escape',
      item: 'Sunset Catamaran Charter & Kayaks',
      itemSub: 'Chapora River Cruising',
      category: 'Activities',
      payer: 'Priya Sharma (UPI)\nShared Adventure',
      receipt: 'E-Ticket',
      status: 'Verified',
      amount: '₹4,000',
    },
    {
      date: 'Aug 11, 2025',
      trip: 'Dubai Luxury',
      item: 'Atlantis The Royal - Harbor Penthouse',
      itemSub: 'Palm Jumeirah • AI Negotiated Rate',
      category: 'Stays',
      payer: 'Corporate Card\nReimbursable Ledger',
      receipt: 'VAT Invoice',
      status: 'Audit Passed',
      amount: '₹34,000',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="audited-statements-root">
      {/* Top Bar with Breadcrumb and Currency Switcher */}
      <div className="audit-top-row">
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#025a9e', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            AUDITED STATEMENTS • <span style={{ color: '#16a34a' }}>● Real-time Ledger Sync: Oct 2026</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            Expense History &amp; Audited Trip Statements
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 700 }}>
            Review, compare, and audit completed itineraries, automated receipt matching, and currency-settled expense archives with algorithmic savings intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
            {['INR', 'USD', 'EUR'].map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                style={{
                  padding: '4px 10px',
                  background: selectedCurrency === curr ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: selectedCurrency === curr ? '#025a9e' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: selectedCurrency === curr ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}
              </button>
            ))}
          </div>

          <div className="audit-action-btn-group">
            <button className="btn-ws-secondary" onClick={() => alert('Exporting CSV / Excel format...')}>
              <FileText size={13} />
              <span>Export CSV / Excel</span>
            </button>
            <button className="btn-ws-primary" onClick={() => window.print()}>
              <Download size={13} />
              <span>Share PDF Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero "Generate & Share Audited Statement" Card */}
      <div className="audit-hero-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div className="brand-logo-icon" style={{ width: 24, height: 24 }}>
              <Receipt size={14} />
            </div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
              Generate &amp; Share Audited Statement
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 16 }}>
            Configure trip parameters and cryptographic receipt verification for tax &amp; co-traveler settlements.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b' }}>SELECT TARGET TRIP</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 4 }}>
                <option>5-Day Tropical Goa Escape (Oct 2025)</option>
                <option>4-Day Dubai Luxury &amp; Dune Safari</option>
                <option>7-Day Bali Cultural &amp; Villa Retreat</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b' }}>REPORT FORMAT</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 4 }}>
                <option>Comprehensive Tax &amp; Corporate Reimb.</option>
                <option>Personal Co-Traveler Split Summary</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem', color: '#334155' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" defaultChecked /> Include verified digital receipts
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" defaultChecked /> AI cost-saving optimizations log
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" defaultChecked /> Co-traveler split breakdowns
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" /> Custom corporate watermark
            </label>
          </div>
        </div>

        {/* Right side: Instant Distribution */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>
            INSTANT DISTRIBUTION
          </span>

          <button
            onClick={() => window.print()}
            style={{
              padding: '10px',
              background: '#025a9e',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Download PDF (Print Ready)
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn-ws-secondary" style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
              <Mail size={12} /> Send Email
            </button>
            <button className="btn-ws-secondary" style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
              <MessageCircle size={12} /> WhatsApp
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-ws-secondary"
            style={{ justifyContent: 'center', fontSize: '0.75rem' }}
          >
            <Copy size={12} /> {copiedLink ? 'Copied Link!' : 'Copy Encrypted Link'}
          </button>
        </div>
      </div>

      {/* 4 Lifetime Aggregate Stat Cards */}
      <div className="aggregate-4stats-grid">
        <div className="aggregate-stat-card">
          <div className="agg-label">Lifetime Travel Spend</div>
          <div className="agg-val">₹2,18,400</div>
          <div className="agg-sub">Across 4 completed journeys</div>
        </div>

        <div className="aggregate-stat-card">
          <div className="agg-label">AI Algorithmic Savings</div>
          <div className="agg-val" style={{ color: '#16a34a' }}>₹34,200</div>
          <div className="agg-sub">+15.6% savings vs dynamic public fares</div>
        </div>

        <div className="aggregate-stat-card">
          <div className="agg-label">Avg. Daily Burn Rate</div>
          <div className="agg-val">₹8,400<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/day</span></div>
          <div className="agg-sub">Aggregated across 26 travel days</div>
        </div>

        <div className="aggregate-stat-card">
          <div className="agg-label">Reconciled Receipts</div>
          <div className="agg-val" style={{ color: '#025a9e' }}>48 / 48</div>
          <div className="agg-sub">✔ 100% Tax Compliant &amp; Matched</div>
        </div>
      </div>

      {/* Completed Itineraries & Budget Performance (4 Cards Grid) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
          Completed Itineraries &amp; Budget Performance
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sorted by most recent</span>
      </div>

      <div className="completed-4trips-grid">
        {completedTrips.map((t) => (
          <div key={t.id} className="completed-trip-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.dates} • {t.travelers}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{t.title}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#025a9e' }}>{t.totalCost}</div>
                <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                  {t.status}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 14 }}>{t.desc}</p>

            <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
              {t.bars.map((b, i) => (
                <div key={i} style={{ flex: 1, background: '#f1f5f9', padding: '4px 6px', borderRadius: 4, fontSize: '0.68rem', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8' }}>{b.label}</div>
                  <strong style={{ color: '#0f172a' }}>{b.val}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 10 }}>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>{t.savings}</span>
              <button
                onClick={() => navigate('/trip/goa_1')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View Audit 📥
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Split Ledger & Reimbursement Status */}
      <div className="split-ledger-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color="#025a9e" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            Goa Trip Split Ledger &amp; Reimbursement Status
          </strong>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
          Multi-payer expenses calculated automatically. All balances reconciled and synced through UPI instant payouts.
        </p>

        <div className="ledger-3boxes-row">
          <div className="ledger-box">
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800 }}>YOUR OUTFLOW</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>₹26,500</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>62.3% of total cost</div>
          </div>

          <div className="ledger-box">
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800 }}>PRIYA SHARMA PAID</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>₹16,000</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>37.7% of total cost</div>
          </div>

          <div className="ledger-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 800 }}>NET BALANCE</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a', margin: '2px 0' }}>✔ Fully Settled</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>₹5,250 transferred via UPI</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>Corporate Tax Claim</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 6px' }}>Need to claim GST-registered expenses?</div>
            <button className="btn-ws-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
              Export Claim Sheet (GST / Form 16)
            </button>
          </div>
        </div>
      </div>

      {/* Granular Itemized Transaction Log (Data Table) */}
      <div className="transactions-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Granular Itemized Transaction Log
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Audited transaction records, OCR invoice match flags, and co-traveler splits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px' }}>
              <Search size={12} color="#64748b" />
              <input
                type="text"
                placeholder="Search vendor, item or PNR..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', marginLeft: 6, width: 160 }}
              />
            </div>
            <select style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem' }}>
              <option>All Categories ▾</option>
            </select>
          </div>
        </div>

        <table className="data-table-clean">
          <thead>
            <tr>
              <th>DATE &amp; TRIP</th>
              <th>EXPENSE ITEM &amp; VENDOR</th>
              <th>CATEGORY</th>
              <th>PAYER / SPLIT</th>
              <th>RECEIPT &amp; PROOF</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {transactionLogs.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{row.date}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{row.trip}</div>
                </td>
                <td>
                  <strong>{row.item}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{row.itemSub}</div>
                </td>
                <td>
                  <span style={{ background: '#f0f9ff', color: '#025a9e', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>
                    {row.category}
                  </span>
                </td>
                <td style={{ whiteSpace: 'pre-line', fontSize: '0.75rem' }}>{row.payer}</td>
                <td>
                  <a href="#voucher" style={{ color: '#025a9e', fontWeight: 600, fontSize: '0.75rem' }}>
                    📄 {row.receipt}
                  </a>
                </td>
                <td>
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>
                    ● {row.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTripsPage;
