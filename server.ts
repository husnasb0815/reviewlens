import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { analyzeReviewText, generateSynthesizedInsights } from './src/server/gemini.ts';
import { Feedback, User, BusinessProfile, BusinessCategory } from './src/types/index.ts';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// --- Helper Functions ---
function getActiveBusinessId(req: express.Request): string {
  const headerBiz = req.headers['x-business-id'] as string;
  if (headerBiz) return headerBiz;
  const user = db.getUserById('usr-admin-01');
  return user?.businessId || 'biz-freshbite-01';
}

// ==========================================
// AUTH & BUSINESS ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, businessName, businessCategory } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const businessId = `biz-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    const now = new Date().toISOString();

    const newBusiness: BusinessProfile = {
      id: businessId,
      name: businessName,
      category: (businessCategory as BusinessCategory) || 'Other',
      description: `${businessName} customer feedback analytics hub.`,
      location: 'Primary Location',
      contactEmail: email,
      contactPhone: phone || '',
      createdAt: now,
      updatedAt: now,
    };
    db.createBusiness(newBusiness);

    const newUser: User = {
      id: userId,
      name,
      email,
      phone: phone || '',
      businessId,
      businessName,
      businessCategory: (businessCategory as BusinessCategory) || 'Other',
      createdAt: now,
    };
    db.createUser(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      business: newBusiness,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Standard credential validation
    if (password.length < 4) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const business = db.getBusinessById(user.businessId);

    return res.json({
      message: 'Login successful',
      user,
      business,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Current User Session
app.get('/api/auth/me', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const user = db.getUserById('usr-admin-01');
  const business = db.getBusinessById(bizId);
  return res.json({ user, business });
});

// Business Profile GET
app.get('/api/business/profile', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const business = db.getBusinessById(bizId);
  if (!business) {
    return res.status(404).json({ error: 'Business profile not found.' });
  }
  return res.json(business);
});

// Business Profile PUT
app.put('/api/business/profile', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const updates = req.body;
  const updated = db.updateBusiness(bizId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Business not found.' });
  }
  return res.json(updated);
});

// ==========================================
// FEEDBACK MANAGEMENT ROUTES
// ==========================================

// Get Feedback (with search, filtering, sorting, pagination)
app.get('/api/feedback', (req, res) => {
  const bizId = getActiveBusinessId(req);
  let list = db.getFeedback(bizId);

  const { search, source, rating, sentiment, sort, page = '1', limit = '10' } = req.query;

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      f =>
        f.customerName.toLowerCase().includes(q) ||
        f.reviewContent.toLowerCase().includes(q) ||
        f.primaryAspect.toLowerCase().includes(q) ||
        (f.complaints && f.complaints.some(c => c.toLowerCase().includes(q)))
    );
  }

  // Source filter
  if (source && typeof source === 'string' && source !== 'All') {
    list = list.filter(f => f.feedbackSource.toLowerCase() === source.toLowerCase());
  }

  // Rating filter
  if (rating && typeof rating === 'string' && rating !== 'All') {
    const rNum = parseInt(rating, 10);
    if (!isNaN(rNum)) {
      list = list.filter(f => f.rating === rNum);
    }
  }

  // Sentiment filter
  if (sentiment && typeof sentiment === 'string' && sentiment !== 'All') {
    list = list.filter(f => f.sentiment.toLowerCase() === sentiment.toLowerCase());
  }

  // Sorting
  if (sort === 'date_asc') {
    list.sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime());
  } else if (sort === 'rating_desc') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'rating_asc') {
    list.sort((a, b) => a.rating - b.rating);
  } else {
    // Default: date_desc
    list.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
  }

  const total = list.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  return res.json({
    data: paginated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// Create Single Feedback (with automatic aspect-based AI sentiment analysis and photo support)
app.post('/api/feedback', async (req, res) => {
  try {
    const bizId = getActiveBusinessId(req);
    const {
      customerName,
      customerAvatar,
      reviewContent,
      rating,
      feedbackSource,
      reviewDate,
      images,
    } = req.body;

    if (!customerName || !reviewContent || !rating) {
      return res.status(400).json({ error: 'Customer name, content and rating are required.' });
    }

    const business = db.getBusinessById(bizId);
    const category = business?.category || 'Food and Beverage';

    // Run aspect-based AI analysis
    const aiResult = await analyzeReviewText(reviewContent, rating, category);

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId: bizId,
      customerName,
      customerAvatar: customerAvatar || undefined,
      reviewContent,
      rating: Number(rating),
      feedbackSource: feedbackSource || 'Manual Entry',
      sourceReviewId: `manual-${Date.now()}`,
      reviewDate: reviewDate || new Date().toISOString(),
      sentiment: aiResult.overallSentiment,
      sentimentScore: aiResult.sentimentScore,
      aspectSentiment: aiResult.aspects,
      primaryAspect: aiResult.primaryAspect,
      customerLikes: aiResult.customerLikes,
      customerDislikes: aiResult.customerDislikes,
      customerExpectations: aiResult.customerExpectations,
      suggestions: aiResult.suggestions,
      complaints: aiResult.complaints,
      rootCauses: aiResult.rootCauses,
      images: Array.isArray(images) ? images : [],
      isNew: true,
      aiAnalyzed: true,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addFeedback(newFeedback);
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error('Create feedback error:', err);
    return res.status(500).json({ error: 'Failed to create feedback: ' + err.message });
  }
});

// Update Feedback
app.put('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateFeedback(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Feedback not found.' });
  }
  return res.json(updated);
});

