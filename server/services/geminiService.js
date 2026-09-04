import { GoogleGenerativeAI } from '@google/generative-ai';

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
      const model = gemini.getGenerativeModel({ model: 'gemini-3.6-flash' });

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
      const model = gemini.getGenerativeModel({ model: 'gemini-3.6-flash' });
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

/**
 * Chat with AI travel assistant
 */
export const chatWithAssistant = async ({ message, trip, chatHistory = [] }) => {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const prompt = `
You are TravelAI, an enthusiastic, knowledgeable, and friendly travel concierge.
You are helping a traveler with their specific trip.

CONTEXT OF CURRENT TRIP:
- Destination: ${trip?.destination || 'Vacation'}
- Duration: ${trip?.duration || 3} days
- Budget: ${trip?.budget || 1000} ${trip?.currency || 'USD'}
- Travelers: ${trip?.travelers?.count || 1} (${trip?.travelers?.type || 'Solo'})
- Main Itinerary Days: ${trip?.itinerary?.map((d) => `Day ${d.day}: ${d.title}`).join(' | ')}
- Preferences: ${JSON.stringify(trip?.preferences || {})}

RECENT CHAT HISTORY:
${chatHistory.slice(-4).map((m) => `${m.role}: ${m.content}`).join('\n')}

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

  // Fallback chat assistant responses
  const dest = trip?.destination || 'your destination';
  return `I'm happy to help you with your trip to **${dest}**! 

Based on your ${trip?.duration || 3}-day itinerary:
- **Local Highlights**: Make sure to check out the recommended attractions during morning hours for fewer crowds.
- **Budget Tip**: You're currently tracking well within your ${trip?.budget || 1000} ${trip?.currency || 'USD'} plan.
- Feel free to ask me about restaurant recommendations, packing tips, or adjusting specific daily activities!`;
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
