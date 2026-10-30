import fs from 'fs';
import path from 'path';
import {
  User,
  BusinessProfile,
  Feedback,
  CustomerInsight,
  Recommendation,
  BusinessIdea,
  SyncSource,
  SyncLog,
  DashboardStats,
} from '../types/index.ts';

interface DatabaseSchema {
  users: User[];
  businesses: BusinessProfile[];
  feedback: Feedback[];
  insights: CustomerInsight[];
  recommendations: Recommendation[];
  businessIdeas: BusinessIdea[];
  syncSources: SyncSource[];
  syncLogs: SyncLog[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const INITIAL_BUSINESS_ID = 'biz-freshbite-01';

const INITIAL_BUSINESS: BusinessProfile = {
  id: INITIAL_BUSINESS_ID,
  name: 'FreshBite Café',
  category: 'Food and Beverage',
  description: 'A contemporary café serving coffee, beverages, sandwiches, desserts and freshly prepared food.',
  location: '452 University Avenue, Palo Alto, CA',
  contactEmail: 'contact@freshbitecafe.com',
  contactPhone: '+1 (650) 492-8819',
  websiteUrl: 'https://freshbitecafe.example.com',
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const INITIAL_USER: User = {
  id: 'usr-admin-01',
  name: 'Maya Lin',
  email: 'manager@freshbitecafe.com',
  phone: '+1 (650) 492-8819',
  businessId: INITIAL_BUSINESS_ID,
  businessName: 'FreshBite Café',
  businessCategory: 'Food and Beverage',
  createdAt: '2025-01-15T08:00:00.000Z',
};

const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-cafe-101',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'Marcus Vance',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'The flat white coffee had phenomenal microfoam and intricate latte art. The espresso blend is smooth without any bitterness. Highly recommend stopping here before morning work.',
    rating: 5,
    feedbackSource: 'Google Reviews',
    sourceReviewId: 'g-rev-fb-01',
    reviewDate: '2026-10-29T09:20:00.000Z',
    sentiment: 'positive',
    sentimentScore: 97,
    primaryAspect: 'Coffee Quality & Barista Skill',
    aspectSentiment: [
      { aspect: 'Coffee Quality', sentiment: 'positive', score: 98, explanation: 'Praised microfoam, balance, and lack of bitterness.' },
      { aspect: 'Latte Art Presentation', sentiment: 'positive', score: 95, explanation: 'Noted intricate barista rosette art.' },
    ],
    customerLikes: ['Artisanal flat white', 'Latte art', 'Smooth espresso blend'],
    customerDislikes: [],
    customerExpectations: ['Consistently dialed-in specialty coffee'],
    suggestions: ['Add a punch card or mobile loyalty stamp for regular commuters'],
    complaints: [],
    rootCauses: [],
    images: [
      {
        id: 'img-101-1',
        url: '/src/assets/images/freshbite_latte_art_1793370751254.jpg',
        caption: 'Flat white with rosette latte art served at our wooden table',
        isCustomerUpload: true,
      },
    ],
    aiAnalyzed: true,
    isNew: true,
    createdAt: '2026-10-29T09:20:00.000Z',
  },
  {
    id: 'fb-cafe-102',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'Sarah Jenkins',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'Ordered the prosciutto and melted gruyere sourdough panini. Bread had the perfect crisp crust and cheese was thoroughly melted. However, the lunch line took 18 minutes to reach the register.',
    rating: 4,
    feedbackSource: 'Google Reviews',
    sourceReviewId: 'g-rev-fb-02',
    reviewDate: '2026-10-28T13:15:00.000Z',
    sentiment: 'neutral',
    sentimentScore: 68,
    primaryAspect: 'Sandwiches & Peak Wait Times',
    aspectSentiment: [
      { aspect: 'Sandwich Flavor & Texture', sentiment: 'positive', score: 96, explanation: 'Crispy sourdough and quality melted gruyere.' },
      { aspect: 'Lunch Wait Time', sentiment: 'negative', score: 30, explanation: '18-minute counter queue during peak 12:30pm lunch rush.' },
    ],
    customerLikes: ['Crisp sourdough panini', 'Prosciutto and gruyere filling'],
    customerDislikes: ['18-minute wait to order at register'],
    customerExpectations: ['Faster throughput for quick lunch break eaters'],
    suggestions: ['Introduce online order-ahead for pickup sandwiches'],
    complaints: ['Slow order processing during midday rush'],
    rootCauses: ['Single cashier entering complex food mods alongside drinks'],
    images: [
      {
        id: 'img-102-1',
        url: '/src/assets/images/freshbite_sandwich_1793370750499.jpg',
        caption: 'Warm grilled sourdough sandwich on olive wood board',
        isCustomerUpload: true,
      },
    ],
    aiAnalyzed: true,
    isNew: true,
    createdAt: '2026-10-28T13:15:00.000Z',
  },
  {
    id: 'fb-cafe-103',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'David Kim',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'The almond croissant is flaky with layers of buttery pastry, and the fresh berry tart was light and balanced. Great dessert case selection that pairs nicely with filter roast.',
    rating: 5,
    feedbackSource: 'Website',
    sourceReviewId: 'web-fb-4401',
    reviewDate: '2026-10-27T15:40:00.000Z',
    sentiment: 'positive',
    sentimentScore: 94,
    primaryAspect: 'Pastries & Desserts',
    aspectSentiment: [
      { aspect: 'Bakery & Pastry Quality', sentiment: 'positive', score: 98, explanation: 'Flaky lamination and rich almond cream filling.' },
      { aspect: 'Dessert Presentation', sentiment: 'positive', score: 92, explanation: 'Fresh seasonal fruit tart beautifully prepared.' },
    ],
    customerLikes: ['Almond croissant', 'Berry tart', 'Clean pastry showcase'],
    customerDislikes: [],
    customerExpectations: ['Fresh daily baked morning viennoiserie'],
    suggestions: ['Offer an afternoon coffee + pastry pairing bundle discount'],
    complaints: [],
    rootCauses: [],
    images: [
      {
        id: 'img-103-1',
        url: '/src/assets/images/freshbite_pastry_1793370751050.jpg',
        caption: 'Almond croissant and berry tart on marble plate',
        isCustomerUpload: true,
      },
    ],
    aiAnalyzed: true,
    isNew: false,
    createdAt: '2026-10-27T15:40:00.000Z',
  },
  {
    id: 'fb-cafe-104',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'Chloe Bennett',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'I appreciate that FreshBite uses 100% compostable boxes and unbleached kraft paper coffee cups. Food arrived fresh and zero plastic was wasted.',
    rating: 5,
    feedbackSource: 'Instagram',
    sourceReviewId: 'ig-fb-8812',
    reviewDate: '2026-10-26T12:05:00.000Z',
    sentiment: 'positive',
    sentimentScore: 96,
    primaryAspect: 'Takeaway Packaging & Sustainability',
    aspectSentiment: [
      { aspect: 'Eco Packaging', sentiment: 'positive', score: 100, explanation: 'Completely plastic-free compostable kraft packaging.' },
      { aspect: 'Takeaway Freshness', sentiment: 'positive', score: 92, explanation: 'Food maintained crispness without getting soggy.' },
    ],
    customerLikes: ['Zero plastic packaging', 'Eco kraft paper cups', 'Sturdy containers'],
    customerDislikes: [],
    customerExpectations: ['Conscious sustainable café operations'],
    suggestions: ['Add a discount for customers bringing their own reusable tumbler'],
    complaints: [],
    rootCauses: [],
    images: [
      {
        id: 'img-104-1',
        url: '/src/assets/images/freshbite_packaging_1793370751609.jpg',
        caption: 'Compostable takeaway food box and eco paper coffee cup on patio',
        isCustomerUpload: true,
      },
    ],
    aiAnalyzed: true,
    isNew: false,
    createdAt: '2026-10-26T12:05:00.000Z',
  },
  {
    id: 'fb-cafe-105',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'Julian Rivera',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'The roasted vegetable and quinoa brunch bowl was loaded with fresh avocado and pumpkin seeds. Very healthy, but music inside was a bit too loud for having a phone conversation.',
    rating: 4,
    feedbackSource: 'Google Reviews',
    sourceReviewId: 'g-rev-fb-03',
    reviewDate: '2026-10-25T11:30:00.000Z',
    sentiment: 'neutral',
    sentimentScore: 72,
    primaryAspect: 'Food Healthiness & Seating Acoustics',
    aspectSentiment: [
      { aspect: 'Food Freshness & Taste', sentiment: 'positive', score: 94, explanation: 'Generous avocado portion and seasoned quinoa bowl.' },
      { aspect: 'Café Noise & Acoustics', sentiment: 'neutral', score: 50, explanation: 'Background music volume made phone calls difficult.' },
    ],
    customerLikes: ['Fresh avocado quinoa bowl', 'Healthy plant-based choices'],
    customerDislikes: ['Elevated background speaker volume'],
    customerExpectations: ['Comfortable ambient music suited for light remote work'],
    suggestions: ['Keep music playlist at conversation-friendly volume levels'],
    complaints: ['Loud music volume'],
    rootCauses: ['Speakers positioned directly above communal work banquette'],
    images: [
      {
        id: 'img-105-1',
        url: '/src/assets/images/freshbite_brunch_bowl_1793370751795.jpg',
        caption: 'Fresh vegetable, avocado and quinoa grain lunch bowl',
        isCustomerUpload: true,
      },
    ],
    aiAnalyzed: true,
    isNew: false,
    createdAt: '2026-10-25T11:30:00.000Z',
  },
  {
    id: 'fb-cafe-106',
    businessId: INITIAL_BUSINESS_ID,
    customerName: 'Emily Watson',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    reviewContent: 'Came on Saturday at 11am. There were zero open tables and a 25-minute wait for two iced matchas and toast. Baristas looked completely stressed out.',
    rating: 2,
    feedbackSource: 'Google Reviews',
    sourceReviewId: 'g-rev-fb-04',
    reviewDate: '2026-10-24T11:45:00.000Z',
    sentiment: 'negative',
    sentimentScore: 26,
    primaryAspect: 'Weekend Seating & Drink Wait Times',
    aspectSentiment: [
      { aspect: 'Drink Prep Time', sentiment: 'negative', score: 20, explanation: '25-minute ticket time for standard iced matcha lattes.' },
      { aspect: 'Table Availability', sentiment: 'negative', score: 30, explanation: 'Overcrowded seating area with no empty tables.' },
      { aspect: 'Staff Stress Level', sentiment: 'neutral', score: 40, explanation: 'Team overwhelmed by weekend brunch volume.' },
    ],
    customerLikes: [],
    customerDislikes: ['25-minute drink wait', 'Lack of available seating'],
    customerExpectations: ['Weekend ticket turnaround within 10 minutes'],
    suggestions: ['Schedule an extra weekend barback to restock ice, milk, and clear bus tubs'],
    complaints: ['Slow weekend ticket times', 'Seating congestion'],
    rootCauses: ['Barista on espresso machine also tasked with steaming matcha and slicing bread'],
    images: [],
    aiAnalyzed: true,
    isNew: false,
    createdAt: '2026-10-24T11:45:00.000Z',
  },
];

const INITIAL_INSIGHTS: CustomerInsight[] = [
  {
    id: 'ins-fb-01',
    businessId: INITIAL_BUSINESS_ID,
    topic: 'Artisanal Coffee & Microfoam Excellence',
    frequency: 38,
    sentiment: 'positive',
    description: 'Specialty coffee drinks, dialed espresso profiles, and barista latte art consistently drive 5-star customer ratings across all channels.',
    representativeQuotes: [
      'The flat white coffee had phenomenal microfoam and intricate latte art.',
      'The espresso blend is smooth without any bitterness.',
    ],
    category: 'strength',
  },
  {
    id: 'ins-fb-02',
    businessId: INITIAL_BUSINESS_ID,
    topic: 'Peak Midday Lunch Queue Bottleneck',
    frequency: 22,
    sentiment: 'negative',
    description: 'During 11:30am to 1:30pm peak rushes, customers report 15-20 minute counter queues when ordering hot panini and specialty food.',
    representativeQuotes: [
      'The bread had perfect crust, but the lunch line took 18 minutes to reach the register.',
      'There was a 25-minute wait for two iced matchas and toast on Saturday.',
    ],
    category: 'complaint',
  },
  {
    id: 'ins-fb-03',
    businessId: INITIAL_BUSINESS_ID,
    topic: 'Sustainable Compostable Packaging Praise',
    frequency: 18,
    sentiment: 'positive',
    description: 'Customers strongly endorse FreshBite’s 100% compostable takeaway food boxes and unbleached kraft paper coffee cups.',
    representativeQuotes: [
      'I appreciate that FreshBite uses 100% compostable boxes and unbleached kraft cups.',
    ],
    category: 'preference',
  },
  {
    id: 'ins-fb-04',
    businessId: INITIAL_BUSINESS_ID,
    topic: 'Bakery Lamination & Dessert Curation',
    frequency: 15,
    sentiment: 'positive',
    description: 'Almond croissants, berry tarts, and freshly prepared morning bakery items are a prime driver of high basket size and repeat visits.',
    representativeQuotes: [
      'The almond croissant is flaky with layers of buttery pastry, and fresh berry tart was light and balanced.',
    ],
    category: 'strength',
  },
];

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-fb-01',
    businessId: INITIAL_BUSINESS_ID,
    identifiedProblem: 'Peak lunch counter lines cause wait times of 15-20 minutes, frustrating nearby office workers with tight lunch hours.',
    supportingCustomerFeedback: [
      '"The lunch line took 18 minutes to reach the register." - Sarah Jenkins',
      '"25-minute wait for two iced matchas and toast." - Emily Watson',
    ],
    suggestedImprovement: 'Deploy mobile order-ahead via QR code and dedicate an express pickup shelf for prepaid drinks and pre-assembled lunch bowls.',
    priority: 'High',
    expectedBenefit: 'Reduces queue dwell by 55% and increases weekday lunch throughput by ~$1,800/week.',
    recommendedAction: 'Enable Toast / Square online mobile pickup flow with counter pickup shelf.',
    status: 'In Progress',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-29T09:30:00.000Z',
  },
  {
    id: 'rec-fb-02',
    businessId: INITIAL_BUSINESS_ID,
    identifiedProblem: 'Saturday staffing bottlenecks leave baristas juggling espresso, matcha whisking, and food assembly simultaneously.',
    supportingCustomerFeedback: [
      '"Zero open tables and a 25-minute wait... baristas looked completely stressed out." - Emily Watson',
    ],
    suggestedImprovement: 'Schedule a dedicated weekend barback from 9:30am - 2:00pm responsible strictly for bussing tables, restock, and food plating.',
    priority: 'High',
    expectedBenefit: 'Drops weekend ticket turnaround time to under 8 minutes and elevates store cleanliness.',
    recommendedAction: 'Adjust Saturday and Sunday shift roasters to include an auxiliary floor barback.',
    status: 'Pending',
    createdAt: '2026-10-26T12:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z',
  },
  {
    id: 'rec-fb-03',
    businessId: INITIAL_BUSINESS_ID,
    identifiedProblem: 'Afternoon foot traffic dips significantly between 2:00pm and 5:00pm despite a full pastry case.',
    supportingCustomerFeedback: [
      '"Great dessert case selection that pairs nicely with filter roast... offer afternoon pairing." - David Kim',
    ],
    suggestedImprovement: 'Introduce a "Fika / Coffee & Pastry Pair" special between 2pm-5pm offering 20% off any viennoiserie with a handcrafted beverage.',
    priority: 'Medium',
    expectedBenefit: 'Captures remote-working afternoon visitors and clears daily fresh baked inventory with zero pastry waste.',
    recommendedAction: 'Program afternoon combo discount into POS register.',
    status: 'Pending',
    createdAt: '2026-10-27T15:00:00.000Z',
    updatedAt: '2026-10-27T15:00:00.000Z',
  },
];

