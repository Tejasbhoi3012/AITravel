import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate AI-powered structured itinerary using Google Gemini
 */
export const generateItineraryWithGemini = async ({
  destination,
  travelers,
  duration,
  budget,
  currency = 'USD',
  preferences = {},
  realPlaces = [],
  realHotels = [],
  realRestaurants = [],
}) => {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `
You are an expert AI Travel Planner creating a hyper-detailed, structured travel itinerary.

IMPORTANT RULES:
1. You MUST use the provided REAL PLACES, HOTELS, and RESTAURANTS as your primary ground truth context. Do NOT invent fake places.
2. Return ONLY a valid, parseable raw JSON object. Do not include markdown code block formatting (e.g. do NOT include \`\`\`json or \`\`\`), do not include introductory text.
3. Every day must have structured activities for morning, afternoon, and evening.
4. Provide realistic estimated costs in ${currency} for activities, transit, food, and accommodation that align with the user's budget.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${duration} Days
- Travelers: ${travelers.count} (${travelers.type || 'Travelers'})
- Total Budget: ${budget} ${currency}
- Preferences:
  - Accommodation: ${preferences.accommodation?.join(', ') || 'Standard Hotel'}
  - Food: ${preferences.food?.join(', ') || 'Local cuisine'}
  - Activities: ${preferences.activities?.join(', ') || 'Sightseeing, Culture, Nature'}

AVAILABLE REAL CONTEXT:
- Real Attractions & Places: ${JSON.stringify(realPlaces.slice(0, 8).map(p => ({ name: p.name, placeId: p.placeId, address: p.address, category: p.category })))}
- Real Hotels: ${JSON.stringify(realHotels.slice(0, 4).map(h => ({ name: h.name, placeId: h.placeId, rating: h.rating })))}
- Real Restaurants: ${JSON.stringify(realRestaurants.slice(0, 6).map(r => ({ name: r.name, placeId: r.placeId, cuisine: r.cuisine })))}

REQUIRED JSON STRUCTURE:
{
  "summary": {
    "destination": "${destination}",
    "duration": ${duration},
    "travelers": ${travelers.count},
    "budget": ${budget},
    "currency": "${currency}",
    "description": "High-level summary of the trip experience"
  },
  "days": [
    {
      "day": 1,
      "date": "",
      "title": "Day 1 Title Theme",
      "theme": "Arrival & Initial Exploration",
      "activities": [
        {
          "time": "09:30 AM",
          "period": "morning",
          "title": "Activity Name",
          "description": "Detailed description of what to do",
          "placeId": "google_place_id_if_matching",
          "locationName": "Location Name",
          "estimatedCost": 25,
          "durationMinutes": 120,
          "category": "Sightseeing"
        }
      ]
    }
  ],
  "expenses": {
    "transportation": 200,
    "hotel": 400,
    "food": 250,
    "activities": 150,
    "localTravel": 80,
    "miscellaneous": 50,
    "total": 1080
  },
  "tips": [
    "Practical local travel tip 1",
    "Practical local travel tip 2",
    "Practical local travel tip 3"
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code fence if present
      if (text.startsWith('```json')) {
        text = text.substring(7);
      } else if (text.startsWith('```')) {
        text = text.substring(3);
      }
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
      text = text.trim();

      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.warn('[Gemini API] Error generating itinerary with Gemini, falling back to smart engine:', error.message);
    }
  }

  // Fallback intelligent itinerary generator
  return generateSmartFallbackItinerary({
    destination,
    travelers,
    duration,
    budget,
    currency,
    preferences,
    realPlaces,
    realHotels,
    realRestaurants,
  });
};

/**
 * Optimize trip budget using Gemini AI
 */
