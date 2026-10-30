import { GoogleGenAI, Type } from '@google/genai';
import { AspectSentiment, SentimentType, CustomerInsight, Recommendation, BusinessIdea, Feedback } from '../types/index.ts';

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface AspectAnalysisResult {
  overallSentiment: SentimentType;
  sentimentScore: number;
  primaryAspect: string;
  aspects: AspectSentiment[];
  customerLikes: string[];
  customerDislikes: string[];
  customerExpectations: string[];
  suggestions: string[];
  complaints: string[];
  rootCauses: string[];
}

function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI response timed out')), ms)),
  ]);
}

export async function analyzeReviewText(
  reviewContent: string,
  rating: number,
  businessCategory: string = 'General Business'
): Promise<AspectAnalysisResult> {
  if (!aiClient) {
    return fallbackAspectAnalysis(reviewContent, rating);
  }

  try {
    const prompt = `Analyze this customer review for a ${businessCategory} business.
Review: "${reviewContent}"
Star Rating: ${rating} out of 5.

Perform a thorough aspect-based sentiment analysis.
Identify specific distinct aspects (e.g. Product Quality, Delivery Speed, Customer Service, Pricing, Ambiance, Packaging, Usability, etc.).
Important: If the customer liked one thing (e.g. product quality) but disliked another (e.g. shipping delay), evaluate each aspect separately with its individual sentiment (positive, neutral, negative) and score (0-100). Do NOT assign a single blanket sentiment to the whole text if it expresses mixed views.

Also extract:
- Customer likes (exact or summarized positive mentions)
- Customer dislikes
- Customer expectations (what they were hoping for or expect from the service)
- Recurring or specific complaints
- Customer suggestions for improvement
- Root causes if reasonably inferable from context.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are ReviewLens AI, an expert customer feedback intelligence and aspect-based sentiment analysis engine for multi-industry businesses.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallSentiment: {
                type: Type.STRING,
                description: 'Must be "positive", "neutral", or "negative"',
              },
              sentimentScore: {
                type: Type.INTEGER,
                description: 'Score from 0 to 100',
              },
              primaryAspect: {
                type: Type.STRING,
                description: 'The dominant aspect discussed in this review',
              },
              aspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    aspect: { type: Type.STRING },
                    sentiment: { type: Type.STRING, description: '"positive", "neutral", or "negative"' },
                    score: { type: Type.INTEGER, description: '0 to 100' },
                    explanation: { type: Type.STRING },
                  },
                  required: ['aspect', 'sentiment', 'score', 'explanation'],
                },
              },
              customerLikes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              customerDislikes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              customerExpectations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              complaints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              rootCauses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'overallSentiment',
              'sentimentScore',
              'primaryAspect',
              'aspects',
              'customerLikes',
              'customerDislikes',
              'customerExpectations',
              'suggestions',
              'complaints',
              'rootCauses',
            ],
          },
        },
      }),
      7000
    );

    const parsed = JSON.parse(response.text || '{}');
    const validSentiment = (s: string): SentimentType =>
      s === 'positive' || s === 'neutral' || s === 'negative' ? s : rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

    return {
      overallSentiment: validSentiment(parsed.overallSentiment),
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : rating * 20,
      primaryAspect: parsed.primaryAspect || 'General Feedback',
      aspects: (parsed.aspects || []).map((a: any) => ({
        aspect: a.aspect,
        sentiment: validSentiment(a.sentiment),
        score: a.score ?? 50,
        explanation: a.explanation ?? '',
      })),
      customerLikes: parsed.customerLikes || [],
      customerDislikes: parsed.customerDislikes || [],
      customerExpectations: parsed.customerExpectations || [],
      suggestions: parsed.suggestions || [],
      complaints: parsed.complaints || [],
      rootCauses: parsed.rootCauses || [],
    };
  } catch (err) {
    console.warn('Gemini analysis failed or API key error, falling back to local NLP:', err);
    return fallbackAspectAnalysis(reviewContent, rating);
  }
}

export async function generateSynthesizedInsights(
  feedbackList: Feedback[],
  businessName: string,
  businessCategory: string
): Promise<{
  insights: CustomerInsight[];
  recommendations: Recommendation[];
  businessIdeas: BusinessIdea[];
}> {
  if (!feedbackList || feedbackList.length === 0) {
    return { insights: [], recommendations: [], businessIdeas: [] };
  }

  const reviewSnippets = feedbackList.slice(0, 20).map(f => ({
    name: f.customerName,
    rating: f.rating,
    source: f.feedbackSource,
    content: f.reviewContent,
    aspects: f.aspectSentiment,
  }));

  if (!aiClient) {
    return fallbackSynthesis(feedbackList, businessName);
  }

  try {
    const prompt = `Synthesize customer feedback for "${businessName}" in the "${businessCategory}" industry.
Here are recent customer reviews with aspect details:
${JSON.stringify(reviewSnippets, null, 2)}

Generate:
1. 4-5 High-level Customer Insights (frequently mentioned topics, preferences, repeated complaints, expectations, strengths, weaknesses) with representative customer quotes.
2. 3-4 Actionable Recommendations with identified problem, direct supporting customer quote, suggested improvement, priority (High/Medium/Low), expected measurable benefit, and concrete recommended action.
3. 2-3 Business Ideas (New Product, Service Improvement, Additional Feature, Customer Experience, or Market Opportunity) backed by customer expectations and preferences.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the lead product and CX strategist generating executive insights and prioritized recommendations based on real customer feedback data.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    frequency: { type: Type.INTEGER },
                    sentiment: { type: Type.STRING, description: '"positive", "neutral", or "negative"' },
                    description: { type: Type.STRING },
                    representativeQuotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    category: { type: Type.STRING, description: '"preference", "complaint", "expectation", "strength", or "weakness"' },
                  },
                  required: ['topic', 'frequency', 'sentiment', 'description', 'representativeQuotes', 'category'],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    identifiedProblem: { type: Type.STRING },
                    supportingCustomerFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedImprovement: { type: Type.STRING },
                    priority: { type: Type.STRING, description: '"High", "Medium", or "Low"' },
                    expectedBenefit: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                  },
                  required: ['identifiedProblem', 'supportingCustomerFeedback', 'suggestedImprovement', 'priority', 'expectedBenefit', 'recommendedAction'],
                },
              },
              businessIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    supportingFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
                    feasibility: { type: Type.STRING, description: '"High", "Medium", or "Low"' },
                    expectedImpact: { type: Type.STRING },
                  },
                  required: ['title', 'category', 'rationale', 'supportingFeedback', 'feasibility', 'expectedImpact'],
                },
              },
            },
            required: ['insights', 'recommendations', 'businessIdeas'],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    const now = new Date().toISOString();

    const validSentiment = (s: string): SentimentType =>
      s === 'positive' || s === 'neutral' || s === 'negative' ? s : 'neutral';

    const insights: CustomerInsight[] = (parsed.insights || []).map((ins: any, i: number) => ({
      id: `ins-ai-${Date.now()}-${i}`,
      businessId: feedbackList[0].businessId,
      topic: ins.topic,
      frequency: ins.frequency ?? 12,
      sentiment: validSentiment(ins.sentiment),
      description: ins.description,
      representativeQuotes: ins.representativeQuotes || [],
      category: ['preference', 'complaint', 'expectation', 'strength', 'weakness'].includes(ins.category)
        ? ins.category
        : 'strength',
    }));

    const recommendations: Recommendation[] = (parsed.recommendations || []).map((r: any, i: number) => ({
      id: `rec-ai-${Date.now()}-${i}`,
      businessId: feedbackList[0].businessId,
      identifiedProblem: r.identifiedProblem,
      supportingCustomerFeedback: r.supportingCustomerFeedback || [],
      suggestedImprovement: r.suggestedImprovement,
      priority: ['High', 'Medium', 'Low'].includes(r.priority) ? r.priority : 'Medium',
      expectedBenefit: r.expectedBenefit,
      recommendedAction: r.recommendedAction,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    }));

    const businessIdeas: BusinessIdea[] = (parsed.businessIdeas || []).map((b: any, i: number) => ({
      id: `idea-ai-${Date.now()}-${i}`,
      businessId: feedbackList[0].businessId,
      title: b.title,
      category: b.category || 'Service Improvement',
      rationale: b.rationale,
      supportingFeedback: b.supportingFeedback || [],
      feasibility: ['High', 'Medium', 'Low'].includes(b.feasibility) ? b.feasibility : 'Medium',
      expectedImpact: b.expectedImpact,
    }));

    return { insights, recommendations, businessIdeas };
  } catch (err) {
    console.warn('Gemini synthesis failed, using domain fallback:', err);
    return fallbackSynthesis(feedbackList, businessName);
  }
}