const INITIAL_IDEAS: BusinessIdea[] = [
  {
    id: 'idea-fb-01',
    businessId: INITIAL_BUSINESS_ID,
    title: 'FreshBite Morning Coffee Pass & Digital Loyalty Club',
    category: 'Customer Experience',
    rationale: 'Daily morning commuters purchase specialty espresso 4-5 times a week; reviews requested a mobile wallet stamp card.',
    supportingFeedback: [
      '"Phenomenal microfoam... add a punch card or mobile loyalty stamp for regular commuters." - Marcus Vance',
    ],
    feasibility: 'High',
    expectedImpact: 'Locks in commuter habituation and produces predictable recurring monthly cashflow.',
  },
  {
    id: 'idea-fb-02',
    businessId: INITIAL_BUSINESS_ID,
    title: 'Corporate Artisan Lunch Box Catering',
    category: 'New Product',
    rationale: 'High praise for sourdough panini, grain bowls, and eco-friendly compostable packaging makes FreshBite ideal for local office team lunches.',
    supportingFeedback: [
      '"Bread had the perfect crisp crust... appreciate 100% compostable boxes." - Sarah Jenkins & Chloe Bennett',
    ],
    feasibility: 'High',
    expectedImpact: 'Unlocks high-margin catering orders of $250-$800 per delivery to tech campuses.',
  },
  {
    id: 'idea-fb-03',
    businessId: INITIAL_BUSINESS_ID,
    title: 'Grab-and-Go Bottled Cold Brew & House Matcha',
    category: 'Additional Feature',
    rationale: 'Customers waiting in peak lines often want iced drinks immediately; ready-to-drink glass bottles solve queue friction.',
    supportingFeedback: [
      '"25-minute wait for two iced matchas... would love quick takeaway." - Emily Watson',
    ],
    feasibility: 'Medium',
    expectedImpact: 'Adds incremental retail revenue with zero barista counter prep time.',
  },
];