export const optimizeBudgetWithGemini = async ({
  trip,
  expenses,
  budget,
  currency = 'USD',
  travelers = 1,
}) => {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `
You are a financial travel optimization advisor.
Analyze the following travel trip budget and suggest actionable ways to save money without ruining the travel experience.

Trip: ${trip.destination}, Duration: ${trip.duration} days, Travelers: ${travelers}
Total Budget: ${budget} ${currency}
Current Estimated Expenses:
- Accommodation/Hotel: ${expenses.hotel} ${currency}
- Transportation: ${expenses.transportation} ${currency}
- Food & Dining: ${expenses.food} ${currency}
- Activities & Tickets: ${expenses.activities} ${currency}
- Local Transit: ${expenses.localTravel} ${currency}
- Miscellaneous: ${expenses.miscellaneous} ${currency}
- Total: ${expenses.total} ${currency}

Return ONLY raw JSON in this format:
{
  "suggestions": [
    {
      "title": "Strategy Title",
      "category": "Hotel|Food|Transport|Activities",
      "description": "Clear explanation of how and where to save",
      "estimatedSavings": 150
    }
  ],
  "totalPotentialSavings": 450
}
`;

      const result = await model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```json')) text = text.substring(7);
      if (text.startsWith('```')) text = text.substring(3);
      if (text.endsWith('```')) text = text.substring(0, text.length - 3);
      
      return JSON.parse(text.trim());
    } catch (error) {
      console.warn('[Gemini API] Budget optimizer error, using fallback:', error.message);
    }
  }

  // Fallback optimization suggestions
  const potentialSavings = Math.round(budget * 0.15);
  return {
    suggestions: [
      {
        title: 'Opt for Boutique Stays or Group Apartments',
        category: 'Hotel',
        description: `Booking local verified boutique stays or apartments in ${trip.destination} can save up to 20% on accommodation without sacrificing comfort.`,
        estimatedSavings: Math.round(potentialSavings * 0.45),
      },
      {
        title: 'Mix Fine Dining with Famous Local Eateries',
        category: 'Food',
        description: 'Enjoy high-rated local markets and neighborhood bistros for breakfasts and lunches, reserving fine dining for special evenings.',
        estimatedSavings: Math.round(potentialSavings * 0.3),
      },
      {
        title: 'Use City Travel Passes & Book Attractions in Advance',
        category: 'Activities',
        description: 'Multi-attraction tourist passes offer discounted entry and skip-the-line privileges across major landmarks.',
        estimatedSavings: Math.round(potentialSavings * 0.25),
      },
    ],
    totalPotentialSavings: potentialSavings,
  };
};

const CHAT_CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'AED ' };

const formatChatMoney = (amount, currency) => {
  const symbol = CHAT_CURRENCY_SYMBOLS[String(currency || '').toUpperCase()] || `${currency || ''} `;
  return `${symbol}${Math.round(Number(amount) || 0).toLocaleString('en-IN')}`;
};

/* Ordered intent table — first match wins. Order avoids collisions
   ("cheap sunset spot" must hit sunset, "food spots near my stay" → food). */
const CHAT_INTENTS = [
  { id: 'greeting', pattern: /^(hi|hii|hello|hey|namaste|good (morning|afternoon|evening))\b/ },
  { id: 'thanks', pattern: /thank|thanks|thx|that helps|awesome|perfect/ },
  { id: 'sunset', pattern: /sunset|sunrise|scenic|view|rooftop/ },
  { id: 'food', pattern: /food|eat|restaurant|dinner|lunch|breakfast|cuisine|dining|cafe|street food|snack|hungry|meal/ },
  { id: 'transport', pattern: /taxi|cab|uber|ola|auto|rickshaw|transport|metro|bus|train|flight|ride|shared|sharing|commute|baggage/ },
  { id: 'budget', pattern: /budget|cheap|save|saving|cost|expens|afford|money|spend|trim|reduce/ },
  { id: 'stay', pattern: /hotel|stay|hostel|resort|room|accommodation|check.?in|lodge/ },
  { id: 'packing', pattern: /pack|bag|luggage|carry|clothes|wear|essentials/ },
  { id: 'weather', pattern: /weather|climate|temperature|rain|monsoon|season|forecast/ },
  { id: 'safety', pattern: /safe|safety|scam|caution|emergency/ },
  { id: 'sightseeing', pattern: /attraction|sight|museum|fort|palace|temple|monument|landmark|visit|see the/ },
  { id: 'itinerary', pattern: /itinerary|schedule|day \d|day plan|timeline|what.*(do|doing)/ },
];

