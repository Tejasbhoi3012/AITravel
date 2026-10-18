import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import {
  MapPin,
  ArrowRight,
  Check,
  X,
  Plane,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import AIChatDrawer from '../components/AIChatDrawer';

const PlanTripPage = () => {
  const navigate = useNavigate();
  const { plannerState, updatePlannerField, updatePreferenceList } = useTrip();

  const [step, setStep] = useState(1);
  const [destinationInput, setDestinationInput] = useState(plannerState.destination || 'Goa, India');
  const [selectedDestKey, setSelectedDestKey] = useState('Goa, India');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [multiCity, setMultiCity] = useState(false);

  // Destination Metadata database for rich preview card
  const destinationData = {
    'Goa, India': {
      name: 'Goa, India — Coastal Breeze & Portuguese Heritage',
      short: 'Goa, India',
      badge: 'TOP PICK • TROPICAL',
      sector: 'SECTOR ID: GOA-IND-G4',
      overlayLeft: 'PANJIM LATIN QUARTER & MORJIM SHORELINE',
      overlayRight: 'GEO: 15.4989° N, 73.8278° E',
      desc: 'Pristine southern coves, heritage Latin quarters in Panjim, vibrant beach shacks, and vibrant night markets with Portuguese architectural influence.',
      flight: '1h 20m from BOM',
      vibe: 'Relaxed & Culinary',
      safety: '98% Traveler Verified',
      climate: 'Tropical Microclimate • 28°C Sunny • Ideal Beach & Scooter Season',
      climateSub: 'Barometric stability: 1013 hPa // UV Index: 7 (Peak 11:30 - 15:00)',
      hint: 'Coordinates match Goa coastal quadrant (North Baga to South Palolem).',
      iata: 'IATA: GOI / GOX',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    },
    'Mumbai, India': {
      name: 'Mumbai, India — Heritage & High Energy',
      short: 'Mumbai, India',
      badge: 'TOP PICK • METRO',
      sector: 'SECTOR ID: MUM-IND-G1',
      overlayLeft: 'GATEWAY & MARINE DRIVE SHORELINE',
      overlayRight: 'GEO: 19.0760° N, 72.8777° E',
      desc: 'City of dreams with colonial architecture, high-energy street food, iconic sea links, and vibrant Bollywood culture.',
      flight: 'Direct Global Hub',
      vibe: 'High Energy & Heritage',
      safety: '96% Traveler Verified',
      climate: 'Coastal Warm • 30°C Clear • Pleasant Evening Breezes',
      climateSub: 'Barometric stability: 1010 hPa // UV Index: 6 (Peak 12:00 - 15:00)',
      hint: 'Coordinates match Mumbai metro quadrant (Colaba to Bandra).',
      iata: 'IATA: BOM',
      img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    },
    'Dubai, UAE': {
      name: 'Dubai, UAE — Glamour & Desert Adventure',
      short: 'Dubai, UAE',
      badge: 'TOP PICK • LUXURY',
      sector: 'SECTOR ID: DXB-UAE-G2',
      overlayLeft: 'MARINA SKYLINE & DESERT DUNES',
      overlayRight: 'GEO: 25.2048° N, 55.2708° E',
      desc: 'Hyper-futuristic skyline, pristine desert safaris, Michelin dining, world-class theme parks, and architectural marvels.',
      flight: '3h 30m • Direct',
      vibe: 'Glamour & Adventure',
      safety: '99% Traveler Verified',
      climate: 'Desert Warm • 26°C Clear • Cool Nights',
      climateSub: 'Barometric stability: 1015 hPa // UV Index: 5 (Peak 12:00 - 14:00)',
      hint: 'Coordinates match Dubai metro quadrant (Marina to Old Dubai).',
      iata: 'IATA: DXB',
      img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    },
    'Bali, Indonesia': {
      name: 'Bali, Indonesia — Spiritual & Tropical',
      short: 'Bali, Indonesia',
      badge: 'TOP PICK • ISLAND',
      sector: 'SECTOR ID: BALI-ID-G3',
      overlayLeft: 'UBUD TERRACES & ULUWATU CLIFFS',
      overlayRight: 'GEO: 8.3405° S, 115.0920° E',
      desc: 'Sacred water temples, emerald rice terraces in Ubud, vibrant beach clubs in Seminyak, and volcanic hiking trails.',
      flight: '5h 45m • 1 Stop',
      vibe: 'Spiritual & Tropical',
      safety: '97% Traveler Verified',
      climate: 'Equatorial Tropics • 29°C Lush • Light Breeze',
      climateSub: 'Barometric stability: 1011 hPa // UV Index: 8 (Peak 11:00 - 14:00)',
      hint: 'Coordinates match Bali island quadrant (Ubud to Uluwatu).',
      iata: 'IATA: DPS',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    },
    'Tokyo, Japan': {
      name: 'Tokyo, Japan — Electric & Immersive',
      short: 'Tokyo, Japan',
      badge: 'TOP PICK • HERITAGE',
      sector: 'SECTOR ID: TYO-JP-G5',
      overlayLeft: 'SHIBUYA CROSSING & ASAKUSA SHRINES',
      overlayRight: 'GEO: 35.6762° N, 139.6503° E',
      desc: 'Neon-lit Shibuya crossings, historic Asakusa shrines, Michelin ramen alleys, bullet trains, and world-class hospitality.',
      flight: '7h 15m • Direct',
      vibe: 'Electric & Immersive',
      safety: '99% Traveler Verified',
      climate: 'Temperate Crisp • 18°C Clear • Moderate Season',
      climateSub: 'Barometric stability: 1016 hPa // UV Index: 3 (Peak 11:00 - 13:00)',
      hint: 'Coordinates match Tokyo metro quadrant (Shibuya to Asakusa).',
      iata: 'IATA: HND / NRT',
      img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    },
  };

  const currentPreview = destinationData[selectedDestKey] || destinationData['Goa, India'];
  const trendingNodes = ['Goa, India', 'Bali, Indonesia', 'Dubai, UAE', 'Tokyo, Japan', 'Reykjavik, Iceland'];

  const handleSelectTrending = (dest) => {
    if (destinationData[dest]) {
      setSelectedDestKey(dest);
      setDestinationInput(dest);
      updatePlannerField('destination', dest);
    } else {
      setDestinationInput(dest);
      updatePlannerField('destination', dest);
    }
  };

  const handleNextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      navigate('/generating');
    }
  };

  const stepsList = [
    { num: 1, label: 'Destination' },
    { num: 2, label: 'Travelers' },
    { num: 3, label: 'Dates & Pacing' },
    { num: 4, label: 'Preferences' },
    { num: 5, label: 'Budget & Stays' },
    { num: 6, label: 'Review & Synthesize' },
  ];

  const synthesisPct = step * 16;
  const pendingParams = 6 - step;

  return (
    <div className="plan-page-root plan-v2">
      {/* Top badge row */}
      <div className="plan-v2-toprow">
        <span className="plan-v2-autonomous">● AUTONOMOUS PLANNER V4.2</span>
        <span className="plan-v2-sysloc">SYS.LOC // LAT-15.2993-LNG-74.1240</span>
      </div>

      <div className="plan-header-row">
        <div>
          <h1 className="plan-main-title">Design Your Custom Journey</h1>
          <p className="plan-subtitle">
            Algorithmic multi-modal routing engine orchestrating bespoke accommodation,
            culinary sequences, and local transit.
          </p>
        </div>

        <div className="ai-synthesis-widget">
          <div className="synth-ring">{synthesisPct}%</div>
          <div>
            <div className="synthesis-label">AI SYNTHESIS PROBABILITY ●</div>
            <div className="synthesis-val mono">{synthesisPct}% ready • {pendingParams} parameters pending</div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper-pill-bar">
        {stepsList.map((s, idx) => (
          <div key={s.num} className="stepper-step-wrap">
            <div
              className={`stepper-pill-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
              onClick={() => setStep(s.num)}
            >
              <div className="stepper-num-badge">
                {step > s.num ? <Check size={11} /> : s.num}
              </div>
              <span>{s.num === 1 ? '1. ' : ''}{s.label}</span>
            </div>
            {idx < stepsList.length - 1 && <span className="stepper-line" />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="plan-step-grid">
          {/* Left form */}
          <div className="plan-form-card plan-v2-form">
            <div className="plan-v2-formhead">
              <span>STEP 01 • GEOGRAPHY // WHERE ARE WE GOING?</span>
              <span className="loc-resolved">● LOC-RESOLVED</span>
            </div>

            <div className="plan-v2-fieldrow">
              <span className="plan-v2-fieldlabel">Primary Anchor Destination</span>
              <span className="plan-v2-iata mono">{currentPreview.iata}</span>
            </div>
            <div className="plan-v2-destbox">
              <MapPin size={17} color="#3f3f46" />
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  updatePlannerField('destination', e.target.value);
                }}
                placeholder="Goa, India"
              />
              <X size={15} color="#a1a1aa" style={{ cursor: 'pointer' }} onClick={() => setDestinationInput('')} />
              <span className="confirmed-badge">CONFIRMED</span>
            </div>

            <div className="plan-v2-hint mono">
              <span className="hint-label">HINT:</span>
              <span>{currentPreview.hint}</span>
            </div>

            <div className="plan-v2-fieldrow" style={{ marginTop: 18 }}>
              <span className="plan-v2-fieldlabel">ALGORITHMIC TRENDING NODES</span>
              <span className="live-volume mono"><span className="green-dot" /> LIVE VOLUME</span>
            </div>
            <div className="trending-dest-row plan-v2-chips">
              {trendingNodes.map((t) => (
                <button
                  key={t}
                  className={`trending-chip-pill ${destinationInput === t ? 'active' : ''}`}
                  onClick={() => handleSelectTrending(t)}
                >
                  {destinationInput === t && <Check size={12} />}
                  <span>{t}</span>
                </button>
              ))}
            </div>

            <div className="telemetry-box">
              <div className="telemetry-title">
                <span className="telemetry-gear">⚙</span>
                <span>REAL-TIME SATELLITE TELEMETRY</span>
                <span className="blue-dot" />
              </div>
              <div className="telemetry-main">{currentPreview.climate}</div>
              <div className="telemetry-sub mono">◔ {currentPreview.climateSub}</div>
            </div>

            <label className="multicity-row">
              <input type="checkbox" checked={multiCity} onChange={(e) => setMultiCity(e.target.checked)} />
              <span>Synthesize multi-city loop (e.g., North Goa Coast + Old Portuguese Latin Quarters)</span>
            </label>

            <div className="plan-v2-formfoot">
              <button className="save-draft-btn" onClick={() => navigate('/my-trips')}>Save Draft (⌘S)</button>
              <button className="btn-continue-pill black" onClick={handleNextStep}>
                <span>Continue to Travelers &amp; Dates</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right preview */}
          <div className="plan-v2-preview">
            <div className="preview-img-wrap">
              <img src={currentPreview.img} alt={currentPreview.short} />
              <span className="preview-top-pick">● TOP PICK • TROPICAL</span>
              <span className="preview-sector mono">{currentPreview.sector}</span>
              <div className="preview-overlay-row">
                <span className="preview-overlay-left">⊕ {currentPreview.overlayLeft}</span>
                <span className="preview-overlay-right mono">{currentPreview.overlayRight}</span>
              </div>
            </div>

            <h2 className="preview-title">{currentPreview.name}</h2>
            <p className="preview-desc">{currentPreview.desc}</p>

            <div className="preview-3metrics">
              <div>
                <div className="metric-col-title"><Plane size={12} /> DIRECT FLIGHT</div>
                <div className="metric-col-val">{currentPreview.flight}</div>
              </div>
              <div>
                <div className="metric-col-title"><SlidersHorizontal size={12} /> VIBE PROFILE</div>
                <div className="metric-col-val">{currentPreview.vibe}</div>
              </div>
              <div>
                <div className="metric-col-title blue"><ShieldCheck size={12} /> SAFETY SCORE</div>
                <div className="metric-col-val blue">{currentPreview.safety}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 2-6 */}
      {step === 2 && (
        <div className="plan-form-card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="form-step-tag">STEP 02 • PARTY DYNAMICS</div>
          <h2 className="form-step-heading">Who is traveling?</h2>
          <p className="form-step-sub">Select your party structure for room sizing and pacing formulas.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            {[
              { type: 'Solo', count: 1, label: 'Solo Explorer', sub: 'Independent & flexible pacing' },
              { type: 'Couple', count: 2, label: 'Couple / Duo', sub: 'Romantic stays & boutique dining' },
              { type: 'Family', count: 4, label: 'Family with Kids', sub: 'Kid-friendly, relaxed schedules' },
              { type: 'Friends', count: 4, label: 'Friends Group', sub: 'Social activities & nightlife' },
            ].map((opt) => (
              <div
                key={opt.type}
                className={`selection-card ${plannerState.travelers.type === opt.type ? 'selected' : ''}`}
                onClick={() => updatePlannerField('travelers', { type: opt.type, count: opt.count })}
              >
                <h4>{opt.label}</h4>
                <p>{opt.sub}</p>
              </div>
            ))}
          </div>
          <div className="planner-bottom-action-bar">
            <button className="btn-continue-pill black" onClick={handleNextStep}>
              <span>Continue to Dates &amp; Pacing</span><ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="plan-form-card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="form-step-tag">STEP 03 • SCHEDULE &amp; CADENCE</div>
          <h2 className="form-step-heading">Trip Duration &amp; Dates</h2>
          <p className="form-step-sub">Select duration in days ({plannerState.duration} Days)</p>
          <input
            type="range"
            min="1"
            max="14"
            value={plannerState.duration}
            onChange={(e) => updatePlannerField('duration', Number(e.target.value))}
            className="range-slider"
            style={{ margin: '20px 0' }}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <input type="date" value={plannerState.startDate} onChange={(e) => updatePlannerField('startDate', e.target.value)} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
            <input type="date" value={plannerState.endDate} onChange={(e) => updatePlannerField('endDate', e.target.value)} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
          </div>
          <div className="planner-bottom-action-bar">
            <button className="btn-continue-pill black" onClick={handleNextStep}>
              <span>Continue to Preferences</span><ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="plan-form-card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="form-step-tag">STEP 04 • PALATE &amp; VIBE</div>
          <h2 className="form-step-heading">Personalize Your Preferences</h2>
          <p className="form-step-sub">Select your preferred stays and activities.</p>
          {[
            { category: 'accommodation', label: 'Stays', options: ['Luxury Resort', 'Boutique Hotel', 'Standard Hotel'] },
            { category: 'food', label: 'Food', options: ['Vegetarian Cafes', 'Seafood Bistros', 'Local Delicacies', 'Street Food'] },
            { category: 'activities', label: 'Activities', options: ['Beaches & Sunset', 'Historic Forts', 'Nightlife', 'Water Sports', 'Nature & Hiking'] },
          ].map((group) => (
            <div key={group.category} style={{ margin: '16px 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                {group.label}
              </div>
              <div className="chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.options.map((pref) => {
                  const selected = (plannerState.preferences?.[group.category] || []).includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => updatePreferenceList(group.category, pref)}
                      className={`chip-btn ${selected ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: selected ? '1px solid #09090b' : '1px solid #cbd5e1',
                        background: selected ? '#09090b' : '#fff',
                        color: selected ? '#fff' : '#334155',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                      }}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="planner-bottom-action-bar">
            <button className="btn-continue-pill black" onClick={handleNextStep}>
              <span>Continue to Budget &amp; Stays</span><ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="plan-form-card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="form-step-tag">STEP 05 • FINANCIAL TARGET</div>
          <h2 className="form-step-heading">Set Estimated Total Budget</h2>
          <p className="form-step-sub">We forecast flights, hotels, food, and activities down to the rupee.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#09090b' }}>₹</span>
            <input
              type="number"
              value={plannerState.budget}
              onChange={(e) => updatePlannerField('budget', Number(e.target.value))}
              style={{ fontSize: '1.8rem', fontWeight: 800, padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: 8, width: 240 }}
            />
          </div>
          <div className="planner-bottom-action-bar">
            <button className="btn-continue-pill black" onClick={handleNextStep}>
              <span>Continue to Review &amp; Synthesize</span><ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="plan-form-card" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="form-step-tag">STEP 06 • AI SYNTHESIS</div>
          <h2 className="form-step-heading">Ready to Generate Your Itinerary</h2>
          <p className="form-step-sub">Route-Synth-V4 + Places are ready to structure your trip to {plannerState.destination}.</p>
          <button
            className="btn-continue-pill black"
            style={{ margin: '24px auto 0', padding: '16px 36px', fontSize: '1.1rem' }}
            onClick={() => navigate('/generating')}
          >
            <Sparkles size={18} />
            <span>Generate Full AI Itinerary</span>
          </button>
        </div>
      )}

      {/* Bottom assembly status bar */}
      <div className="assembly-status-bar">
        <div className="assembly-left">
          <span className="assembly-icon">✨</span>
          <div>
            <div className="assembly-title">Predictive Dynamic Assembly Active <span className="operational-badge">OPERATIONAL</span></div>
            <div className="assembly-sub">TravelAI has already indexed 142 boutique coastal properties &amp; 38 scooter routes for Goa.</div>
          </div>
        </div>
        <div className="assembly-right">
          <span className="assembly-pill mono"><span className="green-dot" /> LATENCY: 114ms</span>
          <span className="assembly-pill mono">MODEL: ROUTE-SYNTH-V4</span>
        </div>
      </div>

      {/* Floating AI Chat */}
      <div className="planner-bottom-action-bar" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <button className="btn-ask-float-pill" onClick={() => setIsAIChatOpen(true)}>
          <Sparkles size={16} />
          <span>Ask TravelAI</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        trip={{
          destination: destinationInput,
          duration: plannerState.duration || 5,
          budget: plannerState.budget || 50000,
          currency: 'INR',
          travelers: plannerState.travelers,
        }}
      />
    </div>
  );
};

export default PlanTripPage;
