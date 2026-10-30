import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Reward from '../models/Reward.js';
import ContactMessage from '../models/ContactMessage.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Newbi database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await CreatorProfile.deleteMany({});
    await Campaign.deleteMany({});
    await Application.deleteMany({});
    await Project.deleteMany({});
    await Reward.deleteMany({});
    await ContactMessage.deleteMany({});

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Newbi Admin',
      email: 'admin@newbi.live',
      password: 'admin123',
      role: 'admin',
      points: 10000,
      organization: 'Newbi Entertainment LLP',
    });

    const creatorUser = await User.create({
      name: 'Aarav Sharma',
      email: 'creator@newbi.live',
      password: 'creator123',
      role: 'creator',
      points: 1450,
      phone: '+91 98200 12345',
      organization: 'Independent Creator',
    });

    const brandUser = await User.create({
      name: 'Puma Brand Lead',
      email: 'brand@newbi.live',
      password: 'brand123',
      role: 'brand',
      points: 500,
      phone: '+91 98111 22334',
      organization: 'Puma India',
    });

    // 2. Create Creator Profile
    await CreatorProfile.create({
      user: creatorUser._id,
      instagramHandle: '@aarav.live',
      followersCount: 42500,
      engagementRate: 6.4,
      city: 'Mumbai',
      niche: ['Live Music', 'College Festivals', 'Nightlife', 'Street Culture'],
      bio: 'Documenting concerts, festivals & underground music scenes across India. 40k+ music lovers tuning in.',
      verified: true,
      portfolioLinks: [
        'https://instagram.com/reel/example1',
        'https://instagram.com/reel/example2',
      ],
      totalCompletedCampaigns: 7,
      rating: 4.95,
    });

    // 3. Create Campaigns
    const campaigns = await Campaign.insertMany([
      {
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
    ]);

    // 4. Create Applications for demo creator
    await Application.create({
      user: creatorUser._id,
      campaign: campaigns[0]._id,
      pitch: 'I have covered 4 Sunburn arena gigs previously and have an audience that travels for dance music events.',
      socialHandle: '@aarav.live',
      status: 'approved',
      contentLinks: ['https://www.instagram.com/reel/DC_demo12345/'],
      adminNotes: 'Top-tier engagement. Approved for VIP backstage wristbands.',
      payoutStatus: 'processing',
    });

    await Application.create({
      user: creatorUser._id,
      campaign: campaigns[1]._id,
      pitch: 'Would love to document Boiler Room’s raw warehouse aesthetics for my followers.',
      socialHandle: '@aarav.live',
      status: 'pending',
      adminNotes: '',
      payoutStatus: 'unpaid',
    });

    // 5. Create Portfolio Projects
    await Project.insertMany([
      {
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
      },
      {
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
      },
      {
        title: 'Boiler Room India Series',
        category: 'Brand Activations',
        brandOrArtist: 'Boiler Room / Budweiser Beats',
        city: 'Mumbai Warehouse',
        date: '2026',
        footfall: '7,500+ Attendees',
        reach: '5.2M Live Stream & Clip Views',
        creatorsInvolved: 16,
        description: 'Raw circular DJ pit, custom industrial lighting rigs, bespoke sound acoustic insulation, and seamless entry management via Newbi QR guestlists.',
        tags: ['Underground Nightlife', 'QR Ticketing', 'Live Sound Engineering'],
      },
      {
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
      },
      {
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
      },
      {
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
      },
    ]);

    // 6. Create Rewards Catalogue
    await Reward.insertMany([
      {
        title: 'Sunburn Goa VIP Weekend Pass',
        category: 'Event Pass',
        pointsCost: 1500,
        description: 'Full 3-day VIP access to Sunburn Festival Goa, dedicated entry lane, elevated viewing lounge, and private bar access.',
        stock: 12,
        claimed: 3,
      },
      {
        title: 'NH7 Weekender All-Access Wristband',
        category: 'Event Pass',
        pointsCost: 1200,
        description: 'Full weekend entry to Bacardi NH7 Weekender. Access all 4 stages, comedy tent, food park, and indie bazaars.',
        stock: 15,
        claimed: 5,
      },
      {
        title: 'Newbi Heavyweight Acid-Wash Crew Hoodie',
        category: 'Merchandise',
        pointsCost: 650,
        description: 'Custom 450 GSM french terry cotton hoodie in pitch black with puff-printed neon green Newbi emblem. Limited release.',
        stock: 40,
        claimed: 18,
      },
      {
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        category: 'Electronics',
        pointsCost: 4500,
        description: 'Industry-leading noise cancelling with dual processors, 8 microphones, and ultra-comfortable lightweight design.',
        stock: 4,
        claimed: 1,
      },
      {
        title: '₹5,000 BookMyShow Live Experience Card',
        category: 'Voucher',
        pointsCost: 800,
        description: 'Redeemable for any concert, stand-up comedy show, music festival, or live theatre production across India.',
        stock: 25,
        claimed: 9,
      },
      {
        title: 'Newbi VIP Fast-Track Gate Pass (Any City)',
        category: 'Event Pass',
        pointsCost: 400,
        description: 'Skip the general queue at any concert or festival produced by Newbi. Valid for you + 1 friend.',
        stock: 50,
        claimed: 21,
      },
    ]);

    // 7. Create Demo Contact Messages
    await ContactMessage.insertMany([
      {
        audience: 'brand',
        name: 'Vikramaditya Oberoi',
        email: 'vikram@budweiserbeats.in',
        phone: '+91 98201 99887',
        organization: 'Budweiser Beats India',
        budget: '₹20L - ₹50L',
        timeline: 'Within 2 months',
        message: 'Looking to produce a 3-city warehouse series in Mumbai, Bangalore and Delhi. Need full on-ground production, artist booking, and 25 creators.',
        status: 'in_discussion',
      },
      {
        audience: 'college',
        name: 'Rhea Sengupta',
        email: 'cultural.sec@bits-waves.org',
        phone: '+91 97110 54321',
        organization: 'BITS Pilani Cultural Council',
        budget: '₹10L - ₹20L',
        timeline: 'Next semester (Feb 2027)',
        message: 'Requesting artist curation and stage light/sound design for our annual college fest EDM & Bollywood nights.',
        status: 'new',
      },
      {
        audience: 'artist',
        name: 'Karan Mehra',
        email: 'management@subculture.live',
        phone: '+91 98333 11223',
        organization: 'SubCulture Artist Mgmt',
        budget: 'Not specified',
        timeline: 'Immediate',
        message: 'Representing two top indie acts touring India this winter. Exploring venue partnerships and college fest bookings.',
        status: 'new',
      },
    ]);

    console.log('✅ Newbi database successfully seeded with realistic live data!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};

// If run directly via node seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newbi_live';
  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log('Connected to MongoDB for standalone seeding');
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('MongoDB connection error in seed script:', err.message);
      process.exit(1);
    });
}
