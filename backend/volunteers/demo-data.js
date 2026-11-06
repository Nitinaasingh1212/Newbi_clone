// Demo data for the prototype:
// - demo events in major cities (upcoming), plus three past events in Delhi;
// - a demo volunteer you can sign in as (DEMO_LOGIN), with rated past events, one approved
//   upcoming event and a Silver tier;
// - four more Delhi volunteers, so the leaderboard has people on it.
//
// Every document has a fixed id and dates relative to today. The whole set is rewritten
// once per server instance per day, before that instance's first request. Copies of the
// function on Vercel don't share storage, but each writes the same documents, so the demo
// looks identical whichever copy answers. Turn it all off with DEMO_MODE=false (or
// PROTOTYPE.demoMode in config.js).
import { keyedHash } from './tokens.js';
import { cityField, verhoeffValid } from './validate.js';

export const DEMO_LOGIN = { phone: '+919999999999', otp: '123456' };

const VERSION = 'v4'; // bump when the demo data changes, to rewrite it today
const BY = 'Demo data';
const NOTE = 'Demo event for the OSH prototype.';

// Event photos: freely licensed images from Wikimedia Commons, cropped to 720x480 and
// stored in site/volunteer/img/events/<key>.jpg. Full credits: CREDITS.md in that folder.
const PHOTOS = {
  diwali: ['PattayaPatrol', 'CC BY-SA 4.0', 'DFC_2865_A_bustling_night_market_fills_the_street_with_crowds_food_stalls_and_decorative_lights_creating_a_festive_atmosphere.jpg'],
  campus: ['PinkBeachPlanet', 'CC BY-SA 4.0', 'Beach-Please-2022-crowd-stage-lights-night-performance.jpg'],
  indie: ['Shixart1985', 'CC BY 2.0', 'Live_rock_concert_featuring_musicians_playing_electric_guitars_on_stage_at_night_with_vibrant_lights_and_an_enthusiastic_crowd_present.jpg'],
  popup: ['Robert Sheie', 'CC BY 2.0', 'Haxby_Collective_(24185585463).jpg'],
  techfest: ['DERDAKI ILIAS', 'CC BY-SA 4.0', 'Wikimedia_Morocco_Mini-Hackathon_2026_day_1_-_Participants_working_on_laptops_in_a_conference_room_-_0014.jpg'],
  comedy: ['Carlos Delgado', 'CC BY-SA 3.0', 'Stand-up_comedy_-_Stage.jpg'],
  edm: ['Shixart1985', 'CC BY 2.0', 'A_large_crowd_enjoys_a_music_concert_illuminated_by_colorful_lights_and_a_stunning_stage_display.jpg'],
  cultural: ['Siddharth 36', 'CC BY-SA 4.0', 'Formational_dance_performance.jpg'],
  carnival: ['PattayaPatrol', 'CC BY-SA 4.0', 'DSCF0642_Evening_buzz_at_a_colorful_outdoor_night_market_-_lights_food_stalls_and_crowds_enjoying_the_lively_atmosphere.jpg'],
  beachrun: ['Stephen Craven', 'CC BY-SA 2.0', 'Marathon_runners_near_the_end_of_the_race_-_geograph.org.uk_-_6142899.jpg'],
  dandiya: ['Saurabh sirohiya', 'CC BY-SA 4.0', 'Vibrant_Navratri_Garba.jpg'],
  workshop: ['Din-nani1', 'CC BY-SA 4.0', 'Participants_at_a_Wikipedia_Workshop_1.jpg'],
  hackathon: ['DERDAKI ILIAS', 'CC BY-SA 4.0', 'Wikimedia_Morocco_Mini-Hackathon_2026_day_2_-_Participants_working_with_laptops_in_a_conference_room_setting_-_0038.jpg'],
  football: ['Samson Ssemakadde', 'CC0', 'Players_and_referees_before_a_football_match.jpg'],
  holi: ['Piyush Choudhary', 'CC BY-SA 4.0', 'Himachali_people_covered_in_holi_colours,_dancing._01.jpg'],
  spring: ['Shixart1985', 'CC BY 2.0', 'Live_band_performance_at_an_outdoor_concert_with_lights_and_energetic_crowd_during_nighttime.jpg'],
  drop: ['Jacek Halicki', 'CC BY-SA 4.0', '2023_Adidas_Yeezy_350_V2_EF2905_(1).jpg'],
};
const photo = (key) => {
  const [artist, license, file] = PHOTOS[key];
  return {
    image: `/volunteer/img/events/${key}.jpg`,
    imageCredit: `Photo: ${artist}, ${license}, via Wikimedia Commons`,
    imageCreditUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%2C/g, ',')}`,
  };
};

// Ticket types as [name, price in INR, description].
const t = (...rows) => rows.map(([name, price, description = null]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, price, description }));

// inDays: days after today (India time). Past events are already completed.
const EVENTS = [
  {
    key: 'diwali', city: 'Delhi', inDays: 3, title: 'Diwali Night Market', category: 'Cultural', venue: 'Jawaharlal Nehru Stadium', address: 'Gate 14, Lodhi Road',
    startTime: '16:00', endTime: '23:00', volunteersNeeded: 20, roles: ['Entry gate', 'Ticketing', 'Stall support'],
    description: 'An evening fair with 40 food and craft stalls, a live stage and a lantern walk. Volunteer shifts include dinner and a crew tee.',
    tags: ['Festival', 'Food', 'Live music'], highlights: ['Food Stalls', 'Live Music', 'Craft Bazaar', 'Lantern Walk'],
    tickets: t(['Entry Pass', 199, 'Single entry'], ['Family Pass', 499, 'Entry for 4 people']),
  },
  {
    key: 'dandiya', city: 'Delhi', inDays: 6, title: 'Dandiya Night', category: 'Cultural', venue: 'Talkatora Indoor Stadium', address: 'Talkatora Garden',
    startTime: '19:00', endTime: '23:30', volunteersNeeded: 15, roles: ['Entry gate', 'Dandiya sticks desk', 'Crowd management'],
    description: 'Garba and dandiya with a live dhol troupe, a best-dressed contest and a food court.',
    tags: ['Garba', 'Dance', 'Navratri'], highlights: ['Live Dhol', 'Dance Floor', 'Best Dressed', 'Food Court'],
    tickets: t(['General', 399, 'Entry + dandiya sticks'], ['Couple Pass', 699, 'Entry for 2']),
  },
  {
    key: 'workshop', city: 'Delhi', inDays: 8, title: 'Event Volunteering Workshop', category: 'Workshop', venue: 'India Habitat Centre', address: 'Lodhi Road',
    startTime: '11:00', endTime: '15:00', volunteersNeeded: 4, roles: ['Registration desk'],
    description: 'A hands-on session on crowd flow, guest handling and safety for anyone who wants to volunteer at events. Certificate included.',
    tags: ['Training', 'Volunteering', 'Certificate'], highlights: ['Crowd Safety', 'Guest Handling', 'Mock Drills', 'Certificate'],
    tickets: t(['Free Registration', 0, 'Seat + certificate']),
  },
  {
    key: 'campus', city: 'Delhi', inDays: 10, title: 'Campus Fest Pro Night', category: 'Fest', venue: 'Thyagaraj Stadium', address: 'INA',
    startTime: '17:00', endTime: '22:30', volunteersNeeded: 30, roles: ['Crowd management', 'Backstage', 'Registration desk'],
    description: 'Headline night of a college fest: 4,000 students, two opening acts and a headliner.',
    tags: ['College', 'Music', 'Night'], highlights: ['Headliner', 'Opening Acts', 'Light Show', 'Food Court'],
    tickets: t(['Student Pass', 299, 'Valid college ID needed'], ['General', 499, 'Event access'], ['Fan Pit', 999, 'Closest to the stage']),
  },
  {
    key: 'techfest', city: 'Bengaluru', inDays: 4, title: 'Tech Expo 2026', category: 'Technical', venue: 'Bangalore International Exhibition Centre', address: 'Tumkur Road',
    startTime: '10:00', endTime: '17:00', volunteersNeeded: 40, roles: ['Registration desk', 'Hall guide', 'Speaker support'],
    description: 'A flagship tech exhibition showcasing innovative projects, startups and industry talks. Explore, learn, network and get inspired by cutting-edge technology.',
    tags: ['Technology', 'Innovation', 'Exhibition'], highlights: ['Live Demos', 'Expert Talks', 'Startup Zone', 'Networking'],
    tickets: t(['General Pass', 0, 'Event access only'], ['Student Pass', 99, 'With certificate'], ['Premium Pass', 299, 'Event + Merch Kit + Certificate']),
  },
  {
    key: 'hackathon', city: 'Bengaluru', inDays: 13, title: 'Code Rush Hackathon', category: 'Technical', venue: 'Koramangala Indoor Stadium', address: 'Koramangala',
    startTime: '09:00', endTime: '21:00', volunteersNeeded: 12, roles: ['Registration desk', 'Mentor support', 'Food & logistics'],
    description: '12 hours, teams of up to four, three tracks and a demo stage. Meals and swag included.',
    tags: ['Coding', 'Teams', 'Prizes'], highlights: ['Mentors', 'Prize Pool', 'Demo Stage', 'Free Meals'],
    tickets: t(['Team Registration', 0, 'Up to 4 members']),
  },
  {
    key: 'comedy', city: 'Bengaluru', inDays: 9, title: 'Comedy Night Live', category: 'Comedy', venue: 'Chowdiah Memorial Hall', address: 'Malleshwaram',
    startTime: '19:00', endTime: '22:00', volunteersNeeded: 8, roles: ['Ticketing', 'Ushering'],
    description: 'An evening of stand-up from five comics. Help with ticket checks and seating.',
    tags: ['Stand-up', 'Evening'], highlights: ['Five Comics', 'Open Mic', 'Meet & Greet'],
    tickets: t(['General', 599, 'Seated']),
  },
  {
    key: 'indie', city: 'Mumbai', inDays: 5, title: 'Indie Live: Sunset Sessions', category: 'Concert', venue: 'NSCI Dome', address: 'Worli',
    startTime: '17:30', endTime: '23:00', volunteersNeeded: 25, roles: ['Entry gate', 'Hospitality', 'Merch desk'],
    description: 'Three indie bands, one stage. Help run entry, the merch desk and the artist green room.',
    tags: ['Live music', 'Indie'], highlights: ['Three Bands', 'Merch Stall', 'Food Court'],
    tickets: t(['General', 799, 'Standing'], ['Fan Pit', 1499, 'Front of stage']),
  },
  {
    key: 'football', city: 'Mumbai', inDays: 9, title: 'Inter-College Football Cup', category: 'Sports', venue: 'Cooperage Ground', address: 'Colaba',
    startTime: '08:00', endTime: '18:00', volunteersNeeded: 14, roles: ['Ground marshal', 'Scoreboard', 'First aid support'],
    description: 'Sixteen college teams, knockout format, finals at sunset. Entry for spectators is free.',
    tags: ['Football', 'College', 'Tournament'], highlights: ['16 Teams', 'Knockouts', 'Trophy Ceremony'],
    tickets: t(['Spectator', 0, 'Free entry']),
  },
  {
    key: 'popup', city: 'Mumbai', inDays: 12, title: 'Sneaker Brand Pop-up', category: 'Activation', venue: 'Phoenix Palladium', address: 'Lower Parel',
    startTime: '11:00', endTime: '21:00', volunteersNeeded: 10, roles: ['Queue management', 'Product demo'],
    description: 'Weekend launch pop-up with a raffle queue and live customisation.',
    tags: ['Brand', 'Launch', 'Raffle'], highlights: ['Live Customisation', 'Raffle', 'Giveaways'],
    tickets: t(['Free Entry', 0, 'Raffle entry included']),
  },
  {
    key: 'edm', city: 'Hyderabad', inDays: 6, title: 'EDM Night', category: 'Concert', venue: 'Gachibowli Stadium', address: 'Gachibowli',
    startTime: '18:00', endTime: '23:30', volunteersNeeded: 35, roles: ['Crowd management', 'Wristbands', 'First aid support'],
    description: 'Large-format EDM night with a laser show. Crowd and wristband teams needed.',
    tags: ['EDM', 'Night'], highlights: ['Laser Show', 'Three DJs', 'Food Court'],
    tickets: t(['Phase 1', 999, 'General access'], ['VIP', 2499, 'Lounge + fast entry']),
  },
  {
    key: 'cultural', city: 'Pune', inDays: 7, title: 'College Cultural Fest', category: 'Fest', venue: 'COEP Ground', address: 'Shivajinagar',
    startTime: '10:00', endTime: '21:00', volunteersNeeded: 30, roles: ['Registration desk', 'Event coordination', 'Backstage'],
    description: 'Day-long cultural fest with dance, music and fashion competitions.',
    tags: ['College', 'Competitions'], highlights: ['Dance Battle', 'Battle of Bands', 'Fashion Show'],
    tickets: t(['Free Registration', 0, 'Entry for the day']),
  },
  {
    key: 'carnival', city: 'Kolkata', inDays: 8, title: 'Food & Music Carnival', category: 'Fest', venue: 'Eco Park', address: 'New Town',
    startTime: '14:00', endTime: '22:00', volunteersNeeded: 18, roles: ['Stall support', 'Entry gate'],
    description: 'Weekend carnival with food stalls and live bands.',
    tags: ['Food', 'Live music'], highlights: ['Food Stalls', 'Live Music', 'Games'],
    tickets: t(['Entry', 149, 'Single entry']),
  },
  {
    key: 'beachrun', city: 'Chennai', inDays: 11, title: 'Brand Activation: Beach Run', category: 'Sports', venue: 'Besant Nagar Beach', address: 'Elliot’s Beach',
    startTime: '05:30', endTime: '10:00', volunteersNeeded: 15, roles: ['Route marshal', 'Hydration station', 'Registration desk'],
    description: '5K sunrise run with a sponsor activation zone at the finish.',
    tags: ['Running', 'Fitness'], highlights: ['5K Route', 'Finisher Medal', 'Activation Zone'],
    tickets: t(['5K Registration', 349, 'Bib, T-shirt and medal']),
  },
  { key: 'holi', city: 'Delhi', inDays: -40, title: 'Holi Colour Fest', category: 'Cultural', venue: 'Jawaharlal Nehru Stadium', address: 'Lodhi Road', startTime: '10:00', endTime: '18:00', volunteersNeeded: 25, roles: ['Entry gate', 'Colour station', 'Crowd management'], description: 'Daytime colour festival with DJs and food stalls.' },
  { key: 'spring', city: 'Delhi', inDays: -24, title: 'College Fest: Spring Edition', category: 'Fest', venue: 'Thyagaraj Stadium', address: 'INA', startTime: '12:00', endTime: '22:00', volunteersNeeded: 30, roles: ['Backstage', 'Registration desk'], description: 'Two-day college fest with competitions and a pro night.' },
  { key: 'drop', city: 'Delhi', inDays: -9, title: 'Sneaker Drop Pop-up', category: 'Activation', venue: 'Select Citywalk', address: 'Saket', startTime: '11:00', endTime: '20:00', volunteersNeeded: 10, roles: ['Queue management', 'Raffle desk'], description: 'Limited sneaker drop with a raffle queue.' },
];

// history: [eventKey, stars or 'no_show', coordinator comment]. upcoming: [eventKey, status, note].
const PEOPLE = [
  {
    key: 'riya', name: 'Riya Kapoor', phone: DEMO_LOGIN.phone, dateOfBirth: '2001-03-14', gender: 'female', area: 'Saket',
    aadhaar: '212121212120', skills: ['Crowd management', 'Hospitality', 'Entry & ticketing'], languages: ['Hindi', 'English'],
    emergencyContact: { name: 'Neha Kapoor', phone: '+919811100000', relation: 'Sister' },
    history: [
      ['holi', 5, 'Kept the entry queue moving all day.'],
      ['spring', 4, 'Reliable backstage runner.'],
      ['drop', 5, 'Calm and friendly with a huge raffle crowd.'],
    ],
    upcoming: [['diwali', 'approved', 'Report at Gate 14 by 3:30 pm. Crew tee at the volunteer desk.']],
  },
  {
    key: 'arjun', name: 'Arjun Mehta', phone: '+919999900001', dateOfBirth: '1999-07-02', gender: 'male', area: 'Lajpat Nagar',
    aadhaar: '313131313135', skills: ['Backstage & artist care', 'Logistics'], languages: ['Hindi', 'English', 'Punjabi'],
    history: [['holi', 5, 'Ran the colour station single-handed.'], ['spring', 5, null], ['drop', 5, null]],
    upcoming: [['diwali', 'approved', null]],
  },
  {
    key: 'sana', name: 'Sana Khan', phone: '+919999900002', dateOfBirth: '2002-11-20', gender: 'female', area: 'Dwarka',
    aadhaar: '414141414145', skills: ['Registration desk', 'Social media & content'], languages: ['Hindi', 'English', 'Urdu'],
    history: [['holi', 4, null], ['drop', 5, 'Great at the raffle desk.']],
    upcoming: [['campus', 'applied', null]],
  },
  {
    key: 'kabir', name: 'Kabir Singh', phone: '+919999900003', dateOfBirth: '2000-01-09', gender: 'male', area: 'Rohini',
    aadhaar: '515151515151', skills: ['Crowd management', 'Production & setup'], languages: ['Hindi'],
    history: [['holi', 3, null], ['spring', 4, null], ['drop', 3, 'Arrived late, but solid once there.']],
  },
  {
    key: 'meera', name: 'Meera Iyer', phone: '+919999900004', dateOfBirth: '2003-05-30', gender: 'female', area: 'Vasant Kunj',
    aadhaar: '616161616166', skills: ['First aid', 'Hospitality'], languages: ['English', 'Tamil', 'Hindi'],
    history: [['spring', 5, null], ['drop', 'no_show', 'Did not turn up or call.']],
  },
];

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
// An instant on an India date, as an ISO timestamp.
const at = (date, time = '12:00') => new Date(`${date}T${time}:00+05:30`).toISOString();

export function isDemoVolunteerId(id) {
  return typeof id === 'string' && id.startsWith('vol_demo_');
}

export async function seedDemoData(svc) {
  const { db, store, config } = svc;
  const today = svc.today();
  const stamp = `${VERSION}:${today}`;
  if ((await store.hget('meta', 'demoData')) === stamp) return false;

  const events = new Map();
  for (const { key, inDays, city, description, ...rest } of EVENTS) {
    const date = addDays(today, inDays);
    const event = {
      id: `evt_demo_${key}`,
      ...rest,
      ...cityField(city, { required: true }),
      description: `${description} ${NOTE}`,
      ...photo(key),
      date,
      status: inDays < 0 ? 'completed' : 'open',
      createdBy: BY,
      createdAt: at(addDays(date, -21)),
      updatedAt: at(addDays(date, -21)),
    };
    events.set(key, event);
    await db.put('events', event);
  }

  for (const person of PEOPLE) {
    const id = `vol_demo_${person.key}`;
    if (!verhoeffValid(person.aadhaar)) throw new Error(`Demo Aadhaar for ${person.name} is invalid`);
    const joined = at(addDays(today, -60));
    await db.put('volunteers', {
      id,
      demo: true,
      phone: person.phone,
      name: person.name,
      email: null,
      dateOfBirth: person.dateOfBirth,
      gender: person.gender,
      ...cityField('Delhi', { required: true }),
      area: person.area,
      skills: person.skills,
      languages: person.languages,
      emergencyContact: person.emergencyContact ?? null,
      aadhaar: { last4: person.aadhaar.slice(-4), hash: keyedHash(config.appSecret, 'aadhaar', person.aadhaar) },
      kyc: { status: 'verified', note: 'Card checked at the volunteer desk.', reviewedAt: joined, reviewedBy: BY },
      status: 'active',
      createdAt: joined,
      updatedAt: joined,
    });
    await store.hset('idx:phone', person.phone, id);

    const apply = async (eventKey, fields) => {
      const event = events.get(eventKey);
      const app = {
        id: `app_demo_${person.key}_${eventKey}`,
        eventId: event.id,
        volunteerId: id,
        preferredRole: event.roles[0] ?? null,
        note: null,
        appliedAt: at(addDays(event.date, -6)),
        decidedAt: null,
        decidedBy: null,
        decisionNote: null,
        withdrawnAt: null,
        review: null,
        updatedAt: at(addDays(event.date, -3)),
        ...fields,
      };
      await db.put('applications', app);
      await store.hset('idx:application', `${event.id}:${id}`, app.id);
    };
    for (const [eventKey, stars, comment] of person.history) {
      const date = events.get(eventKey).date;
      const outcome = stars === 'no_show' ? 'no_show' : 'completed';
      await apply(eventKey, {
        status: outcome,
        decidedAt: at(addDays(date, -3)),
        decidedBy: BY,
        review: { outcome, rating: outcome === 'completed' ? stars : null, comment, reviewedBy: BY, reviewedAt: at(date, '23:30') },
      });
    }
    for (const [eventKey, status, note] of person.upcoming ?? []) {
      const decided = status === 'approved';
      await apply(eventKey, {
        status,
        decidedAt: decided ? at(addDays(today, -1)) : null,
        decidedBy: decided ? BY : null,
        decisionNote: note,
      });
    }
  }

  // Older versions of the prototype added demo events with random ids; drop the unused ones.
  const applications = await db.all('applications');
  for (const event of await db.all('events')) {
    if (event.createdBy === BY && !event.id.startsWith('evt_demo_') && !applications.some((a) => a.eventId === event.id)) {
      await store.hdel('events', event.id);
    }
  }

  await store.hset('meta', 'demoData', stamp);
  return true;
}