/**
 * Local concierge fallback when Gemini is unavailable. Answers from the real
 * trip data (itinerary costs, saved POIs, budget breakdown) so chat stays
 * genuinely useful instead of returning a canned template.
 */
const buildFallbackChatReply = ({ message, trip = {} }) => {
  const query = String(message || '').toLowerCase();
  const destination = trip.destination || 'your destination';
  const shortDest = String(destination).split(',')[0].trim() || 'your destination';
  const currency = trip.currency || 'INR';
  const budget = Number(trip.budget) || 0;
  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];
  const duration = Number(trip.duration) || itinerary.length || 3;
  const travelers = Number(trip.travelers?.count) || 1;
  const expenses = trip.expenses || {};
  const hotels = (trip.hotels || []).slice(0, 3);
  const restaurants = (trip.restaurants || []).slice(0, 4);
  const places = (trip.places || []).slice(0, 5);
  const preferences = trip.preferences || {};
  const activities = itinerary.flatMap((day) => (day.activities || []).map((activity) => ({ ...activity, day: day.day })));

  const money = (amount) => formatChatMoney(amount, currency);
  const intent = (CHAT_INTENTS.find((entry) => entry.pattern.test(query)) || {}).id || 'general';

  if (intent === 'greeting') {
    return `Hello! 👋 I'm your TravelAI concierge for the ${duration}-day ${shortDest} trip.\n\nI work from your live plan — try:\n- 💰 "Make Day ${Math.min(2, duration)} cheaper" — I'll find the priciest activity to trim\n- 🍽️ "Best food near my stay" — top saved food spots\n- 🚕 "Split taxi with others?" — sharing math for ${travelers} traveler${travelers === 1 ? '' : 's'}\n\nWhat would you like to dig into?`;
  }

  if (intent === 'thanks') {
    return `Anytime! 🙌 Your ${money(budget)} plan for ${shortDest} is looking solid. If you want, ask me to trim a day's activities, find cheaper food options, or suggest where to spend what's left.`;
  }

  if (intent === 'sunset') {
    const scenic = activities.find((activity) => /sunset|sunrise|view|promenade|beach|cruise|hill|rooftop|lake/i.test(activity.title || ''));
    if (scenic) {
      return `Your best sunset option is already in the plan: **${scenic.title}** on Day ${scenic.day} around ${scenic.time}.\n- Arrive 30–40 minutes early for a good spot.\n- Keep evening transport flexible so you can stay past dusk.`;
    }
    if (places.length > 0) {
      return `Closest scenic pick from your saved places in ${shortDest}: **${places[0].name}**${places[0].category ? ` (${places[0].category})` : ''}.\n\nYour itinerary has no fixed sunset stop yet — ask me to rework an evening and I'll slot it in.`;
    }
    return `For sunset in ${shortDest}, head to the nearest west-facing waterfront or elevated promenade — hotel rooftops are the safest bet for a quick plan. Check the exact sunset time locally, and be there ~40 minutes early.`;
  }

  if (intent === 'food') {
    if (restaurants.length > 0) {
      const lines = restaurants.map((r) => `- **${r.name}**${r.cuisine ? ` — ${r.cuisine}` : r.category ? ` — ${r.category}` : ''}${r.rating ? ` · ⭐ ${r.rating}` : ''}${r.priceEstimate && r.priceEstimate !== 'See listing' ? ` · ${r.priceEstimate}` : ''}`);
      const nightDining = activities.find((activity) => /dinner|dining|restaurant|cafe/i.test(`${activity.title} ${activity.category}`));
      return `Top food spots around ${shortDest} from your trip:\n${lines.join('\n')}\n\n${nightDining ? `Your plan's Day ${nightDining.day} dinner is at **${nightDining.locationName || nightDining.title}** (~${money(nightDining.estimatedCost)}).` : 'Prefer local flavor? Street-food lanes near the old market are usually the best value.'}\nWant me to swap any meal for a cheaper or higher-rated option?`;
    }
    return `No restaurants are saved in this plan yet. For ${shortDest}:\n- Target the oldest market lane for street food (best value + local flavor)\n- ${preferences.food?.length ? `Filter for your preference: ${preferences.food.join(', ')}.` : 'Ask the hotel desk for one "local favorite" that isn\'t on tourist lists.'}\n- Budget roughly ${money(Math.max(150, Math.round((budget * 0.15) / Math.max(1, duration))))} per day for food based on your plan.`;
  }

  if (intent === 'transport') {
    const localTravel = Number(expenses.localTravel) || Math.round(budget * 0.1);
    const perPerson = Math.round(localTravel / Math.max(1, travelers));
    const tripLegNote = trip.distanceKm
      ? `\n- Your ${Math.round(trip.distanceKm)} km journey from ${trip.origin?.name || 'your origin'} is already budgeted under transportation (${money(expenses.transportation || 0)}).`
      : '';
    return `Taxi-sharing math for ${shortDest}:\n- Local travel is budgeted at **${money(localTravel)}** for ${travelers} traveler${travelers === 1 ? '' : 's'} over ${duration} day${duration === 1 ? '' : 's'} → about **${money(perPerson)} per person**.\n- Splitting a cab in the ride-hailing apps' "share"/"pool" mode roughly halves the per-head fare vs solo rides.\n- For airport/station transfers, ask the hotel for their shared shuttle — usually the cheapest fixed rate.${tripLegNote}\n\nSharing rides for 2–3 legs a day typically frees up 5–8% of your budget for activities.`;
  }

  if (intent === 'budget') {
    const plannedActivities = activities.reduce((sum, activity) => sum + (Number(activity.estimatedCost) || 0), 0);
    const planned = Number(expenses.total) || plannedActivities;
    const remaining = Number(expenses.remainingBudget);
    const priciest = [...activities].sort((a, b) => (Number(b.estimatedCost) || 0) - (Number(a.estimatedCost) || 0)).slice(0, 2);
    const trimLines = priciest
      .filter((activity) => (Number(activity.estimatedCost) || 0) > 0)
      .map((activity) => `- **${activity.title}** (Day ${activity.day}) ~${money(activity.estimatedCost)} — a shared/standard alternative often cuts ~40% (save ~${money(activity.estimatedCost * 0.4)}).`);
    return `Budget snapshot for ${shortDest} (${duration} days, ${travelers} traveler${travelers === 1 ? '' : 's'}):\n- Planned spend: **${money(planned)}** of **${money(budget)}**${Number.isFinite(remaining) ? ` · remaining **${money(remaining)}**` : ''}\n${expenses.hotel ? `- Split: stay ${money(expenses.hotel)} · food ${money(expenses.food)} · activities ${money(expenses.activities)} · local travel ${money(expenses.localTravel)}` : ''}\n${trimLines.length ? `\nBiggest trims available:\n${trimLines.join('\n')}` : ''}\n\nTell me which day to focus on and I'll walk through cheaper alternatives.`;
  }

  if (intent === 'stay') {
    if (hotels.length > 0) {
      const lines = hotels.map((h) => `- **${h.name}**${h.priceEstimate && h.priceEstimate !== 'See listing' ? ` — ${h.priceEstimate}` : ''}${h.rating ? ` · ⭐ ${h.rating}` : ''}${h.address ? ` · ${h.address}` : ''}`);
      return `Saved stays in ${shortDest}:\n${lines.join('\n')}\n\nTips: book with free cancellation where possible, and prefer properties within ~15 minutes of your Day 1 morning stop to cut daily commute. Ask me "make Day 1 cheaper" if the stay eats too much of the ${money(budget)} budget.`;
    }
    return `No hotels are saved in this plan yet. For ${shortDest}, pick a base within 15 minutes of the main attractions cluster to save on daily travel${preferences.accommodation?.length ? `, and filter for your preference: ${preferences.accommodation.join(', ')}` : ''}.`;
  }

  if (intent === 'packing') {
    const activityPrefs = preferences.activities || [];
    const extras = [
      activityPrefs.some((p) => /beach|water/i.test(p)) ? 'swimwear + quick-dry towel' : null,
      activityPrefs.some((p) => /nightlife|shopping/i.test(p)) ? 'one smart-casual outfit for evenings' : null,
      activityPrefs.some((p) => /adventure|nature|trek/i.test(p)) ? 'sturdy walking shoes + a light daypack' : null,
    ].filter(Boolean);
    return `Packing essentials for ${duration} days in ${shortDest}:\n- ${Math.min(duration + 1, 8)} daily outfits + comfy walking shoes\n- Layers and a light rain shell — check the forecast a week before departure\n- Power bank, chargers, and travel adapter\n- Copies of ID/passport (digital + printed), basic meds, and a day bag for attractions${extras.length ? `\n- Based on your preferences: ${extras.join('; ')}` : ''}\n\nKeep valuables in a crossbody bag on market/attraction days.`;
  }

  if (intent === 'weather') {
    return `I can't pull live forecasts inside chat, so check the ${shortDest} weekly forecast before you fly. Good news: your itinerary schedules outdoor sights in the mornings, which sidesteps most midday heat or rain.\n- Add a light rain layer regardless of season\n- Keep one indoor option (museum/market) per day as a backup\n- Re-check the forecast 2–3 days out and ask me to reshuffle a day if needed.`;
  }

  if (intent === 'safety') {
    return `Quick safety checklist for ${shortDest}:\n- Use registered ride-hailing/radio taxis at night; avoid unmarked cabs\n- Keep a small wallet for the day, leave the rest in the hotel safe\n- Save your hotel's address card on your phone in the local language if possible\n- Share your day plan with someone at home${trip.startDate ? ` (you start ${trip.startDate})` : ''}\n- Use bottled/filtered water on street-food days\n\nEmergency numbers are usually pinned at hotel desks — screenshot them on arrival.`;
  }

  if (intent === 'sightseeing') {
    const lines = places.length > 0
      ? places.map((p) => `- **${p.name}**${p.category ? ` — ${p.category}` : ''}`)
      : activities.slice(0, 5).map((a) => `- **${a.title}** — Day ${a.day}, ${a.time}`);
    const firstActivity = activities.find((a) => a.day === 1);
    return `Must-sees in your ${shortDest} plan:\n${lines.join('\n')}\n\n${firstActivity ? `Day 1 kicks off with **${firstActivity.title}** at ${firstActivity.time}.` : ''} Mornings are best for the headline sights — afternoons get crowded and hotter. Want me to reorder any day?`;
  }

  if (intent === 'itinerary') {
    if (itinerary.length > 0) {
      const lines = itinerary.slice(0, 7).map((day) => `- **Day ${day.day} — ${day.title}**: ${(day.activities || []).map((a) => a.title).join(' → ')}`);
      return `Your ${duration}-day ${shortDest} plan at a glance:\n${lines.join('\n')}\n${itinerary.length > 7 ? `…plus ${itinerary.length - 7} more days in the itinerary tab.\n` : ''}\nAsk me to make any specific day cheaper, slower, or more local — or say "Day ${Math.min(2, duration)} plan" for the full timeline of that day.`;
    }
    return `Your plan for ${shortDest} covers ${duration} days on a ${money(budget)} budget. Ask me about any day's activities once the itinerary is generated — or say "best food near my stay" or "split taxi with others" for instant answers.`;
  }

  const priciest = [...activities].sort((a, b) => (Number(b.estimatedCost) || 0) - (Number(a.estimatedCost) || 0))[0];
  const trimmed = String(message || '').slice(0, 60);
  return `Got it — about "${trimmed}": I work from your live ${shortDest} plan, here's what I can act on right now:\n- 💰 "Make Day ${priciest?.day || Math.min(2, duration)} cheaper" — biggest single saving available${priciest ? ` (**${priciest.title}**, ${money(priciest.estimatedCost)})` : ''}\n- 🍽️ "Best food near my stay" — ${restaurants.length > 0 ? `${restaurants.length} saved food spots` : 'local dining picks'}\n- 🚕 "Split taxi with others?" — sharing math for ${travelers} traveler${travelers === 1 ? '' : 's'}\n- 🧳 "What to pack?" or 🏨 "Which hotel?" for quick essentials\n\nWhich of these should I dig into?`;
};

