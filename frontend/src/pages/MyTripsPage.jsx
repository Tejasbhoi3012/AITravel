import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowRight,
  Receipt,
} from 'lucide-react';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  const archivedTrips = [
    {
      id: 'goa',
      tripNo: 'TRIP #IND-GOA-2026',
      title: 'Goa Coastal Odyssey',
      dates: 'Sep 14 – Sep 19, 2026 • 5 Days • 2 Travelers',
      total: '₹42,500',
      saved: 'Saved ₹7,500',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      overlay: 'HOTEL M VAGATOR + TRANSIT',
      costs: [
        { label: 'LODGING', val: '₹22,000' },
        { label: 'TRANSIT', val: '₹11,500' },
        { label: 'DINING', val: '₹6,200' },
        { label: 'LEISURE', val: '₹2,800' },
      ],
      vouchers: '14 Reconciled Vouchers',
    },
    {
      id: 'bali',
      tripNo: 'TRIP #IDN-DPS-2026',
      title: 'Bali Island Hopping',
      dates: 'Jun 02 – Jun 09, 2026 • 7 Days • Solo',
      total: '₹54,000',
      saved: 'Saved ₹9,800',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      overlay: 'SEMINYAK VILLA + SPEEDBOATS',
      costs: [
        { label: 'LODGING', val: '₹26,400' },
        { label: 'TRANSIT', val: '₹14,200' },
        { label: 'DINING', val: '₹8,900' },
        { label: 'LEISURE', val: '₹4,500' },
      ],
      vouchers: '16 Reconciled Vouchers',
    },
    {
      id: 'dubai',
      tripNo: 'TRIP #ARE-DXB-2026',
      title: 'Dubai Skyline & Desert',
      dates: 'Mar 10 – Mar 14, 2026 • 4 Days • 2 Travelers',
      total: '₹68,500',
      saved: 'Saved ₹11,200',
      img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
      overlay: 'DOWNTOWN RESIDENCES + SAFARI',
      costs: [
        { label: 'LODGING', val: '₹34,000' },
        { label: 'TRANSIT', val: '₹18,500' },
        { label: 'DINING', val: '₹10,500' },
        { label: 'LEISURE', val: '₹5,500' },
      ],
      vouchers: '10 Reconciled Vouchers',
    },
    {
      id: 'iceland',
      tripNo: 'TRIP #ISL-KEF-2025',
      title: 'Reykjavik Geothermal',
      dates: 'Nov 18 – Nov 24, 2025 • 6 Days • 2 Travelers',
      total: '₹65,000',
      saved: 'Saved ₹5,700',
      img: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
      overlay: 'RING ROAD 4X4 + HOT SPRINGS',
      costs: [
        { label: 'LODGING', val: '₹41,000' },
        { label: 'TRANSIT', val: '₹23,000' },
        { label: 'DINING', val: '₹14,000' },
        { label: 'LEISURE', val: '₹7,000' },
      ],
      vouchers: '8 Reconciled Vouchers',
    },
  ];

  const transactionLogs = [
    {
      date: '15 Sep 2026', trip: 'Goa Coastal Odyssey',
      item: 'W Goa • Luxury Sea View Suite', itemSub: 'Vagator Beach Road • 3 Nights Confirmation',
      category: 'Lodging', payer: 'AS', payerName: 'Aryan S.', receipt: '#VCHR-8841', status: 'Verified', amount: '₹22,000',
    },
    {
      date: '14 Sep 2026', trip: 'Goa Coastal Odyssey',
      item: 'Air India Express AI-582 (BOM → GOX)', itemSub: '2x Premium Economy Seats + Cabin Allowance',
      category: 'Transit', payer: 'RM', payerName: 'Rohan M.', receipt: '#TKT-7721', status: 'Verified', amount: '₹11,500',
    },
    {
      date: '16 Sep 2026', trip: 'Goa Coastal Odyssey',
      item: 'Thalassa Greek Taverna Siolim', itemSub: 'Sunset Dinner + Tasting Menu (Direct Pos Bill)',
      category: 'Dining', payer: 'RM', payerName: 'Rohan M.', receipt: '#INV-0302', status: 'Verified', amount: '₹6,500',
    },
    {
      date: '17 Sep 2026', trip: 'Goa Coastal Odyssey',
      item: 'Scuba Diving & Grand Island Catamaran', itemSub: 'Certified PADI Guide + Gear Rental Voucher',
      category: 'Activities', payer: 'AS', payerName: 'Aryan S.', receipt: '#ACT-1994', status: 'Verified', amount: '₹2,500',
    },
    {
      date: '05 Jun 2026', trip: 'Bali Island Hopping',
      item: 'Fast Boat Transfer Sanur → Nusa Penida', itemSub: 'Maruti Duta Express • VIP Return Ticket',
      category: 'Transit', payer: 'AS', payerName: 'Aryan S.', receipt: '#IDN-0912', status: 'Verified', amount: '₹3,800',
    },
  ];

  const filteredTxns = transactionLogs.filter((r) =>
    `${r.item} ${r.receipt} ${r.trip}`.toLowerCase().includes(searchTableQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="audited-statements-root audit-v2">
      {/* Header card */}
      <div className="audit-v2-header">
        <div>
          <div className="audit-v2-toplabel mono">
            FINANCIAL WAYPOINT &amp; TELEMETRY <span className="blue-dot" /> LEDGER VERIFIED [SHA-256]
          </div>
          <h1>Expense History &amp; Audited Trip Statements</h1>
          <p>Zero-discrepancy multi-currency reconciliations, itemized splits, and cryptographically verified fiscal records.</p>
        </div>
        <div className="audit-v2-headerright">
          <div className="currency-row">
            {[
              { k: 'INR', label: 'INR (₹)' },
              { k: 'USD', label: 'USD ($)' },
              { k: 'EUR', label: 'EUR (€)' },
            ].map((c) => (
              <button key={c.k} className={selectedCurrency === c.k ? 'active' : ''} onClick={() => setSelectedCurrency(c.k)}>
                {c.label}
              </button>
            ))}
            <button className="export-csv-btn" onClick={() => alert('Exporting CSV format...')}>
              <Download size={12} /> Export CSV
            </button>
          </div>
          <button className="share-pdf-btn" onClick={() => window.print()}>
            <FileText size={13} /> Share PDF Statement
          </button>
        </div>
      </div>

      {/* Generate + Distribution */}
      <div className="audit-v2-tworow">
        <div className="gen-card">
          <div className="gen-head">
            <span className="gen-title"><Receipt size={14} /> Generate &amp; Share Expense Statement</span>
            <span className="audit-ready-badge mono">● AUDIT READY</span>
          </div>
          <p className="gen-desc">Select parametric filters to compile an institutional-grade travel tax audit package with attached GST/VAT receipts.</p>
          <label className="gen-label mono">TARGET ROUTE &amp; ODYSSEY</label>
          <select className="gen-select">
            <option>Goa Coastal Odyssey • 5 Days (Sep 14 - Sep 19, 2026)</option>
            <option>Bali Island Hopping • 7 Days</option>
            <option>Dubai Skyline &amp; Desert • 4 Days</option>
          </select>
          <div className="gen-2col">
            <div>
              <label className="gen-label mono">RECONCILIATION RANGE</label>
              <input className="gen-select" defaultValue="14 Sep 2026 - 19 Sep 2026" />
            </div>
            <div>
              <label className="gen-label mono">ALLOCATION PROTOCOL</label>
              <select className="gen-select">
                <option>Equal 2-way split (Aryan &amp; Rohan)</option>
                <option>Equal 3-way split</option>
                <option>Primary payer settles all</option>
              </select>
            </div>
          </div>
          <div className="gen-foot">
            <span className="tax-note mono">◔ Tax Compliance: IN-GST Form 12A Equivalent</span>
            <button className="gen-pdf-btn" onClick={() => window.print()}>✎ Generate Audited PDF</button>
          </div>
        </div>

        <div className="dist-card">
          <div className="gen-head">
            <span className="gen-title">⛉ Instant Distribution Channels</span>
            <span className="dispatch-badge mono">v2.0.4 DISPATCH</span>
          </div>
          <p className="gen-desc">Broadcast validated statements to co-travelers, accountants, or corporate expense desks with zero manual formatting.</p>
          <button className="dist-row" onClick={() => window.print()}>
            <span className="dist-icon"><Download size={13} /></span>
            <span className="dist-text"><strong>Download PDF Package</strong><span>Includes 48 receipts • 2.8 MB</span></span>
            <ArrowRight size={15} />
          </button>
          <button className="dist-row" onClick={() => alert('Email composer opened...')}>
            <span className="dist-icon"><Mail size={13} /></span>
            <span className="dist-text"><strong>Email to Co-Travelers</strong><span>rohan.mehta@terminal.io + 1 attendee</span></span>
            <Send size={14} />
          </button>
          <button className="dist-row" onClick={handleCopy}>
            <span className="dist-icon green"><ExternalLink size={13} /></span>
            <span className="dist-text"><strong>Share via WhatsApp</strong><span>Instant breakdown card with UPI quick-link</span></span>
            <ExternalLink size={14} />
          </button>
          <div className="hash-row mono">
            <span>◈ sha256: 8f9b64c2e5a18442...d4e9</span>
            <button onClick={handleCopy}>{copiedLink ? <Check size={12} /> : <Copy size={12} />} {copiedLink ? 'Copied' : 'Copy Link'}</button>
          </div>
        </div>
      </div>

      {/* 4 stats */}
      <div className="audit-v2-stats">
        <div className="stat-card">
          <div className="stat-top"><span className="mono">LIFETIME TRAVEL SPEND</span><span>▤</span></div>
          <div className="stat-big">₹2,18,400</div>
          <div className="stat-sub">Across 4 completed multi-day journeys</div>
          <div className="stat-foot mono">Target Cap: ₹2,60,000 <span className="blue">84.0% utilized</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><span className="mono">TOTAL AI SAVINGS</span><span className="saved-badge mono">15.6% SAVED</span></div>
          <div className="stat-big green">₹34,200</div>
          <div className="stat-sub">Below planned dynamic budget ceilings</div>
          <div className="stat-foot mono">Algorithmic Yield <span className="green">• ₹8,550/trip</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><span className="mono">AVG. DAILY COST</span><span>⟳</span></div>
          <div className="stat-big">₹8,400 <span className="per-day">/ day</span></div>
          <div className="stat-sub">Weighted across 26 logged itinerary days</div>
          <div className="stat-foot mono">Median: ₹7,950 / day <span>Optimal Index</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><span className="mono">RECONCILED RECEIPTS</span><span className="green-dot" /></div>
          <div className="stat-big">48 / 48</div>
          <div className="stat-sub">100% verified tax invoices &amp; e-tickets</div>
          <div className="stat-foot mono">OCR Pipeline: Active <span className="green">0 Unassigned</span></div>
        </div>
      </div>

      {/* Archived */}
      <div className="archived-head">
        <div>
          <h3>Archived &amp; Active Itinerary Statements</h3>
          <p>Granular expenditure ledgers cross-referenced with multi-modal booking engines.</p>
        </div>
        <span className="years-pill">All Years (2025-2026)</span>
      </div>

      <div className="archived-grid">
        {archivedTrips.map((t) => (
          <div key={t.id} className="archived-card">
            <div className="arch-top">
              <span className="trip-no mono"><span className="blue">TRIP {t.tripNo.split('#')[1] ? '#' + t.tripNo.split('#')[1] : ''}</span> <span className="completed-badge">● COMPLETED</span></span>
              <span className="arch-amount"><strong>{t.total}</strong><span className="saved-green">{t.saved}</span></span>
            </div>
            <h4>{t.title}</h4>
            <span className="arch-dates">{t.dates}</span>
            <div className="arch-img-wrap">
              <img src={t.img} alt={t.title} loading="lazy" />
              <span className="arch-overlay mono">{t.overlay}</span>
            </div>
            <div className="arch-costs">
              {t.costs.map((c) => (
                <div key={c.label}><span className="mono">{c.label}</span><strong>{c.val}</strong></div>
              ))}
            </div>
            <div className="arch-foot">
              <span>{t.vouchers}</span>
              <button onClick={() => navigate(`/trip/${t.id}`)}>View Audit Sheet →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Split ledger */}
      <div className="split-ledger-v2">
        <div className="split-head">
          <strong>⛉ Active Trip Split Ledger &amp; Peer Reconciliation</strong>
          <span className="mono">AUTO-CALCULATED NET OFFSET</span>
        </div>
        <p className="split-sub">Selected context: <strong>Goa Coastal Odyssey</strong> (50/50 Dual Allocation Model)</p>
        <div className="split-4col">
          <div className="split-person">
            <div className="person-row"><span className="avatar black">AS</span><div><strong>Aryan Sharma</strong><span>Primary Cardholder</span></div></div>
            <div className="contrib mono">TOTAL CONTRIBUTED</div>
            <div className="contrib-val">₹24,500</div>
          </div>
          <div className="split-person">
            <div className="person-row"><span className="avatar blue">RM</span><div><strong>Rohan Mehta</strong><span>Co-Traveler</span></div></div>
            <div className="contrib mono">TOTAL CONTRIBUTED</div>
            <div className="contrib-val">₹18,000</div>
          </div>
          <div className="split-net">
            <div className="mono">NET BALANCE DIRECTION <span>→</span></div>
            <div className="net-text">Rohan owes Aryan</div>
            <div className="net-val">₹3,250</div>
            <div className="mono net-target">Equilibrium Target: ₹21,250 each</div>
          </div>
          <div className="split-settle">
            <span className="mono">⛉ <span className="rail-badge">INSTANT RAIL</span></span>
            <button className="settle-btn" onClick={() => alert('UPI settle link generated...')}>Settle via UPI / Bank ↗</button>
            <span className="settle-sub">Zero fee transfer via NPCI rail</span>
          </div>
        </div>
      </div>

      {/* Transaction ledger */}
      <div className="txn-card">
        <div className="txn-head">
          <div>
            <strong>⛉ Audited Transaction Ledger</strong>
            <p>Seven-tier itemization cross-validated against merchant MCC codes and GST vouchers.</p>
          </div>
          <div className="txn-filter">
            <input placeholder="Filter line items..." value={searchTableQuery} onChange={(e) => setSearchTableQuery(e.target.value)} />
            <Search size={13} />
          </div>
        </div>
        <table className="data-table-clean txn-table">
          <thead>
            <tr>
              <th>DATE &amp; TRIP</th>
              <th>EXPENSE ITEM</th>
              <th>CATEGORY</th>
              <th>PAYER</th>
              <th>RECEIPT VOUCHER</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxns.map((row, idx) => (
              <tr key={idx}>
                <td><strong>{row.date}</strong><div className="td-sub">{row.trip}</div></td>
                <td><strong>{row.item}</strong><div className="td-sub">{row.itemSub}</div></td>
                <td><span className="cat-pill">✦ {row.category}</span></td>
                <td><span className={`payer-avatar ${row.payer === 'AS' ? 'black' : 'blue'}`}>{row.payer}</span> {row.payerName}</td>
                <td><span className="receipt-link mono">◈ {row.receipt}</span></td>
                <td><span className="verified-pill">● Verified</span></td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="txn-foot mono">
          <span>◈ Ledger Hash: 0x03FA600C12E7BC822019AAEF</span>
          <span>Showing {filteredTxns.length} of 48 items <button>‹</button> <button className="active">1</button> <button>›</button></span>
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage;
