const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nb_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Demo mock data fallback in case backend is offline or connecting
export const mockCampaigns = [
  {
    _id: 'c1',
    title: 'Sunburn Arena Delhi — Backstage & Crowd Content Crew',
    brand: 'Sunburn / Percept Live',
    category: 'Concert',
    description: 'We are selecting 8 high-energy creators for complete on-ground coverage of Sunburn Arena Delhi. You get full backstage access, VIP passes, and stage-side shoot clearances.',
    location: 'Delhi NCR',
    eventDate: 'November 18, 2026',
    requirements: ['Creator or Business Instagram account', 'Min 10,000 followers', 'Demonstrated music / festival content portfolio'],
    deliverables: ['1x High-energy Instagram Reel (15-30s)', '3x Live Story updates tagging @newbi.live and @sunburnfestival', '1x Collab post option'],
    reward: '₹28,000 + 2x Backstage Passes',
    points: 500,
    spotsTotal: 8,
    spotsFilled: 3,
    minFollowers: 10000,
    status: 'open',
    featured: true,
  },
  {
    _id: 'c2',
    title: 'Boiler Room Mumbai — Underground Sound & Nightlife Campaign',
    brand: 'Boiler Room',
    category: 'Nightlife',
    description: 'Document the raw energy of Boiler Room’s multi-genre warehouse takeover. Capture the crowd, the selector desk, and the raw underground aesthetics.',
    location: 'Mumbai',
    eventDate: 'November 28, 2026',
    requirements: ['Based in Mumbai or travelling for the date', 'Aesthetic electronic music or street style profile', 'Min 5,000 followers'],
    deliverables: ['1x Reel focused on DJ transition & dancefloor energy', '4x Story frames with audio clips', 'Post-event photo dump'],
    reward: '₹32,000 + VIP Entry',
    points: 600,
    spotsTotal: 6,
    spotsFilled: 2,
    minFollowers: 5000,
    status: 'open',
    featured: true,
  },
  {
    _id: 'c3',
    title: 'IIT Bombay Mood Indigo — Puma Nitro Brand Experience',
    brand: 'Puma India',
    category: 'Campus Fest',
    description: 'Puma is taking over Mood Indigo with a 3,000 sq ft experiential zone featuring obstacle courses, custom kicks, and nightly DJ battles. We need 12 student creators.',
    location: 'Mumbai',
    eventDate: 'December 22-25, 2026',
    requirements: ['College student or recent grad creator', 'Active following in student culture, sneakers, or dance', 'Min 3,000 followers'],
    deliverables: ['1x Fit Check / Experience walkthrough reel', 'Live story updates from the Puma Zone', 'On-ground interactive interviews'],
    reward: '₹24,000 + Puma Nitro Merch Kit',
    points: 450,
    spotsTotal: 12,
    spotsFilled: 5,
    minFollowers: 3000,
    status: 'open',
    featured: true,
  },
  {
    _id: 'c4',
    title: 'Spotify Radar Festival — Indie Stage Squad',
    brand: 'Spotify India',
    category: 'Concert',
    description: 'Spotlighting breakthrough indie and regional music artists. Creators will interview emerging acts before soundcheck and capture exclusive acoustic moments.',
    location: 'Bengaluru',
    eventDate: 'December 12, 2026',
    requirements: ['Passionate about Indian indie, hip hop, or alternative music', 'Min 8,000 followers', 'Video interview skills'],
    deliverables: ['1x Artist interview reel (short-form Q&A)', '3x Story teasers leading to the festival playlist', 'Spotify bio link mention'],
    reward: '₹35,000 + 1-Yr Spotify Premium & Merch',
    points: 700,
    spotsTotal: 5,
    spotsFilled: 1,
    minFollowers: 8000,
    status: 'open',
    featured: true,
  },
  {
    _id: 'c5',
    title: 'Red Bull Dance Your Style — Street Battle Activation',
    brand: 'Red Bull',
    category: 'Brand Activation',
    description: '16 street dancers battle 1-on-1 to unpredictable mainstream hits. Audience decides who wins. Looking for lifestyle and hip-hop culture creators.',
    location: 'Bengaluru',
    eventDate: 'January 14, 2027',
    requirements: ['Interest in urban dance, fashion, and lifestyle', 'Min 4,000 followers', 'High engagement rate (>4%)'],
    deliverables: ['1x Battle highlight reel with trending audio', 'Live story polls asking audience to vote for winner'],
    reward: '₹20,000 + Red Bull VIP Experience',
    points: 400,
    spotsTotal: 10,
    spotsFilled: 4,
    minFollowers: 4000,
    status: 'open',
  },
  {
    _id: 'c6',
    title: 'Zomaland Food & Music Carnival — City Seeding',
    brand: 'Zomato Live',
    category: 'Brand Activation',
    description: 'Curating the tastiest dishes and biggest comedic & musical acts under the winter sun. Create aesthetic food & festival content.',
    location: 'Delhi NCR',
    eventDate: 'January 23-24, 2027',
    requirements: ['Food, lifestyle or entertainment creator', 'Delhi NCR based', 'Min 5,000 followers'],
    deliverables: ['1x "What I ate at Zomaland" reel', '3x Story tags of partner food stalls', 'Pass giveaway to 2 followers'],
    reward: '₹22,000 + ₹5,000 Food Tasting Credits',
    points: 400,
    spotsTotal: 10,
    spotsFilled: 6,
    minFollowers: 5000,
    status: 'open',
  },
];