// Resilient fallback aspect extractor
function fallbackAspectAnalysis(reviewContent: string, rating: number): AspectAnalysisResult {
  const lower = reviewContent.toLowerCase();
  const aspects: AspectSentiment[] = [];
  const likes: string[] = [];
  const dislikes: string[] = [];
  const complaints: string[] = [];
  const suggestions: string[] = [];
  const expectations: string[] = [];
  const rootCauses: string[] = [];

  const positiveWords = ['great', 'excellent', 'love', 'best', 'clean', 'attentive', 'friendly', 'fast', 'top-tier', 'wonderful', 'smooth'];
  const negativeWords = ['slow', 'delay', 'wait', 'frustrating', 'bad', 'poor', 'issue', 'problem', 'sold out', 'bottleneck', 'expensive', 'small'];

  // Check specific aspects
  if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('transit')) {
    const isNeg = lower.includes('slow') || lower.includes('delay') || lower.includes('day') || lower.includes('lost');
    aspects.push({
      aspect: 'Shipping & Delivery',
      sentiment: isNeg ? 'negative' : 'positive',
      score: isNeg ? 25 : 85,
      explanation: isNeg ? 'Customer experienced fulfillment or transit delay.' : 'Fast, reliable delivery dispatch.',
    });
    if (isNeg) {
      dislikes.push('Delayed delivery time');
      complaints.push('Slow delivery transit');
      rootCauses.push('Courier carrier backlog or order processing lag');
    } else {
      likes.push('Fast delivery');
    }
  }

  if (lower.includes('quality') || lower.includes('craft') || lower.includes('material') || lower.includes('product')) {
    const isPos = lower.includes('good') || lower.includes('great') || lower.includes('top') || lower.includes('love') || lower.includes('excellent');
    aspects.push({
      aspect: 'Product Quality',
      sentiment: isPos ? 'positive' : 'negative',
      score: isPos ? 92 : 30,
      explanation: isPos ? 'Customer praised quality and craftsmanship.' : 'Customer expressed dissatisfaction with product quality.',
    });
    if (isPos) likes.push('High build quality & craftsmanship');
    else complaints.push('Product quality below expectation');
  }

  if (lower.includes('staff') || lower.includes('service') || lower.includes('support') || lower.includes('waiter') || lower.includes('cashier')) {
    const isPos = lower.includes('attentive') || lower.includes('helpful') || lower.includes('friendly') || lower.includes('great') || rating >= 4;
    aspects.push({
      aspect: 'Customer Service',
      sentiment: isPos ? 'positive' : 'negative',
      score: isPos ? 90 : 35,
      explanation: isPos ? 'Helpful and courteous team members.' : 'Service interaction was slow or unsatisfactory.',
    });
    if (isPos) likes.push('Helpful, friendly team members');
    else complaints.push('Customer service interaction friction');
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('worth')) {
    aspects.push({
      aspect: 'Pricing & Value',
      sentiment: lower.includes('expensive') ? 'neutral' : 'positive',
      score: lower.includes('expensive') ? 55 : 80,
      explanation: lower.includes('expensive') ? 'Premium price point perceived as somewhat high.' : 'Good price-to-value ratio.',
    });
  }

  if (lower.includes('atmosphere') || lower.includes('store') || lower.includes('interior') || lower.includes('ambiance')) {
    aspects.push({
      aspect: 'Atmosphere & Design',
      sentiment: 'positive',
      score: 95,
      explanation: 'Inspiring architecture and pleasant physical environment.',
    });
    likes.push('Store atmosphere and interior design');
  }

  if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('should') || lower.includes('introduce') || lower.includes('add')) {
    suggestions.push('Review customer feature requests and operational adjustments.');
  }

  // Ensure at least one primary aspect
  if (aspects.length === 0) {
    const sent: SentimentType = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
    aspects.push({
      aspect: 'General Experience',
      sentiment: sent,
      score: rating * 20,
      explanation: `Customer overall rating of ${rating} stars.`,
    });
  }

  const primaryAspect = aspects[0].aspect;
  const overallSentiment: SentimentType = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
  const sentimentScore = Math.min(100, Math.max(10, Math.round(rating * 19.5)));

  return {
    overallSentiment,
    sentimentScore,
    primaryAspect,
    aspects,
    customerLikes: likes.length ? likes : ['Overall positive impression'],
    customerDislikes: dislikes,
    customerExpectations: expectations.length ? expectations : ['Reliable service matching advertised standards'],
    suggestions,
    complaints,
    rootCauses,
  };
}

