import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import {
  MapPin,
  Users,
  Calendar,
  IndianRupee,
  Sparkles,
  Zap,
  Globe,
  Star,
  Heart,
  MessageSquare,
  ArrowRight,
  Shield,
  Send,
  CheckCircle2,
  TrendingDown,
  Navigation,
} from 'lucide-react';
import AIChatDrawer from '../components/AIChatDrawer';

const HomePage = () => {
  const navigate = useNavigate();
  const { plannerState, updatePlannerField, generateTripPlan } = useTrip();

  // Widget state
  const [destination, setDestination] = useState('Goa, India');
  const [travelers, setTravelers] = useState(2);
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(50000);

  // Filter state for Trending Destinations
  const [activeRegion, setActiveRegion] = useState('All Regions');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Expense breakdown toggle
  const [expenseDuration, setExpenseDuration] = useState(5);
  const [expenseTravelers, setExpenseTravelers] = useState(2);

  // Chat copilot interactive demo state
  const [demoInput, setDemoInput] = useState('');
  const [demoChatHistory, setDemoChatHistory] = useState([
    {
      role: 'user',
      text: 'Plan 4 DAYS GOA TRIP for 2 people with beachside stays & vegetarian dining. Keep budget under ₹50,000.',
    },
    {
      role: 'ai',
      text: 'Here is a curated 4-Day North & South Goa split! Focused on tranquil Mandrem sunsets, heritage Fontainhas walks, and verified vegetarian cafes.',
      chips: ['📍 2 Core Hubs', '🥗 100% Veg Cafes', '🏨 Beachfront Villa', '💰 ₹42,500 Total Est.'],
      day1: 'Day 1: Arrival & Mandrem Sunset • 10:00 AM: Check-in at Dunes Sea Breeze • 01:30 PM: Lunch at Bean Me Up (100% Organic Vegan)...',
    },
  ]);

  const handleStartPlanning = (dest = null) => {
    const selectedDest = dest || destination;
    updatePlannerField('destination', selectedDest);
    updatePlannerField('travelers', { count: travelers, type: travelers === 1 ? 'Solo' : travelers === 2 ? 'Couple' : 'Group' });
    updatePlannerField('duration', duration);
    updatePlannerField('budget', budget);
    updatePlannerField('currency', 'INR');
    navigate('/plan');
  };

  const handleQuickDestinationSelect = (destName) => {
    setDestination(destName);
    updatePlannerField('destination', destName);
  };

  const handleSendDemoMessage = (e) => {
    e?.preventDefault();
    if (!demoInput.trim()) return;

    const userText = demoInput;
    setDemoChatHistory((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'ai',
        text: `Understood! Updating your itinerary for "${userText}". Adding verified recommendations with instant Google Maps routing.`,
        chips: ['⚡ Updated Route', '📍 Verified Coordinates', '✨ Optimized Budget'],
      },
    ]);
    setDemoInput('');
  };

  const trendingDestinations = [
    {
      name: 'Goa',
      country: 'INDIA',
      rating: '4.9',
      topPick: true,
      desc: 'Sun-kissed beaches, heritage Portuguese villas, sunset coastal dining...',
      cost: '₹34,500',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      category: 'Tropical',
    },
    {
      name: 'Bali',
      country: 'INDONESIA',
      rating: '4.8',
      desc: 'Lush terraced valley retreats, sacred cliffside temples, and beach clubs...',
      cost: '₹54,000',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      category: 'Tropical',
    },
    {
      name: 'Dubai',
      country: 'UAE',
      rating: '4.9',
      desc: 'Modern desert safari glamping, hyper-luxury shopping, and architecture...',
      cost: '₹68,500',
      img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
      category: 'Cultural',
    },
    {
      name: 'Paris',
      country: 'FRANCE',
      rating: '4.9',
      desc: 'Artisan bakeries, world-class gallery walks, Seine cruise dinners...',
      cost: '₹85,000',
      img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      category: 'Cultural',
    },
    {
      name: 'London',
      country: 'UK',
      rating: '4.7',
      desc: 'Regal landscape walking tours, Michelin gastronomy, West End shows...',
      cost: '₹92,000',
      img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
      category: 'Cultural',
    },
  ];

  const filteredHotspots = trendingDestinations.filter((d) => {
    if (activeRegion === 'All Regions') return true;
    return d.category === activeRegion;
  });

  return (
    <div className="home-page-root">
      {/* ===================================================================
          HERO SECTION
          =================================================================== */}
      <section className="hero-container">
        <div className="hero-pill-badge blue-style">
          <span>✦ HYPER-EFFICIENT TRAVEL INTELLIGENCE 2.0 ✦</span>
        </div>

        <h1 className="hero-main-title">
          Plan Your Perfect Trip With <span className="hero-title-ai">AI</span>{' '}
          <span className="hero-title-precision">Precision</span>
        </h1>

        <p className="hero-subtext">
          Discover amazing destinations, build personalized hour-by-hour itineraries, find secret boutique stays, and forecast travel budgets down to the rupee.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={() => handleStartPlanning()}>
            <Zap size={16} />
            <span>Plan My Trip</span>
          </button>
          <button className="btn-hero-secondary" onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <Globe size={16} />
            <span>Explore Destinations</span>
          </button>
        </div>

        {/* ===================================================================
            FLOATING SEARCH / FILTER WIDGET
            =================================================================== */}
        <div className="hero-widget-card">
          {/* Field 1: Destination */}
          <div className="widget-field-box">
            <div className="widget-label-row">
              <MapPin size={12} className="widget-icon" />
              <span>Destination</span>
            </div>
            <input
              type="text"
              className="widget-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Goa, India"
            />
            <div className="widget-tags-row">
              {['Goa', 'Bali', 'Dubai', 'Paris', 'Tokyo'].map((tag) => (
                <span
                  key={tag}
                  className="widget-tag-chip"
                  onClick={() => handleQuickDestinationSelect(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Field 2: Travelers */}
          <div className="widget-field-box">
            <div className="widget-label-row">
              <Users size={12} className="widget-icon" />
              <span>Travelers</span>
            </div>
            <select
              className="widget-select"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            >
              <option value={1}>1 Traveler (Solo)</option>
              <option value={2}>2 Travelers ▾</option>
              <option value={4}>4 Travelers (Group)</option>
              <option value={6}>6+ Travelers</option>
            </select>
            <div className="widget-subtext">
              {travelers === 2 ? 'Suitable for couples' : travelers === 1 ? 'Solo explorer' : 'Group travel'}
            </div>
          </div>

          {/* Field 3: Duration */}
          <div className="widget-field-box">
            <div className="widget-label-row">
              <Calendar size={12} className="widget-icon" />
              <span>Duration</span>
            </div>
            <select
              className="widget-select"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={3}>3 Days (Weekend) ▾</option>
              <option value={5}>5 Days (Quick) ▾</option>
              <option value={7}>7 Days (Classic) ▾</option>
              <option value={10}>10 Days (Deep Dive) ▾</option>
            </select>
            <div className="widget-subtext">Recommended pace</div>
          </div>

          {/* Field 4: Est. Budget */}
          <div className="widget-field-box">
            <div className="widget-label-row">
              <IndianRupee size={12} className="widget-icon" />
              <span>Est. Total Budget</span>
            </div>
            <div className="widget-budget-wrapper">
              <input
                type="text"
                className="widget-input"
                value={`₹${budget.toLocaleString()}`}
                onChange={(e) => {
                  const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 10000;
                  setBudget(val);
                }}
              />
              <span className="widget-custom-badge">₹ Custom</span>
            </div>
            <div className="widget-subtext">
              ~₹{Math.round(budget / (travelers || 1)).toLocaleString()} / person
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button className="btn-widget-submit" onClick={() => handleStartPlanning()}>
              <Sparkles size={16} />
              <span>Start Planning</span>
            </button>
          </div>
        </div>

        {/* Social Proof Row */}
        <div className="hero-social-proof">
          <span>
            <Star size={14} className="star-yellow" fill="#f59e0b" />
            <strong>4.9/5</strong> Average Rating
          </span>
          <span>•</span>
          <span>
            <Globe size={14} />
            <strong>85</strong> Global Countries
          </span>
          <span>•</span>
          <span>
            <Zap size={14} color="#025a9e" />
            <strong>Instant Generation</strong> (&lt;15s)
          </span>
        </div>
      </section>

      {/* ===================================================================
          CURATED HOTSPOTS / TRENDING DESTINATIONS
          =================================================================== */}
      <section className="section-wrapper" id="trending-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div className="section-top-label">✦ CURATED HOTSPOTS</div>
          <button className="btn-ask-travelai-float" onClick={() => setIsAIChatOpen(true)}>
            <MessageSquare size={14} />
            <span>Ask TravelAI ▾</span>
          </button>
        </div>

        <div className="section-header-row">
          <div>
            <h2 className="section-headline">Trending Destinations This Season</h2>
            <p className="section-subtitle-text">
              Only approved destinations with live search/light routes, vetted experiences/curated stays, and vetted hospitality partners.
            </p>
          </div>

          <div className="filter-pills-group">
            {['All Regions', 'Tropical', 'Cultural'].map((reg) => (
              <button
                key={reg}
                className={`filter-pill-btn ${activeRegion === reg ? 'active' : ''}`}
                onClick={() => setActiveRegion(reg)}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Cards Row */}
        <div className="destinations-5grid">
          {filteredHotspots.map((item) => (
            <div key={item.name} className="dest-clean-card">
              <div className="dest-card-img-wrap">
                <img src={item.img} alt={item.name} loading="lazy" />
                {item.topPick && <span className="dest-top-pick-badge">TOP PICK</span>}
                <span className="dest-rating-pill">
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  {item.rating}
                </span>
                <button className="dest-fav-btn" title="Save destination">
                  <Heart size={13} />
                </button>
              </div>

              <div className="dest-card-content">
                <div className="dest-title-row">
                  <span className="dest-name-title">{item.name}</span>
                  <span className="dest-country-label">{item.country}</span>
                </div>

                <p className="dest-card-desc">{item.desc}</p>

                <div className="dest-card-bottom-row">
                  <div className="dest-cost-info">
                    <span className="dest-cost-label">Avg. Cost</span>
                    <span className="dest-cost-val">{item.cost}/person</span>
                  </div>
                  <button
                    className="dest-btn-explore"
                    onClick={() => handleStartPlanning(item.name)}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          INTELLIGENT WORKFLOW ("How TravelAI Engineers Your Trip")
          =================================================================== */}
      <section className="workflow-section-container">
        <div className="hero-pill-badge blue-style" style={{ marginBottom: 12 }}>
          <span>INTELLIGENT WORKFLOW</span>
        </div>
        <h2 className="section-headline">How TravelAI Engineers Your Trip</h2>
        <p className="section-subtitle-text" style={{ margin: '6px auto 0', textAlign: 'center' }}>
          From vague wanderlust to a synchronized, reservation-ready master schedule in under thirty seconds.
        </p>

        <div className="workflow-cards-grid">
          {/* Card 01 */}
          <div className="workflow-card">
            <div className="workflow-num-box">01</div>
            <h3>Choose Destination</h3>
            <p>
              Type any city, state, or region. Our engine cross-references real-time climatic data, local flight corridors, and season pricing trends.
            </p>
            <div className="workflow-feature-pill">
              <Zap size={16} className="workflow-pill-icon" />
              <div>
                <span className="workflow-pill-title">Dynamic Routing</span>
                <span className="workflow-pill-sub">Real-world transit estimation</span>
              </div>
            </div>
          </div>

          {/* Card 02 */}
          <div className="workflow-card">
            <div className="workflow-num-box">02</div>
            <h3>Customize Preferences</h3>
            <p>
              Set your party profile, dietary limits (vegan, halal, etc.), budget threshold, and pacing funds relating your travel or fast paced ventures.
            </p>
            <div className="workflow-feature-pill">
              <Sparkles size={16} className="workflow-pill-icon" />
              <div>
                <span className="workflow-pill-title">Hyper-Personalized</span>
                <span className="workflow-pill-sub">Built for your exact party</span>
              </div>
            </div>
          </div>

          {/* Card 03 */}
          <div className="workflow-card">
            <div className="workflow-num-box">03</div>
            <h3>Get Your AI Plan</h3>
            <p>
              Instantly unlock day-by-day itineraries with opening hours, multi-modal schedules, offline-ready export, and automated expense trackers.
            </p>
            <div className="workflow-feature-pill">
              <CheckCircle2 size={16} className="workflow-pill-icon" />
              <div>
                <span className="workflow-pill-title">Ready to Export</span>
                <span className="workflow-pill-sub">Sync to Google Calendar &amp; Apple Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CONVERSATIONAL COPILOT (TALK TO YOUR AI CONCIERGE)
          =================================================================== */}
      <section className="section-wrapper">
        <div className="copilot-grid-layout">
          {/* Left Column */}
          <div>
            <div className="section-top-label">✦ CONVERSATIONAL COPILOT</div>
            <h2 className="section-headline">Talk to Your AI Travel Concierge</h2>
            <p className="section-subtitle-text" style={{ margin: '8px 0 28px' }}>
              Tell TravelAI your constraints in natural language. Change plans mid-trip, discover hidden culinary gems, or split costs on the fly.
            </p>

            <div className="copilot-feature-item">
              <div className="copilot-feature-num">1</div>
              <div>
                <h4>Strict Dietary Matching</h4>
                <p>Never wonder if a restaurant has pure vegetarian, gluten-free, or authentic delicacies.</p>
              </div>
            </div>

            <div className="copilot-feature-item">
              <div className="copilot-feature-num">2</div>
              <div>
                <h4>Dynamic Re-Routing</h4>
                <p>Rained out? TravelAI reflows routes and indoor pivots without ceremony.</p>
              </div>
            </div>

            <button
              className="btn-copilot-demo"
              onClick={() => {
                setDemoInput('Find a quiet cafe near Calangute with sunset views');
              }}
            >
              <Zap size={14} />
              <span>Test with Demo Query</span>
            </button>
          </div>

          {/* Right Column: Interactive Chat Mockup Window */}
          <div className="chat-mockup-card">
            <div className="chat-mockup-header">
              <div className="chat-mockup-header-left">
                <div className="brand-logo-icon" style={{ width: 22, height: 22 }}>
                  <Sparkles size={12} />
                </div>
                <span>TravelAI Assistant</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                  Hybrid Model: Gemini Pro + Places API
                </span>
              </div>
              <span className="chat-mockup-latency">Latency: 180ms</span>
            </div>

            <div className="chat-mockup-body">
              {demoChatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={msg.role === 'user' ? 'mockup-user-msg' : 'mockup-ai-msg'}
                >
                  <p>{msg.text}</p>
                  {msg.chips && (
                    <div className="ai-chips-preview-row">
                      {msg.chips.map((c, i) => (
                        <span key={i} className="ai-chip-pill">{c}</span>
                      ))}
                    </div>
                  )}
                  {msg.day1 && (
                    <div className="ai-itinerary-snippet">
                      {msg.day1}
                    </div>
                  )}
                  {msg.role === 'ai' && index === 1 && (
                    <div className="ai-quick-actions-row">
                      <button className="ai-action-chip-btn" onClick={() => handleStartPlanning('Goa')}>
                        📄 VIEW FULL ITINERARY
                      </button>
                      <button className="ai-action-chip-btn" onClick={() => handleStartPlanning('Goa')}>
                        💰 ADJUST EXPENSES
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendDemoMessage} className="chat-mockup-input-bar">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask TravelAI to modify routes or add stops..."
              />
              <button type="submit" className="btn-chat-send">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===================================================================
          DYNAMIC EXPENSE BREAKDOWN
          =================================================================== */}
      <section className="section-wrapper">
        <div className="section-top-label">✦ TRANSPARENT BUDGET ENGINE</div>
        <div className="section-header-row">
          <div>
            <h2 className="section-headline">Dynamic Expense Breakdown</h2>
            <p className="section-subtitle-text">
              See how group size and duration adjust real-time expenses in real-time. Never get surprised by hidden taxes.
            </p>
          </div>

          <div className="filter-pills-group">
            <button
              className={`filter-pill-btn ${expenseDuration === 5 ? 'active' : ''}`}
              onClick={() => setExpenseDuration(5)}
            >
              Standard (5 Days)
            </button>
            <button
              className={`filter-pill-btn ${expenseDuration === 7 ? 'active' : ''}`}
              onClick={() => setExpenseDuration(7)}
            >
              Premium (7 Days)
            </button>
          </div>
        </div>

        <div className="expense-showcase-grid">
          {/* Left Card: Total Estimate */}
          <div className="expense-total-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Est. Itinerary Total</span>
              <span className="expense-badge-under">10% UNDER BUDGET</span>
            </div>

            <div className="expense-huge-number">
              ₹{expenseDuration === 5 ? '42,500' : '58,200'}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Estimated total with all taxes for whole party for entire {expenseDuration}-day stay.
            </p>

            <div className="expense-buffer-box">
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Predictive Buffer Added / <span style={{ color: '#16a34a' }}>Included</span>
              </div>
              Includes auto-estimated surge margin for peak season taxi fares and festival entry fees.
            </div>
          </div>

          {/* Right Card: Cost Allocation by Vertical */}
          <div className="expense-allocation-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Cost Allocation by Vertical
              </span>
            </div>

            {/* Multi-segment progress bar */}
            <div className="multi-seg-bar">
              <div className="seg-hotel" title="Stays 43%" />
              <div className="seg-flight" title="Flights & Rail 29%" />
              <div className="seg-food" title="Food & Dining 14%" />
              <div className="seg-activity" title="Curated Activities 10%" />
              <div className="seg-cab" title="Cabs & Scooters 4%" />
              <div className="seg-surge" title="Surge & Buffer 3%" />
            </div>

            <div className="expense-verticals-grid">
              <div className="vertical-item-box">
                <span className="vertical-label">🏨 Stays &amp; Stays</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '18,500' : '25,000'}{' '}
                  <span className="vertical-percent">43%</span>
                </div>
              </div>

              <div className="vertical-item-box">
                <span className="vertical-label">✈️ Flights &amp; Rail</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '12,200' : '16,500'}{' '}
                  <span className="vertical-percent">29%</span>
                </div>
              </div>

              <div className="vertical-item-box">
                <span className="vertical-label">🍽️ Food &amp; Dining</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '6,000' : '8,400'}{' '}
                  <span className="vertical-percent">14%</span>
                </div>
              </div>

              <div className="vertical-item-box">
                <span className="vertical-label">🎟️ Curated Activities</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '4,000' : '5,500'}{' '}
                  <span className="vertical-percent">10%</span>
                </div>
              </div>

              <div className="vertical-item-box">
                <span className="vertical-label">🚕 Cabs &amp; Scooters</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '1,800' : '2,400'}{' '}
                  <span className="vertical-percent">4%</span>
                </div>
              </div>

              <div className="vertical-item-box">
                <span className="vertical-label">🛡️ Surge &amp; Buffer</span>
                <div className="vertical-amount">
                  ₹{expenseDuration === 5 ? '1,500' : '2,000'}{' '}
                  <span className="vertical-percent">3%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>*Calculated with real-time hotel API rates and typical seasonal restaurant spend in Goa.</span>
              <a href="#tax" style={{ color: '#025a9e', fontWeight: 700 }}>Download Exact Tax Breakdown →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          TESTIMONIALS (TRUSTED BY 250,000+ MODERN TRAVELERS)
          =================================================================== */}
      <section className="testimonials-section">
        <div className="rating-stars-row">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={18} fill="#f59e0b" color="#f59e0b" />
          ))}
        </div>

        <h2 className="section-headline">
          Trusted by <span style={{ color: '#025a9e' }}>250,000+</span> Modern Travelers
        </h2>
        <p className="section-subtitle-text" style={{ margin: '6px auto 0', textAlign: 'center' }}>
          Generated across 85 countries with a 4.9/5 satisfaction rating. Here is what real explorers say about their AI trips.
        </p>

        <div className="testimonials-grid">
          {/* Review 1 */}
          <div className="testimonial-card">
            <div className="rating-stars-row" style={{ justifyContent: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-quote">
              "We planned our 5-day honeymoon in Bali using TravelAI. It routed our scooter trips between Ubud and Uluwatu. Honestly saved us when we caught heavy rain during early noon safari."
            </p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials">AS</div>
              <div>
                <div className="author-name">Ananya Sharma</div>
                <div className="author-role">Frequent Solo &amp; Couple Traveler</div>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="testimonial-card">
            <div className="rating-stars-row" style={{ justifyContent: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-quote">
              "The budget forecast was scary accurate. It predicted ₹48,000 for our South Goa trip and we ended up spending ₹47,600! The vegetarian restaurant recommendations were top tier."
            </p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials" style={{ background: '#fef3c7', color: '#d97706' }}>RM</div>
              <div>
                <div className="author-name">Rohan Mehta</div>
                <div className="author-role">Tech Lead &amp; Weekend Roadtripper</div>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="testimonial-card">
            <div className="rating-stars-row" style={{ justifyContent: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-quote">
              "I used to spend 15 hours scrolling TripAdvisor and 20 browser tabs for Rome. TravelAI generated an art-lover's dream itinerary with skip-the-line museum slots in literally 30 seconds."
            </p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials" style={{ background: '#ede9fe', color: '#7c3aed' }}>CL</div>
              <div>
                <div className="author-name">Claire Laurent</div>
                <div className="author-role">Freelance Brand Strategist, Lyon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CALL TO ACTION BANNER (BOTTOM HERO CARD)
          =================================================================== */}
      <section className="cta-banner-wrapper">
        <div className="cta-banner-card">
          <div className="cta-badge">
            <span>ZERO COMMITMENT • INSTANT ACCESS</span>
          </div>

          <h2>Your Next Sanctioned Journey Awaits</h2>
          <p>
            Join thousands of smart travelers who let TravelAI eliminate the headache of planning, budgeting, and scheduling.
          </p>

          <div className="cta-actions-row">
            <button className="btn-cta-gold" onClick={() => handleStartPlanning()}>
              ⚡ Build Itinerary Now
            </button>
            <button className="btn-cta-outline" onClick={() => handleStartPlanning('Paris')}>
              View Sample Plan
            </button>
          </div>
        </div>
      </section>

      {/* Floating AI Chat Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        trip={{
          destination: 'Goa',
          duration: 5,
          budget: 50000,
          currency: 'INR',
          travelers: { count: 2, type: 'Couple' },
        }}
      />
    </div>
  );
};

export default HomePage;