/**
 * Chat with AI travel assistant
 */
export const chatWithAssistant = async ({ message, trip, chatHistory = [] }) => {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `
You are TravelAI, an enthusiastic, knowledgeable, and friendly travel concierge.
You are helping a traveler with their specific trip.

CONTEXT OF CURRENT TRIP:
- Destination: ${trip?.destination || 'Vacation'}
- Duration: ${trip?.duration || 3} days
- Budget: ${trip?.budget || 1000} ${trip?.currency || 'USD'}
- Travelers: ${trip?.travelers?.count || 1} (${trip?.travelers?.type || 'Solo'})
- Main Itinerary Days: ${trip?.itinerary?.map((d) => `Day ${d.day}: ${d.title}`).join(' | ')}
- Budget breakdown: ${JSON.stringify(trip?.expenses || {})}
- Preferences: ${JSON.stringify(trip?.preferences || {})}

RECENT CHAT HISTORY:
${(chatHistory || []).slice(-4).map((m) => `${m.role}: ${m.text || m.content || ''}`).join('\n')}

USER QUESTION:
"${message}"

Please provide a concise, engaging, and genuinely helpful response tailored to their itinerary and destination. Include bullet points or actionable recommendations where appropriate.
`;

      const result = await model.generateContent(prompt);
      return (await result.response).text().trim();
    } catch (error) {
      console.warn('[Gemini API] Chat error, using fallback:', error.message);
    }
  }

  return buildFallbackChatReply({ message, trip });
};