const INITIAL_SOURCES: SyncSource[] = [
  {
    id: 'src-google',
    name: 'Google Reviews',
    connected: true,
    autoSync: true,
    frequencyMinutes: 15,
    lastSyncTime: '2026-10-30T07:00:00.000Z',
    nextSyncTime: '2026-10-30T07:15:00.000Z',
    reviewsCollected: 184,
    status: 'connected',
    authIdentifier: 'accounts.google.com/places/freshbite-paloalto',
  },
  {
    id: 'src-web',
    name: 'Website Feedback',
    connected: true,
    autoSync: true,
    frequencyMinutes: 30,
    lastSyncTime: '2026-10-30T06:45:00.000Z',
    nextSyncTime: '2026-10-30T07:15:00.000Z',
    reviewsCollected: 62,
    status: 'connected',
    authIdentifier: 'api.freshbitecafe.com/v1/customer-feedback',
  },
  {
    id: 'src-ig',
    name: 'Instagram',
    connected: false,
    autoSync: false,
    frequencyMinutes: 60,
    lastSyncTime: null,
    nextSyncTime: null,
    reviewsCollected: 0,
    status: 'disconnected',
    errorMessage: 'Requires Meta Business Suite API authorization for @freshbitecafe.',
  },
  {
    id: 'src-fb',
    name: 'Facebook',
    connected: false,
    autoSync: false,
    frequencyMinutes: 60,
    lastSyncTime: null,
    nextSyncTime: null,
    reviewsCollected: 0,
    status: 'disconnected',
    errorMessage: 'Page access token not configured.',
  },
  {
    id: 'src-csv',
    name: 'CSV Import',
    connected: true,
    autoSync: false,
    frequencyMinutes: 0,
    lastSyncTime: '2026-10-29T18:00:00.000Z',
    nextSyncTime: null,
    reviewsCollected: 38,
    status: 'connected',
  },
  {
    id: 'src-manual',
    name: 'Manual Entry',
    connected: true,
    autoSync: false,
    frequencyMinutes: 0,
    lastSyncTime: '2026-10-30T05:30:00.000Z',
    nextSyncTime: null,
    reviewsCollected: 19,
    status: 'connected',
  },
];