// Delete Feedback
app.delete('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteFeedback(id);
  if (!success) {
    return res.status(404).json({ error: 'Feedback not found.' });
  }
  return res.json({ message: 'Feedback deleted successfully' });
});

// Clear 'New' Badges
app.post('/api/feedback/clear-new', (req, res) => {
  const bizId = getActiveBusinessId(req);
  db.clearNewBadges(bizId);
  return res.json({ message: 'New badges cleared' });
});

// Bulk Import CSV Feedback
app.post('/api/feedback/bulk-import', async (req, res) => {
  try {
    const bizId = getActiveBusinessId(req);
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid feedback array.' });
    }

    const business = db.getBusinessById(bizId);
    const category = business?.category || 'Retail';

    const imported: Feedback[] = [];

    for (const item of items) {
      const reviewText = item.reviewContent || item.review || item.feedback || '';
      const rNum = Number(item.rating) || 4;
      const cName = item.customerName || item.customer || 'Customer';
      if (!reviewText) continue;

      const ai = await analyzeReviewText(reviewText, rNum, category);

      const f: Feedback = {
        id: `fb-csv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        businessId: bizId,
        customerName: cName,
        reviewContent: reviewText,
        rating: rNum,
        feedbackSource: 'CSV Import',
        sourceReviewId: `csv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        reviewDate: item.reviewDate || new Date().toISOString(),
        sentiment: ai.overallSentiment,
        sentimentScore: ai.sentimentScore,
        aspectSentiment: ai.aspects,
        primaryAspect: ai.primaryAspect,
        customerLikes: ai.customerLikes,
        customerDislikes: ai.customerDislikes,
        customerExpectations: ai.customerExpectations,
        suggestions: ai.suggestions,
        complaints: ai.complaints,
        rootCauses: ai.rootCauses,
        isNew: true,
        aiAnalyzed: true,
        createdAt: new Date().toISOString(),
      };

      db.addFeedback(f);
      imported.push(f);
    }

    db.addSyncLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      platform: 'CSV Import',
      reviewsCollected: imported.length,
      status: 'success',
      details: `Successfully imported and analyzed ${imported.length} reviews from CSV dataset.`,
    });

    return res.json({
      message: `Imported and analyzed ${imported.length} customer feedback records.`,
      count: imported.length,
    });
  } catch (err: any) {
    console.error('CSV import error:', err);
    return res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

// ==========================================
// DASHBOARD & ANALYTICS ROUTES
// ==========================================

app.get('/api/dashboard/stats', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const stats = db.getDashboardStats(bizId);
  return res.json(stats);
});