/**
 * Fallback smart generator when Gemini key is absent or offline
 */
const generateSmartFallbackItinerary = ({
  destination,
  travelers,
  duration,
  budget,
  currency,
  preferences,
  realPlaces = [],
  realHotels = [],
  realRestaurants = [],
}) => {
  const numDays = Math.max(1, Math.min(Number(duration) || 3, 14));
  const days = [];

  const activityPool = realPlaces.length > 0 ? realPlaces : [
    { name: `Historic Old Town & Central Plaza of ${destination}`, placeId: 'attr_1', category: 'Culture', address: `${destination} Center` },
    { name: `${destination} Famous Scenic Viewpoint & Promenade`, placeId: 'attr_2', category: 'Sightseeing', address: `Overlook, ${destination}` },
    { name: `National Museum of Art & Heritage`, placeId: 'attr_3', category: 'Museum', address: `Museum Quarter, ${destination}` },
    { name: `${destination} Botanical Gardens & Nature Walk`, placeId: 'attr_4', category: 'Nature', address: `Green Park, ${destination}` },
    { name: `Vibrant Artisan Market & Souks`, placeId: 'attr_5', category: 'Shopping', address: `Market Square, ${destination}` },
    { name: `Sunset Harbor & Coastal Cruise`, placeId: 'attr_6', category: 'Adventure', address: `Harbor, ${destination}` },
  ];

  const diningPool = realRestaurants.length > 0 ? realRestaurants : [
    { name: `${destination} Traditional Heritage Bistro`, cuisine: 'Local Specialties', placeId: 'rest_1' },
    { name: `The Skyline Rooftop Lounge`, cuisine: 'International & Drinks', placeId: 'rest_2' },
    { name: `Old Harbor Seafood Kitchen`, cuisine: 'Seafood', placeId: 'rest_3' },
    { name: `Garden Cafe & Artisan Bakery`, cuisine: 'Cafe & Brunch', placeId: 'rest_4' },
  ];

  for (let i = 1; i <= numDays; i++) {
    const morningPlace = activityPool[(i * 2 - 2) % activityPool.length];
    const afternoonPlace = activityPool[(i * 2 - 1) % activityPool.length];
    const eveningDining = diningPool[(i - 1) % diningPool.length];

    days.push({
      day: i,
      title: i === 1 ? `Arrival & First Impressions of ${destination}` : i === numDays ? `Final Highlights & Farewell ${destination}` : `Exploring the Culture & Wonders of ${destination}`,
      theme: i === 1 ? 'Arrival & Sightseeing' : i % 2 === 0 ? 'Cultural Discovery & Landmarks' : 'Nature, Markets & Scenic Views',
      activities: [
        {
          id: `act_${i}_1`,
          time: '09:30 AM',
          period: 'morning',
          title: `Visit ${morningPlace.name}`,
          description: `Kick off the day discovering ${morningPlace.name}. Enjoy photo opportunities and historical sights.`,
          placeId: morningPlace.placeId || '',
          locationName: morningPlace.name,
          latitude: morningPlace.latitude,
          longitude: morningPlace.longitude,
          estimatedCost: Math.round((budget * 0.03) / numDays),
          durationMinutes: 120,
          category: morningPlace.category || 'Sightseeing',
        },
        {
          id: `act_${i}_2`,
          time: '02:00 PM',
          period: 'afternoon',
          title: `Explore ${afternoonPlace.name}`,
          description: `Spend the afternoon immersing yourself in ${afternoonPlace.name}.`,
          placeId: afternoonPlace.placeId || '',
          locationName: afternoonPlace.name,
          latitude: afternoonPlace.latitude,
          longitude: afternoonPlace.longitude,
          estimatedCost: Math.round((budget * 0.02) / numDays),
          durationMinutes: 150,
          category: afternoonPlace.category || 'Culture',
        },
        {
          id: `act_${i}_3`,
          time: '07:30 PM',
          period: 'evening',
          title: `Dinner & Evening at ${eveningDining.name}`,
          description: `Unwind with dinner experiencing authentic flavors and vibrant evening ambiance.`,
          placeId: eveningDining.placeId || '',
          locationName: eveningDining.name,
          latitude: eveningDining.latitude,
          longitude: eveningDining.longitude,
          estimatedCost: Math.round((budget * 0.05) / numDays),
          durationMinutes: 90,
          category: 'Dining & Leisure',
        },
      ],
    });
  }

  const estHotel = Math.round(budget * 0.35);
  const estTransport = Math.round(budget * 0.22);
  const estFood = Math.round(budget * 0.20);
  const estActivities = Math.round(budget * 0.12);
  const estLocalTravel = Math.round(budget * 0.06);
  const estMisc = Math.round(budget * 0.05);
  const total = estHotel + estTransport + estFood + estActivities + estLocalTravel + estMisc;

  return {
    summary: {
      destination,
      duration: numDays,
      travelers: travelers?.count || 1,
      budget,
      currency,
      description: `A curated ${numDays}-day journey across ${destination} crafted for ${travelers?.count || 1} ${travelers?.type || 'travelers'}.`,
    },
    days,
    expenses: {
      transportation: estTransport,
      hotel: estHotel,
      food: estFood,
      activities: estActivities,
      localTravel: estLocalTravel,
      miscellaneous: estMisc,
      total,
    },
    tips: [
      `Download offline maps for ${destination} before leaving.`,
      `Keep local currency cash handy for street markets and transport tickets.`,
      `Peak visiting hours at major landmarks are between 11 AM - 3 PM. Early mornings are best.`,
    ],
  };
};