function fallbackSynthesis(feedbackList: Feedback[], businessName: string) {
  const bizId = feedbackList[0]?.businessId || 'biz-01';
  const now = new Date().toISOString();

  const insights: CustomerInsight[] = [
    {
      id: `ins-fb-01`,
      businessId: bizId,
      topic: 'Core Product Quality & Craftsmanship',
      frequency: Math.round(feedbackList.length * 0.7),
      sentiment: 'positive',
      description: 'Customers frequently commend the premium quality and design standards of offerings.',
      representativeQuotes: feedbackList.filter(f => f.sentiment === 'positive').slice(0, 2).map(f => f.reviewContent),
      category: 'strength',
    },
    {
      id: `ins-fb-02`,
      businessId: bizId,
      topic: 'Operational Responsiveness & Wait Times',
      frequency: Math.round(feedbackList.length * 0.4),
      sentiment: 'negative',
      description: 'Peak hour congestion and fulfillment transit delays represent primary areas of customer friction.',
      representativeQuotes: feedbackList.filter(f => f.sentiment === 'negative').slice(0, 2).map(f => f.reviewContent),
      category: 'complaint',
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: `rec-fb-01`,
      businessId: bizId,
      identifiedProblem: 'Operational delays during peak intervals lead to drop-offs in customer satisfaction.',
      supportingCustomerFeedback: feedbackList.filter(f => f.complaints?.length).slice(0, 1).map(f => `"${f.reviewContent}" - ${f.customerName}`),
      suggestedImprovement: 'Implement automated queue notifications and streamlined express checkout paths.',
      priority: 'High',
      expectedBenefit: 'Reduces peak customer wait times and prevents abandoned sales.',
      recommendedAction: 'Audit high-volume operational hours and dedicate dedicated fulfillment staff.',
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const businessIdeas: BusinessIdea[] = [
    {
      id: `idea-fb-01`,
      businessId: bizId,
      title: 'Digital Customer Loyalty & Preferred Perks Program',
      category: 'Customer Experience',
      rationale: 'High repeat visit enthusiasm creates an immediate opportunity for digital rewards.',
      supportingFeedback: feedbackList.filter(f => f.rating >= 4).slice(0, 1).map(f => `"${f.reviewContent}" - ${f.customerName}`),
      feasibility: 'High',
      expectedImpact: 'Drives repeat retention and higher customer lifetime value.',
    },
  ];

  return { insights, recommendations, businessIdeas };
}
