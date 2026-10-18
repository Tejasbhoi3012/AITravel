import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import {
  Minus,
  Plus,
  Calendar,
  Zap,
  Star,
  Send,
} from 'lucide-react';
import DestinationAutosuggest from '../components/DestinationAutosuggest';
import AIChatDrawer from '../components/AIChatDrawer';

const HomePage = () => {
  const navigate = useNavigate();
  const { updatePlannerField } = useTrip();

  // Widget state
  const [destination, setDestination] = useState('Goa, India');
  const [travelers, setTravelers] = useState(2);
  const [duration, setDuration] = useState(5);
  const [budget] = useState(50000);

  // Filter state for Trending Destinations
  const [activeRegion, setActiveRegion] = useState('All Regions');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Expense breakdown toggle
  const [expenseDuration, setExpenseDuration] = useState(5);

  // Chat copilot interactive demo state
  const [demoInput, setDemoInput] = useState('');
  const [demoChatHistory, setDemoChatHistory] = useState([
    {
      role: 'user',
      text: 'Find a quiet sunset cafe in South Goa with vegan dessert under ₹800.',
    },
    {
      role: 'ai',
      text: 'Found 2 high-matching spots along Palolem & Agonda with undisturbed ocean views and plant-based pastry kitchens:',
      spots: [
        { name: "Clara's Palolem", time: '1930', rating: '4.8' },
        { name: 'DROPADI Agonda', time: '1730', rating: '4.9' },
      ],
      slot: 'Scheduled slot: 17:30 - 19:15 IST',
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
    updatePlannerField('destinationDetails', null);
  };

  const handleHomeDestinationChange = (value) => {
    setDestination(value);
    updatePlannerField('destination', value);
    updatePlannerField('destinationDetails', null);
  };

  const handleSelectHomeSuggestion = (place) => {
    const label = place.country ? `${place.name}, ${place.country}` : place.name;
    setDestination(label);
    updatePlannerField('destination', label);
    updatePlannerField('destinationDetails', {
      name: place.name,
      country: place.country,
      placeId: place.placeId,
      latitude: place.latitude,
      longitude: place.longitude,
    });
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
        text: 'Found 2 high-matching spots along Palolem & Agonda with undisturbed ocean views and plant-based pastry kitchens:',
        spots: [
          { name: "Clara's Palolem", time: '1930', rating: '4.8' },
          { name: 'DROPADI Agonda', time: '1730', rating: '4.9' },
        ],
        slot: 'Scheduled slot: 17:30 - 19:15 IST',
      },
    ]);
    setDemoInput('');
  };

  const trendingDestinations = [
    {
      name: 'Goa, IN',
      rating: '4.9',
      desc: 'Golden shoreline hideaways, heritage Portuguese villas, and...',
      cost: '₹34,500',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      category: 'Tropical',
    },
    {
      name: 'Bali, ID',
      rating: '4.8',
      desc: 'Cliffside sanctuaries in Uluwatu, lush inland artisan jungle...',
      cost: '₹54,000',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      category: 'Tropical',
    },
    {
      name: 'Dubai, AE',
      rating: '4.9',
      desc: 'Hyper-modern architecture, desert luxury camps, and...',
      cost: '₹65,500',
      img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
      category: 'Cultural',
    },
    {
      name: 'Paris, FR',
      rating: '4.9',
      desc: 'Boutique galleries in Le Marais, curated wine bistros, and historic',
      cost: '₹85,000',
      img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      category: 'Cultural',
    },
    {
      name: 'London, UK',
      rating: '4.9',
      desc: 'Historic private clubs, iconic brutalist theatre districts, and...',
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
      {/* ================= HERO ================= */}
      <section className="hero-container">
        <div className="hero-pill-badge">
          <span className="dot" />
          <span>HYPER-EFFICIENT TRAVEL INTELLIGENCE 2.0</span>
          <span className="dot" />
        </div>

        <h1 className="hero-main-title">
          Plan Your Perfect Trip With <span className="hero-title-ai">AI</span>
          <span className="hero-title-precision">Precision</span>
        </h1>

        <p className="hero-subtext">
          Discover amazing destinations, build personalized hour-by-hour itineraries, find
          secret boutique stays, and forecast travel budgets down to the rupee.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={() => handleStartPlanning()}>
            <Zap size={13} />
            <span>Plan My Trip</span>
          </button>
          <button
            className="btn-hero-secondary"
            onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>Explore Destinations</span>
          </button>
        </div>

        {/* Search widget */}
        <div className="hero-widget-card">
          <div className="widget-field-box">
            <div className="widget-label-row"><span>DESTINATION</span></div>
            <DestinationAutosuggest
              value={destination}
              onChange={handleHomeDestinationChange}
              onSelect={handleSelectHomeSuggestion}
              placeholder="Goa, India"
              iconSize={13}
              iconClass="widget-icon"
              wrapClass="widget-dest-input-wrap"
              boxClass="widget-dest-input"
              inputClass="widget-input"
            />
            <div className="widget-tags-row">
              {['Goa', 'Bali', 'Dubai', 'Paris'].map((tag) => (
                <span key={tag} className="widget-tag-chip" onClick={() => handleQuickDestinationSelect(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="widget-field-box">
            <div className="widget-label-row"><span>TRAVELERS</span></div>
            <div className="widget-stepper-row">
              <div>
                <div className="widget-main-val"><span className="mini-icon">👥</span> {travelers} Travelers</div>
                <div className="widget-subtext">Couples / Solo / Group</div>
              </div>
              <div className="widget-step-btns">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))}><Minus size={11} /></button>
                <button onClick={() => setTravelers(Math.min(12, travelers + 1))}><Plus size={11} /></button>
              </div>
            </div>
          </div>

          <div className="widget-field-box">
            <div className="widget-label-row"><span>DURATION</span></div>
            <div className="widget-stepper-row">
              <div>
                <div className="widget-main-val"><Calendar size={12} className="widget-icon" /> {duration} Days</div>
                <div className="widget-subtext">Flexible window</div>
              </div>
              <div className="widget-step-btns">
                <button onClick={() => setDuration(Math.max(1, duration - 1))}><Minus size={11} /></button>
                <button onClick={() => setDuration(Math.min(30, duration + 1))}><Plus size={11} /></button>
              </div>
            </div>
          </div>

          <div className="widget-field-box">
            <div className="widget-label-row">
              <span>EST. BUDGET</span>
              <span className="widget-custom-badge">✦ Custom</span>
            </div>
            <div className="widget-main-val">₹{budget.toLocaleString('en-IN')}</div>
            <div className="widget-subtext">~₹{Math.round(budget / (travelers || 1)).toLocaleString('en-IN')} / person</div>
          </div>

          <div>
            <button className="btn-widget-submit" onClick={() => handleStartPlanning()}>
              <span className="submit-main">Start Planning →</span>
              <span className="submit-sub">● AUTO-SYNTHESIZING</span>
            </button>
          </div>
        </div>

        <div className="hero-social-proof">
          <div className="proof-pill">
            <span><Star size={11} fill="#f59e0b" color="#f59e0b" /> <strong>4.9/5 Average Rating</strong></span>
            <span className="sep">|</span>
            <span><strong>85</strong> Global Countries</span>
            <span className="sep">|</span>
            <span><span className="green-dot" /> <strong>Instant Generation</strong> (&lt;15s)</span>
          </div>
        </div>
      </section>

      {/* ================= TRENDING ================= */}
      <section className="section-wrapper" id="trending-section">
        <div className="section-top-row">
          <div>
            <div className="section-top-label">◉ CURATED HOTSPOTS</div>
            <h2 className="section-headline">Trending Destinations This Season</h2>
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
            <button className="btn-ask-travelai-float" onClick={() => setIsAIChatOpen(true)}>
              <span>✦ Ask TravelAI</span>
            </button>
          </div>
        </div>

        <div className="destinations-5grid">
          {filteredHotspots.map((item) => (
            <div key={item.name} className="dest-clean-card">
              <div className="dest-card-img-wrap">
                <img src={item.img} alt={item.name} loading="lazy" />
                <span className="dest-top-pick-badge">TOP PICK</span>
                <span className="dest-rating-pill">★ {item.rating}</span>
              </div>
              <div className="dest-card-content">
                <div className="dest-name-title">{item.name}</div>
                <p className="dest-card-desc">{item.desc}</p>
                <div className="dest-card-bottom-row">
                  <div className="dest-cost-info">
                    <span className="dest-cost-label">AVG. COST</span>
                    <span className="dest-cost-val">{item.cost} <span className="per">ⓘ</span></span>
                  </div>
                  <button className="dest-btn-explore" onClick={() => handleStartPlanning(item.name.split(',')[0])}>
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section className="section-wrapper workflow-center">
        <div className="hero-pill-badge small"><span className="dot blue" /> INTELLIGENT WORKFLOW</div>
        <h2 className="section-headline centered">How TravelAI Engineers Your Trip</h2>

        <div className="workflow-cards-grid">
          <div className="workflow-card">
            <div className="workflow-top-row"><span className="workflow-num">01</span><span className="workflow-icon-box">◇</span></div>
            <h3>Choose Destination</h3>
            <p>Input broad concepts or pinpoint coordinates. Our vector discovery engine sorts through millions of regional data points to isolate ideal micro-seasons and secret locations.</p>
            <span className="workflow-code-pill blue">●Vector Geospatial API</span>
          </div>
          <div className="workflow-card">
            <div className="workflow-top-row"><span className="workflow-num">02</span><span className="workflow-icon-box">☰</span></div>
            <h3>Customize Preferences</h3>
            <p>Set rigid parameters. Jain dining, vegan requirements, boutique stay tiers, slow pacing, or packed high-adrenaline schedules. The engine conforms to your exact lifestyle.</p>
            <span className="workflow-code-pill gray">●Constraint Solver v4</span>
          </div>
          <div className="workflow-card">
            <div className="workflow-top-row"><span className="workflow-num">03</span><span className="workflow-icon-box"><Zap size={13} /></span></div>
            <h3>Get Your AI Plan</h3>
            <p>Receive an actionable, hour-by-hour itinerary with integrated dynamic expense forecasting, transport transit times, and one-tap reservation synchronization.</p>
            <span className="workflow-code-pill green">●15s Synthesis</span>
          </div>
        </div>
      </section>

      {/* ================= COPILOT ================= */}
      <section className="section-wrapper">
        <div className="copilot-grid-layout">
          <div>
            <div className="section-top-label">◉ NEURAL ASSISTANT</div>
            <h2 className="section-headline">Talk to Your AI Travel Concierge</h2>
            <p className="section-subtitle-text">
              Unlike static travel blogs, our hybrid conversational engine maintains context of your budget, pacing, and dietary restrictions to make live micro-adjustments on the fly.
            </p>

            <div className="copilot-feature-item">
              <span className="copilot-feature-num">01.</span>
              <div>
                <h4>Strict Dietary Matching</h4>
                <p>Cross-references restaurant health logs for verified Jain, Halal, Kosher, and vegan preparation tables.</p>
              </div>
            </div>

            <div className="copilot-feature-item">
              <span className="copilot-feature-num">02.</span>
              <div>
                <h4>Dynamic Re-Routing</h4>
                <p>Sudden monsoon downpour or peak highway congestion triggers seamless indoor alternatives in under 2 seconds.</p>
              </div>
            </div>

            <button className="btn-copilot-demo" onClick={() => setDemoInput('Find a quiet cafe near Palolem with sunset views')}>
              <span>✎ Test with Demo Query</span>
            </button>
          </div>

          <div className="chat-mockup-card">
            <div className="chat-mockup-header">
              <span className="chat-dot" /> <strong>TravelAI Assistant</strong>
              <span className="chat-model">Gemini Pro + Places API</span>
              <span className="chat-mockup-latency"><span className="green-dot" /> Latency: 180ms</span>
            </div>

            <div className="chat-mockup-body">
              {demoChatHistory.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? 'mockup-user-msg' : 'mockup-ai-msg'}>
                  {msg.role === 'user' && <span className="me-badge">ME</span>}
                  {msg.role === 'ai' && <span className="ai-badge">AI</span>}
                  <p>{msg.text}</p>
                  {msg.spots && (
                    <div className="ai-spots">
                      {msg.spots.map((s) => (
                        <div key={s.name} className="ai-spot-row">
                          <span>{s.name}</span><span className="spot-meta">{s.time} • ★{s.rating}</span>
                        </div>
                      ))}
                      <div className="ai-slot-row"><span>◷ {msg.slot}</span><span className="preview-link">Preview Map ›</span></div>
                    </div>
                  )}
                  {msg.role === 'ai' && (
                    <div className="ai-quick-actions-row">
                      <button className="ai-action-chip-btn dark" onClick={() => handleStartPlanning('Goa')}>VIEW FULL ITINERARY</button>
                      <button className="ai-action-chip-btn" onClick={() => handleStartPlanning('Goa')}>ADJUST EXPENSES</button>
                    </div>
                  )}
                  {msg.role === 'ai' && <div className="ai-syn-note">●●● Synthesizing real-time seat availability</div>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendDemoMessage} className="chat-mockup-input-bar">
              <span className="input-mic">✦</span>
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask TravelAI anything about your trip..."
              />
              <button type="submit" className="btn-chat-send"><Send size={13} /></button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= EXPENSE ================= */}
      <section className="section-wrapper">
        <div className="section-top-row">
          <div>
            <div className="section-top-label">◉ TRANSPARENT BUDGET ENGINE</div>
            <h2 className="section-headline">Dynamic Expense Breakdown</h2>
          </div>
          <div className="filter-pills-group">
            <button className={`filter-pill-btn dark ${expenseDuration === 5 ? 'active' : ''}`} onClick={() => setExpenseDuration(5)}>Standard 5 Days</button>
            <button className={`filter-pill-btn ${expenseDuration === 7 ? 'active' : ''}`} onClick={() => setExpenseDuration(7)}>Premium 7 Days</button>
          </div>
        </div>

        <div className="expense-showcase-grid">
          <div className="expense-total-card">
            <div className="expense-top-row">
              <span className="expense-label">EST. ITINERARY TOTAL</span>
              <span className="expense-badge-under">10% UNDER BUDGET</span>
            </div>
            <div className="expense-huge-number">₹{expenseDuration === 5 ? '42,500' : '58,200'}</div>
            <p className="expense-desc">Includes pre-negotiated villa lodging, flights, verified restaurants, dynamic ground transit, and all sightseeing access tickets.</p>
            <div className="expense-buffer-box">
              <div className="buffer-title">◉ Buffer Retained</div>
              <p>₹7,500 safely retained in contingency reserve based on seasonal weather probabilities.</p>
            </div>
          </div>

          <div className="expense-allocation-card">
            <div className="expense-top-row">
              <span className="expense-title">Cost Allocation by Vertical</span>
              <span className="model-badge">Model: Precise-Weighted-V2</span>
            </div>
            <div className="multi-seg-bar">
              <div className="seg-hotel" /><div className="seg-flight" /><div className="seg-food" /><div className="seg-activity" /><div className="seg-cab" /><div className="seg-surge" />
            </div>
            <div className="expense-verticals-grid">
              <div className="vertical-item-box"><span className="dot black" /> Stays<div className="vertical-amount">43%</div><span className="vertical-sub">₹18,500</span></div>
              <div className="vertical-item-box"><span className="dot blue" /> Flights<div className="vertical-amount">29%</div><span className="vertical-sub">₹12,200</span></div>
              <div className="vertical-item-box"><span className="dot green" /> Food<div className="vertical-amount">14%</div><span className="vertical-sub">₹6,000</span></div>
              <div className="vertical-item-box"><span className="dot orange" /> Activities<div className="vertical-amount">10%</div><span className="vertical-sub">₹4,000</span></div>
              <div className="vertical-item-box"><span className="dot teal" /> Cabs<div className="vertical-amount">4%</div><span className="vertical-sub">₹1,800</span></div>
              <div className="vertical-item-box"><span className="dot purple" /> Buffer<div className="vertical-amount">3%</div><span className="vertical-sub">₹1,500</span></div>
            </div>
            <div className="expense-foot-row">
              <span><span className="green-dot" /> Dynamic live sync with Indian Rupee rates</span>
              <span className="export-link">Export Full Spreadsheet →</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="section-wrapper testimonials-center">
        <div className="rating-stars-row">★★★★★</div>
        <h2 className="section-headline centered">trusted by 250,000+ modern travelers</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="rating-stars-row small">★★★★★</div>
            <p className="testimonial-quote">"TravelAI saved us nearly ₹20,000 on our Bali honeymoon trip simply by timing the regional transfers and suggesting hidden cliff villas instead of generic resorts."</p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials">AS</div>
              <div><div className="author-name">Ananya Sharma</div><div className="author-role">Product Designer, Bengaluru</div></div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="rating-stars-row small">★★★★★</div>
            <p className="testimonial-quote">"The strict vegan filter worked flawlessly in Tokyo and Dubai. We did not have to second guess a single menu. The hour-by-hour routing was mathematically perfect."</p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials">RM</div>
              <div><div className="author-name">Rohan Mehta</div><div className="author-role">Founder, Mumbai</div></div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="rating-stars-row small">★★★★★</div>
            <p className="testimonial-quote">"When heavy rain struck South Goa, the AI concierge recalculated our whole afternoon into private spice plantation tastings in less than thirty seconds."</p>
            <div className="testimonial-author-row">
              <div className="author-avatar-initials">CL</div>
              <div><div className="author-name">Claire Laroche</div><div className="author-role">Digital Nomad, Goa</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-banner-wrapper">
        <div className="cta-banner-card">
          <div>
            <div className="cta-badge">● ZERO COMMITMENT</div>
            <h2>Your Next Journey Awaits</h2>
            <p>Generate unlimited custom routes, invite companions to vote on stays, and export direct to Apple Wallet or Google Calendar.</p>
          </div>
          <div className="cta-actions-row">
            <button className="btn-cta-gold" onClick={() => handleStartPlanning()}>Build Itinerary Now</button>
            <button className="btn-cta-outline" onClick={() => handleStartPlanning('Paris')}>View Sample Plan</button>
          </div>
        </div>
      </section>

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