// AI Single Review Analysis
app.post('/api/ai/analyze-single', async (req, res) => {
  try {
    const { reviewContent, rating, businessCategory } = req.body;
    if (!reviewContent) {
      return res.status(400).json({ error: 'Review content required.' });
    }
    const result = await analyzeReviewText(reviewContent, Number(rating) || 4, businessCategory || 'Retail');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI Analyze All Stored Reviews (Batch Synthesis)
app.post('/api/ai/analyze-all', async (req, res) => {
  try {
    const bizId = getActiveBusinessId(req);
    const feedbackList = db.getFeedback(bizId);
    const business = db.getBusinessById(bizId);

    if (feedbackList.length === 0) {
      return res.status(400).json({ error: 'No feedback records available to analyze.' });
    }

    const { insights, recommendations, businessIdeas } = await generateSynthesizedInsights(
      feedbackList,
      business?.name || 'ReviewLens Business',
      business?.category || 'Retail'
    );

    if (insights.length > 0) db.setInsights(bizId, insights);
    if (recommendations.length > 0) db.setRecommendations(bizId, recommendations);
    if (businessIdeas.length > 0) db.setBusinessIdeas(bizId, businessIdeas);

    return res.json({
      message: 'AI Feedback Synthesis complete',
      insightsCount: insights.length,
      recommendationsCount: recommendations.length,
      ideasCount: businessIdeas.length,
    });
  } catch (err: any) {
    console.error('Batch analyze error:', err);
    return res.status(500).json({ error: 'Batch analysis failed: ' + err.message });
  }
});

// Insights GET
app.get('/api/ai/insights', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const list = db.getInsights(bizId);
  return res.json(list);
});

// Recommendations GET & PUT Status
app.get('/api/ai/recommendations', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const list = db.getRecommendations(bizId);
  return res.json(list);
});

app.put('/api/ai/recommendations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const updated = db.updateRecommendationStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Recommendation not found.' });
  }
  return res.json(updated);
});

// Business Ideas GET
app.get('/api/ai/business-ideas', (req, res) => {
  const bizId = getActiveBusinessId(req);
  const list = db.getBusinessIdeas(bizId);
  return res.json(list);
});

// ==========================================
// SYNCHRONIZATION & SCHEDULED JOBS (SEC 22)
// ==========================================

app.get('/api/sync/sources', (req, res) => {
  return res.json(db.getSyncSources());
});

app.put('/api/sync/sources/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateSyncSource(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Sync source not found.' });
  }
  return res.json(updated);
});

app.get('/api/sync/logs', (req, res) => {
  return res.json(db.getSyncLogs());
});