const INITIAL_LOGS: SyncLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-30T07:00:00.000Z',
    platform: 'Google Reviews',
    reviewsCollected: 2,
    status: 'success',
    details: 'Synced 2 new verified customer reviews with attached latte art and panini photos. Aspect-based AI sentiment tagged.',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-30T06:45:00.000Z',
    platform: 'Website Feedback',
    reviewsCollected: 1,
    status: 'success',
    details: 'Synced post-dining feedback. Aspect sentiment and pastry suggestions processed.',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-30T06:30:00.000Z',
    platform: 'Google Reviews',
    reviewsCollected: 0,
    status: 'success',
    details: 'Check completed. Zero new reviews posted in the 15-minute interval.',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // If the database was still under old identity, reseed with FreshBite Café
        if (parsed.businesses?.[0]?.name !== 'FreshBite Café') {
          console.log('Migrating database to FreshBite Café initial profile...');
          const freshData: DatabaseSchema = {
            users: [INITIAL_USER],
            businesses: [INITIAL_BUSINESS],
            feedback: INITIAL_FEEDBACK,
            insights: INITIAL_INSIGHTS,
            recommendations: INITIAL_RECOMMENDATIONS,
            businessIdeas: INITIAL_IDEAS,
            syncSources: INITIAL_SOURCES,
            syncLogs: INITIAL_LOGS,
          };
          this.saveDatabase(freshData);
          return freshData;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to load database file, resetting to initial state:', err);
    }

    const initialData: DatabaseSchema = {
      users: [INITIAL_USER],
      businesses: [INITIAL_BUSINESS],
      feedback: INITIAL_FEEDBACK,
      insights: INITIAL_INSIGHTS,
      recommendations: INITIAL_RECOMMENDATIONS,
      businessIdeas: INITIAL_IDEAS,
      syncSources: INITIAL_SOURCES,
      syncLogs: INITIAL_LOGS,
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Users & Business ---
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.saveDatabase(this.data);
    return user;
  }

  getBusinessById(id: string): BusinessProfile | undefined {
    return this.data.businesses.find(b => b.id === id) || this.data.businesses[0];
  }

  createBusiness(business: BusinessProfile): BusinessProfile {
    this.data.businesses.push(business);
    this.saveDatabase(this.data);
    return business;
  }

  updateBusiness(id: string, updates: Partial<BusinessProfile>): BusinessProfile | null {
    const idx = this.data.businesses.findIndex(b => b.id === id);
    if (idx === -1) {
      if (this.data.businesses.length > 0) {
        this.data.businesses[0] = {
          ...this.data.businesses[0],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.saveDatabase(this.data);
        return this.data.businesses[0];
      }
      return null;
    }
    this.data.businesses[idx] = {
      ...this.data.businesses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase(this.data);
    return this.data.businesses[idx];
  }

  // --- Feedback ---
  getFeedback(businessId: string): Feedback[] {
    return this.data.feedback.filter(f => f.businessId === businessId || !f.businessId);
  }

  getFeedbackById(id: string): Feedback | undefined {
    return this.data.feedback.find(f => f.id === id);
  }

  addFeedback(feedback: Feedback): Feedback {
    if (feedback.sourceReviewId) {
      const exists = this.data.feedback.some(
        f => f.sourceReviewId === feedback.sourceReviewId
      );
      if (exists) {
        return this.data.feedback.find(
          f => f.sourceReviewId === feedback.sourceReviewId
        )!;
      }
    }
    this.data.feedback.unshift(feedback);
    this.saveDatabase(this.data);
    return feedback;
  }

  updateFeedback(id: string, updates: Partial<Feedback>): Feedback | null {
    const idx = this.data.feedback.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.data.feedback[idx] = {
      ...this.data.feedback[idx],
      ...updates,
    };
    this.saveDatabase(this.data);
    return this.data.feedback[idx];
  }

  deleteFeedback(id: string): boolean {
    const initialLen = this.data.feedback.length;
    this.data.feedback = this.data.feedback.filter(f => f.id !== id);
    if (this.data.feedback.length !== initialLen) {
      this.saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // --- Dashboard Calculation ---
  getDashboardStats(businessId: string): DashboardStats {
    const items = this.getFeedback(businessId);
    const totalReviews = items.length;

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let ratingSum = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let newReviewsCount = 0;

    const complaintsMap: Record<string, number> = {};
    const topicsMap: Record<string, { count: number; sentimentCount: { pos: number; neu: number; neg: number } }> = {};

    items.forEach(f => {
      if (f.sentiment === 'positive') positiveCount++;
      else if (f.sentiment === 'neutral') neutralCount++;
      else if (f.sentiment === 'negative') negativeCount++;

      ratingSum += f.rating;
      if (ratingDistribution[f.rating] !== undefined) {
        ratingDistribution[f.rating]++;
      }

      if (f.isNew) newReviewsCount++;

      // Aggregate complaints
      f.complaints?.forEach(c => {
        const clean = c.trim();
        if (clean) complaintsMap[clean] = (complaintsMap[clean] || 0) + 1;
      });

      // Aggregate aspect topics
      f.aspectSentiment?.forEach(asp => {
        if (!topicsMap[asp.aspect]) {
          topicsMap[asp.aspect] = { count: 0, sentimentCount: { pos: 0, neu: 0, neg: 0 } };
        }
        topicsMap[asp.aspect].count++;
        if (asp.sentiment === 'positive') topicsMap[asp.aspect].sentimentCount.pos++;
        else if (asp.sentiment === 'neutral') topicsMap[asp.aspect].sentimentCount.neu++;
        else topicsMap[asp.aspect].sentimentCount.neg++;
      });
    });

    const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;
    const satisfactionScore = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;

    const sentimentPercentages = {
      positive: totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
      neutral: totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0,
      negative: totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0,
    };

    const topComplaints = Object.entries(complaintsMap)
      .map(([issue, count]) => ({
        issue,
        count,
        severity: count > 3 ? 'High' : count > 1 ? 'Medium' : 'Low',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTopics = Object.entries(topicsMap)
      .map(([topic, data]) => {
        let sent: 'positive' | 'neutral' | 'negative' = 'positive';
        if (data.sentimentCount.neg > data.sentimentCount.pos && data.sentimentCount.neg > data.sentimentCount.neu) {
          sent = 'negative';
        } else if (data.sentimentCount.neu > data.sentimentCount.pos) {
          sent = 'neutral';
        }
        return {
          topic,
          count: data.count,
          sentiment: sent,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalReviews,
      positiveCount,
      neutralCount,
      negativeCount,
      averageRating,
      sentimentPercentages,
      ratingDistribution: ratingDistribution as { 1: number; 2: number; 3: number; 4: number; 5: number },
      recentFeedback: items.slice(0, 8),
      topComplaints,
      topTopics,
      satisfactionScore,
      newReviewsCount,
    };
  }

  // --- Insights ---
  getInsights(businessId: string): CustomerInsight[] {
    return this.data.insights.filter(i => i.businessId === businessId || !i.businessId);
  }

  setInsights(businessId: string, insights: CustomerInsight[]) {
    this.data.insights = [
      ...this.data.insights.filter(i => i.businessId !== businessId),
      ...insights,
    ];
    this.saveDatabase(this.data);
  }

  // --- Recommendations ---
  getRecommendations(businessId: string): Recommendation[] {
    return this.data.recommendations.filter(r => r.businessId === businessId || !r.businessId);
  }

  updateRecommendationStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed'): Recommendation | null {
    const idx = this.data.recommendations.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recommendations[idx] = {
      ...this.data.recommendations[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase(this.data);
    return this.data.recommendations[idx];
  }

  setRecommendations(businessId: string, recs: Recommendation[]) {
    this.data.recommendations = [
      ...this.data.recommendations.filter(r => r.businessId !== businessId),
      ...recs,
    ];
    this.saveDatabase(this.data);
  }

  // --- Business Ideas ---
  getBusinessIdeas(businessId: string): BusinessIdea[] {
    return this.data.businessIdeas.filter(b => b.businessId === businessId || !b.businessId);
  }

  setBusinessIdeas(businessId: string, ideas: BusinessIdea[]) {
    this.data.businessIdeas = [
      ...this.data.businessIdeas.filter(b => b.businessId !== businessId),
      ...ideas,
    ];
    this.saveDatabase(this.data);
  }

  // --- Sync Sources & Logs ---
  getSyncSources(): SyncSource[] {
    return this.data.syncSources;
  }

  updateSyncSource(id: string, updates: Partial<SyncSource>): SyncSource | null {
    const idx = this.data.syncSources.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.syncSources[idx] = {
      ...this.data.syncSources[idx],
      ...updates,
    };
    this.saveDatabase(this.data);
    return this.data.syncSources[idx];
  }

  getSyncLogs(): SyncLog[] {
    return this.data.syncLogs;
  }

  addSyncLog(log: SyncLog) {
    this.data.syncLogs.unshift(log);
    if (this.data.syncLogs.length > 50) {
      this.data.syncLogs.pop();
    }
    this.saveDatabase(this.data);
  }

  clearNewBadges(businessId: string) {
    let changed = false;
    this.data.feedback.forEach(f => {
      if ((f.businessId === businessId || !f.businessId) && f.isNew) {
        f.isNew = false;
        changed = true;
      }
    });
    if (changed) {
      this.saveDatabase(this.data);
    }
  }
}

export const db = new DatabaseManager();