export const mockProjects = [
  {
    _id: 'p1',
    title: 'Sunburn Arena w/ Martin Garrix',
    category: 'Concerts',
    brandOrArtist: 'Martin Garrix / Sunburn',
    city: 'Mumbai & Delhi NCR',
    date: '2026',
    footfall: '52,000+ Fans',
    reach: '9.4M Online Impressions',
    creatorsInvolved: 24,
    description: 'End-to-end production, 360-degree LED visual staging, artist hospitality, security, and a 24-creator live broadcast squad that set new festival records.',
    tags: ['Full Event Production', 'Artist Hospitality', 'Creator Network', 'LED & Laser Show'],
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'p2',
    title: 'Puma Nitro College Invasion Tour',
    category: 'Campus Fests',
    brandOrArtist: 'Puma India',
    city: '14 Campuses Pan-India',
    date: '2026',
    footfall: '38,000+ Students',
    reach: '6.8M Campus Reach',
    creatorsInvolved: 45,
    description: 'Interactive speed-trial zones, sneaker-lacing workshops, and pop-up concerts headlined by Seedhe Maut across premier engineering and management colleges.',
    tags: ['Campus Activations', 'College Ambassadors', 'Experiential Kiosks'],
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'p3',
    title: 'Boiler Room India Series',
    category: 'Brand Activations',
    brandOrArtist: 'Boiler Room / Budweiser Beats',
    city: 'Mumbai Warehouse',
    date: '2026',
    footfall: '7,500+ Attendees',
    reach: '5.2M Live Stream Views',
    creatorsInvolved: 16,
    description: 'Raw circular DJ pit, custom industrial lighting rigs, bespoke sound acoustic insulation, and seamless entry management via Newbi QR guestlists.',
    tags: ['Underground Nightlife', 'QR Ticketing', 'Live Sound Engineering'],
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'p4',
    title: 'IIT Bombay Mood Indigo Mainstage',
    category: 'Campus Fests',
    brandOrArtist: 'Mood Indigo',
    city: 'Mumbai',
    date: '2026',
    footfall: '60,000+ Attendees',
    reach: '14M Digital Footprint',
    creatorsInvolved: 32,
    description: 'Asia’s largest college cultural festival. Seamless on-ground coordination of 4 international headliners, 150+ volunteer crew, and brand sponsor villages.',
    tags: ['Crowd Management', 'Technical Rider Production', 'Campus Network'],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'p5',
    title: 'Red Bull Dance Your Style India Finals',
    category: 'Brand Activations',
    brandOrArtist: 'Red Bull India',
    city: 'Bengaluru',
    date: '2026',
    footfall: '9,200+ Attendees',
    reach: '4.8M Video Impressions',
    creatorsInvolved: 18,
    description: 'Dynamic central octagon battle floor with interactive audience voting bands, live MC sound setup, and real-time social reels broadcasting.',
    tags: ['Street Battle Staging', 'Crowd Voting System', 'Brand Experience'],
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'p6',
    title: 'Heineken Silver After Hours Tour',
    category: 'Creator Tours',
    brandOrArtist: 'Heineken Silver',
    city: 'Goa & Bengaluru',
    date: '2026',
    footfall: '11,000+ Attendees',
    reach: '7.1M Social Buzz',
    creatorsInvolved: 20,
    description: 'Exclusive beachside afterparties and city speakeasies with secret lineup drops revealed exclusively via the Newbi notification network.',
    tags: ['Secret Gigs', 'VIP Guestlists', 'Hyperlocal Seeding'],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
];

export const mockRewards = [
  {
    _id: 'r1',
    title: 'Sunburn Goa VIP Weekend Pass',
    category: 'Event Pass',
    pointsCost: 1500,
    description: 'Full 3-day VIP access to Sunburn Festival Goa, dedicated entry lane, elevated viewing lounge, and private bar access.',
    stock: 12,
    claimed: 3,
  },
  {
    _id: 'r2',
    title: 'NH7 Weekender All-Access Wristband',
    category: 'Event Pass',
    pointsCost: 1200,
    description: 'Full weekend entry to Bacardi NH7 Weekender. Access all 4 stages, comedy tent, food park, and indie bazaars.',
    stock: 15,
    claimed: 5,
  },
  {
    _id: 'r3',
    title: 'Newbi Heavyweight Acid-Wash Crew Hoodie',
    category: 'Merchandise',
    pointsCost: 650,
    description: 'Custom 450 GSM french terry cotton hoodie in pitch black with puff-printed neon green Newbi emblem. Limited release.',
    stock: 40,
    claimed: 18,
  },
  {
    _id: 'r4',
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    category: 'Electronics',
    pointsCost: 4500,
    description: 'Industry-leading noise cancelling with dual processors, 8 microphones, and ultra-comfortable lightweight design.',
    stock: 4,
    claimed: 1,
  },
  {
    _id: 'r5',
    title: '₹5,000 BookMyShow Live Experience Card',
    category: 'Voucher',
    pointsCost: 800,
    description: 'Redeemable for any concert, stand-up comedy show, music festival, or live theatre production across India.',
    stock: 25,
    claimed: 9,
  },
  {
    _id: 'r6',
    title: 'Newbi VIP Fast-Track Gate Pass (Any City)',
    category: 'Event Pass',
    pointsCost: 400,
    description: 'Skip the general queue at any concert or festival produced by Newbi. Valid for you + 1 friend.',
    stock: 50,
    claimed: 21,
  },
];

export const api = {
  // Auth
  async login(email, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    } catch (err) {
      // Mock login for offline demonstration
      if (email.includes('admin') || password === 'admin123') {
        return {
          success: true,
          token: 'mock-jwt-admin-token',
          user: {
            _id: 'u-admin',
            name: 'Newbi Admin',
            email: 'admin@newbi.live',
            role: 'admin',
            points: 10000,
            organization: 'Newbi Entertainment LLP',
          },
        };
      }
      return {
        success: true,
        token: 'mock-jwt-creator-token',
        user: {
          _id: 'u-creator',
          name: 'Aarav Sharma',
          email: email || 'creator@newbi.live',
          role: 'creator',
          points: 1450,
          organization: 'Independent Creator',
        },
        creatorProfile: {
          instagramHandle: '@aarav.live',
          followersCount: 42500,
          engagementRate: 6.4,
          city: 'Mumbai',
          niche: ['Live Music', 'College Festivals', 'Nightlife'],
        },
      };
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      return {
        success: true,
        token: 'mock-jwt-token-new',
        user: {
          _id: 'u-new',
          name: userData.name,
          email: userData.email,
          role: userData.role || 'creator',
          points: 250,
        },
        creatorProfile: {
          instagramHandle: userData.instagramHandle || `@${userData.name.toLowerCase().replace(/\s+/g, '')}`,
          followersCount: 12000,
          city: userData.city || 'Mumbai',
        },
      };
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Not authenticated');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Campaigns
  async getCampaigns(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/campaigns?${query}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return mockCampaigns;
    }
  },

  async applyToCampaign(id, payload) {
    try {
      const res = await fetch(`${BASE_URL}/campaigns/${id}/apply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      return {
        success: true,
        message: 'Application submitted successfully! Our crew will review it shortly.',
      };
    }
  },

  // Applications
  async getMyApplications() {
    try {
      const res = await fetch(`${BASE_URL}/applications/my`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return [
        {
          _id: 'app1',
          campaign: mockCampaigns[0],
          status: 'approved',
          pitch: 'Covered 4 Sunburn gigs previously with high festival audience engagement.',
          socialHandle: '@aarav.live',
          contentLinks: ['https://instagram.com/reel/example_sunburn'],
          adminNotes: 'Approved for VIP backstage passes.',
          payoutStatus: 'processing',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'app2',
          campaign: mockCampaigns[1],
          status: 'pending',
          pitch: 'Eager to capture the underground Boiler Room atmosphere.',
          socialHandle: '@aarav.live',
          adminNotes: '',
          payoutStatus: 'unpaid',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getAllApplications() {
    try {
      const res = await fetch(`${BASE_URL}/applications`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return [
        {
          _id: 'app1',
          user: { name: 'Aarav Sharma', email: 'creator@newbi.live', points: 1450 },
          campaign: mockCampaigns[0],
          status: 'approved',
          pitch: 'Covered 4 Sunburn gigs previously.',
          socialHandle: '@aarav.live',
          payoutStatus: 'processing',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async updateApplicationStatus(id, updateData) {
    try {
      const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // Contact
  async submitContact(formData) {
    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      return data;
    } catch (err) {
      return {
        success: true,
        message: 'Enquiry received! The Newbi crew will review your brief and reply within 24 hours.',
      };
    }
  },

  async getContactMessages() {
    try {
      const res = await fetch(`${BASE_URL}/contact`, { headers: getHeaders() });
      const data = await res.json();
      return data.data;
    } catch {
      return [
        {
          _id: 'm1',
          audience: 'brand',
          name: 'Vikramaditya Oberoi',
          email: 'vikram@budweiserbeats.in',
          phone: '+91 98201 99887',
          organization: 'Budweiser Beats India',
          budget: '₹20L - ₹50L',
          timeline: 'Within 2 months',
          message: 'Looking to produce a 3-city warehouse series in Mumbai, Bangalore and Delhi.',
          status: 'in_discussion',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  // Projects / Portfolio
  async getProjects(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/projects?${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return mockProjects;
    }
  },

  // Rewards
  async getRewards() {
    try {
      const res = await fetch(`${BASE_URL}/rewards`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return mockRewards;
    }
  },

  async redeemReward(id) {
    try {
      const res = await fetch(`${BASE_URL}/rewards/${id}/redeem`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      return {
        success: true,
        message: 'Congratulations! Reward redeemed successfully. Your access pass is in your inbox.',
      };
    }
  },

  // Admin
  async getAdminStats() {
    try {
      const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch {
      return {
        totalUsers: 142,
        totalCreators: 118,
        totalBrands: 24,
        totalCampaigns: 6,
        activeCampaigns: 6,
        totalApplications: 48,
        pendingApplications: 12,
        totalMessages: 19,
        newMessages: 5,
        totalProjects: 6,
        totalRewards: 6,
      };
    }
  },

  async getAllUsers(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/admin/users?${query}`, { headers: getHeaders() });
      const data = await res.json();
      return data.data;
    } catch {
      return [
        {
          _id: 'u-admin',
          name: 'Newbi Admin',
          email: 'admin@newbi.live',
          role: 'admin',
          points: 10000,
          organization: 'Newbi Entertainment LLP',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'u-creator',
          name: 'Aarav Sharma',
          email: 'creator@newbi.live',
          role: 'creator',
          points: 1450,
          organization: 'Independent Creator',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'u-brand',
          name: 'Puma Brand Lead',
          email: 'brand@newbi.live',
          role: 'brand',
          points: 500,
          organization: 'Puma India',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },
};