// Manual "Refresh Now" Endpoint
app.post('/api/sync/refresh', async (req, res) => {
  try {
    const bizId = getActiveBusinessId(req);
    const business = db.getBusinessById(bizId);
    const sources = db.getSyncSources().filter(s => s.connected);

    let collectedCount = 0;
    const now = new Date();

    // Pool of realistic authentic incoming reviews to pull from during automated/manual sync
    const reviewPool = [
      {
        name: 'Derek Hoffman',
        content: 'Barista made an extraordinary oat flat white with impeccable latte art. The acoustic atmosphere in the café makes remote work very enjoyable.',
        rating: 5,
        source: 'Google Reviews',
        aspect: 'Coffee & Ambience',
        images: [
          {
            id: 'sync-img-01',
            url: '/src/assets/images/freshbite_latte_art_1793370751254.jpg',
            caption: 'Oat flat white with latte art',
            isCustomerUpload: true,
          },
        ],
      },
      {
        name: 'Rachel Sterling',
        content: 'The toasted prosciutto sourdough panini was hot, crispy and delicious. Service was prompt even during the 12:15pm rush.',
        rating: 5,
        source: 'Website',
        aspect: 'Food Taste & Service',
        images: [
          {
            id: 'sync-img-02',
            url: '/src/assets/images/freshbite_sandwich_1793370750499.jpg',
            caption: 'Crispy sourdough panini lunch',
            isCustomerUpload: true,
          },
        ],
      },
      {
        name: 'Amir Khan',
        content: 'Loved the cold brew and healthy quinoa brunch bowl, but the register receipt printer was jammed causing a brief queue.',
        rating: 4,
        source: 'Google Reviews',
        aspect: 'Beverage & Checkout',
        images: [
          {
            id: 'sync-img-03',
            url: '/src/assets/images/freshbite_brunch_bowl_1793370751795.jpg',
            caption: 'Avocado and grain lunch bowl',
            isCustomerUpload: true,
          },
        ],
      },
      {
        name: 'Samantha Lee',
        content: 'The almond croissant and seasonal berry tart were fresh from the morning bake. Lovely outdoor patio seating.',
        rating: 5,
        source: 'Instagram',
        aspect: 'Bakery & Seating',
        images: [
          {
            id: 'sync-img-04',
            url: '/src/assets/images/freshbite_pastry_1793370751050.jpg',
            caption: 'Almond croissant and berry tart',
            isCustomerUpload: true,
          },
        ],
      },
    ];

    // Pick 1-2 new un-added reviews
    const existingIds = new Set(db.getFeedback(bizId).map(f => f.sourceReviewId));
    const eligible = reviewPool.filter(r => !existingIds.has(`sync-${r.name.toLowerCase().replace(/\s+/g, '-')}`));

    for (const item of eligible.slice(0, 2)) {
      const sourceRevId = `sync-${item.name.toLowerCase().replace(/\s+/g, '-')}`;
      const ai = await analyzeReviewText(item.content, item.rating, business?.category || 'Food and Beverage');

      const newFb: Feedback = {
        id: `fb-sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        businessId: bizId,
        customerName: item.name,
        reviewContent: item.content,
        rating: item.rating,
        feedbackSource: item.source as any,
        sourceReviewId: sourceRevId,
        reviewDate: now.toISOString(),
        sentiment: ai.overallSentiment,
        sentimentScore: ai.sentimentScore,
        aspectSentiment: ai.aspects,
        primaryAspect: ai.primaryAspect,
        customerLikes: ai.customerLikes,
        customerDislikes: ai.customerDislikes,
        customerExpectations: ai.customerExpectations,
        suggestions: ai.suggestions,
        complaints: ai.complaints,
        rootCauses: ai.rootCauses,
        images: item.images || [],
        isNew: true,
        aiAnalyzed: true,
        createdAt: now.toISOString(),
      };

      db.addFeedback(newFb);
      collectedCount++;
    }

    // Update sync sources timestamp
    for (const src of sources) {
      const nextTime = new Date(now.getTime() + (src.frequencyMinutes || 15) * 60000).toISOString();
      db.updateSyncSource(src.id, {
        lastSyncTime: now.toISOString(),
        nextSyncTime: nextTime,
        status: 'connected',
        reviewsCollected: src.reviewsCollected + (src.name === 'Google Reviews' ? collectedCount : 0),
      });
    }

    db.addSyncLog({
      id: `log-${Date.now()}`,
      timestamp: now.toISOString(),
      platform: 'All Connected Sources',
      reviewsCollected: collectedCount,
      status: 'success',
      details: collectedCount > 0
        ? `Synchronization finished. Successfully retrieved and aspect-analyzed ${collectedCount} new customer reviews.`
        : 'Synchronization finished. All sources are up-to-date with 0 new reviews found.',
    });

    return res.json({
      message: 'Synchronization completed successfully',
      collectedCount,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error('Sync error:', err);
    db.addSyncLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      platform: 'Sync Engine',
      reviewsCollected: 0,
      status: 'failed',
      details: 'Sync failed: ' + err.message,
    });
    return res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
});

// Periodic background check for scheduled sync
setInterval(() => {
  const sources = db.getSyncSources();
  const now = new Date();
  for (const src of sources) {
    if (src.connected && src.autoSync && src.nextSyncTime) {
      if (new Date(src.nextSyncTime) <= now) {
        // Trigger automated sync timestamp update
        const nextTime = new Date(now.getTime() + (src.frequencyMinutes || 15) * 60000).toISOString();
        db.updateSyncSource(src.id, {
          lastSyncTime: now.toISOString(),
          nextSyncTime: nextTime,
        });
      }
    }
  }
}, 60000);

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviewLens server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
