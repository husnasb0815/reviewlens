export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessId: string;
  businessName: string;
  businessCategory: string;
  createdAt: string;
}

export type BusinessCategory =
  | 'Food and Beverage'
  | 'Retail'
  | 'Fashion'
  | 'Healthcare'
  | 'Education'
  | 'Hospitality'
  | 'E-commerce'
  | 'Technology'
  | 'Other';

export interface BusinessProfile {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentType;
  score: number;
  explanation: string;
}

export interface FeedbackImage {
  id: string;
  url: string;
  caption?: string;
  isCustomerUpload?: boolean;
}

export interface Feedback {
  id: string;
  businessId: string;
  customerName: string;
  customerAvatar?: string;
  reviewContent: string;
  rating: number; // 1 to 5
  feedbackSource: 'Google Reviews' | 'Website' | 'Instagram' | 'Facebook' | 'Manual Entry' | 'CSV Import';
  sourceReviewId: string;
  reviewDate: string;
  sentiment: SentimentType;
  sentimentScore: number; // 0 to 100
  aspectSentiment: AspectSentiment[];
  primaryAspect: string;
  customerLikes: string[];
  customerDislikes: string[];
  customerExpectations: string[];
  suggestions: string[];
  complaints: string[];
  rootCauses: string[];
  images?: FeedbackImage[];
  isNew?: boolean;
  aiAnalyzed: boolean;
  createdAt: string;
}

export interface CustomerInsight {
  id: string;
  businessId: string;
  topic: string;
  frequency: number;
  sentiment: SentimentType;
  description: string;
  representativeQuotes: string[];
  category: 'preference' | 'complaint' | 'expectation' | 'strength' | 'weakness';
}

export type RecommendationPriority = 'High' | 'Medium' | 'Low';
export type RecommendationStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Recommendation {
  id: string;
  businessId: string;
  identifiedProblem: string;
  supportingCustomerFeedback: string[];
  suggestedImprovement: string;
  priority: RecommendationPriority;
  expectedBenefit: string;
  recommendedAction: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessIdea {
  id: string;
  businessId: string;
  title: string;
  category: 'New Product' | 'Service Improvement' | 'Additional Feature' | 'Customer Experience' | 'Market Opportunity';
  rationale: string;
  supportingFeedback: string[];
  feasibility: 'High' | 'Medium' | 'Low';
  expectedImpact: string;
}

export interface SyncSource {
  id: string;
  name: 'Google Reviews' | 'Website Feedback' | 'Instagram' | 'Facebook' | 'CSV Import' | 'Manual Entry';
  connected: boolean;
  autoSync: boolean;
  frequencyMinutes: number; // e.g. 15, 30, 60
  lastSyncTime: string | null;
  nextSyncTime: string | null;
  reviewsCollected: number;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  errorMessage?: string;
  authIdentifier?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  platform: string;
  reviewsCollected: number;
  status: 'success' | 'failed';
  details: string;
}

export interface DashboardStats {
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageRating: number;
  sentimentPercentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentFeedback: Feedback[];
  topComplaints: Array<{ issue: string; count: number; severity: string }>;
  topTopics: Array<{ topic: string; count: number; sentiment: SentimentType }>;
  satisfactionScore: number;
  newReviewsCount: number;
}
