// Demo data for the prototype:
// - the 12 upcoming crew opportunities from the OSH brief, across the network cities, plus
//   three past events in Delhi;
// - a demo volunteer you can sign in as (DEMO_LOGIN), with rated past events, one approved
//   upcoming event and the Trained tier;
// - four more Delhi volunteers, so the leaderboard and Star Volunteers have people on them.
//
// Every document has a fixed id and dates relative to today. The whole set is rewritten
// once per server instance per day, before that instance's first request. Copies of the
// function on Vercel don't share storage, but each writes the same documents, so the demo
// looks identical whichever copy answers. Turn it all off with DEMO_MODE=false (or
// PROTOTYPE.demoMode in config.js).
import { keyedHash } from './tokens.js';
import { cityField, verhoeffValid } from './validate.js';

export const DEMO_LOGIN = { phone: '+919999999999', otp: '123456' };

const VERSION = 'v5'; // bump when the demo data changes, to rewrite it today
const BY = 'Demo data';

// Event photos: freely licensed images from Wikimedia Commons, cropped to 720x480 and
// stored in site/volunteer/img/events/<key>.jpg. Full credits: CREDITS.md in that folder.
const PHOTOS = {
  diwali: ['PattayaPatrol', 'CC BY-SA 4.0', 'DFC_2865_A_bustling_night_market_fills_the_street_with_crowds_food_stalls_and_decorative_lights_creating_a_festive_atmosphere.jpg'],
  campus: ['PinkBeachPlanet', 'CC BY-SA 4.0', 'Beach-Please-2022-crowd-stage-lights-night-performance.jpg'],
  indie: ['Shixart1985', 'CC BY 2.0', 'Live_rock_concert_featuring_musicians_playing_electric_guitars_on_stage_at_night_with_vibrant_lights_and_an_enthusiastic_crowd_present.jpg'],
  techfest: ['DERDAKI ILIAS', 'CC BY-SA 4.0', 'Wikimedia_Morocco_Mini-Hackathon_2026_day_1_-_Participants_working_on_laptops_in_a_conference_room_-_0014.jpg'],
  comedy: ['Carlos Delgado', 'CC BY-SA 3.0', 'Stand-up_comedy_-_Stage.jpg'],
  edm: ['Shixart1985', 'CC BY 2.0', 'A_large_crowd_enjoys_a_music_concert_illuminated_by_colorful_lights_and_a_stunning_stage_display.jpg'],
  cultural: ['Siddharth 36', 'CC BY-SA 4.0', 'Formational_dance_performance.jpg'],
  carnival: ['PattayaPatrol', 'CC BY-SA 4.0', 'DSCF0642_Evening_buzz_at_a_colorful_outdoor_night_market_-_lights_food_stalls_and_crowds_enjoying_the_lively_atmosphere.jpg'],
  dandiya: ['Saurabh sirohiya', 'CC BY-SA 4.0', 'Vibrant_Navratri_Garba.jpg'],
  hackathon: ['DERDAKI ILIAS', 'CC BY-SA 4.0', 'Wikimedia_Morocco_Mini-Hackathon_2026_day_2_-_Participants_working_with_laptops_in_a_conference_room_setting_-_0038.jpg'],
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

// inDays: days after today (India time); on 7 Nov 2026 these match the dates in the brief.
// Past events (negative inDays) are already completed. The first sentence of each
// description is the line the event cards show.
const EVENTS = [
  {
    key: 'djnight', photo: 'edm', city: 'Lucknow', inDays: 8, title: 'DJ Night – Live Concert', category: 'Music & Concerts', venue: 'Phoenix Palassio, Lucknow', address: 'Shaheed Path, Gomti Nagar Extension',
    startTime: '18:00', endTime: '23:30', volunteersNeeded: 25, roles: ['Crowd operations', 'Artist hospitality', 'Entry & wristbands'],
    description: 'Live music, artist hospitality and crowd operations. A headline DJ set with two support acts and a crowd of around 3,000.',
    tags: ['DJ', 'Live music', 'Night'], highlights: ['Headline DJ', 'Two Support Acts', 'Light Show', 'Crew Meal'],
  },
  {
    key: 'awards', photo: 'comedy', city: 'Delhi', inDays: 13, title: 'Corporate Annual Awards', category: 'Corporate Events', venue: 'Aerocity, Delhi', address: 'Hospitality District, Aerocity',
    startTime: '17:00', endTime: '23:00', volunteersNeeded: 18, roles: ['Guest relations', 'Registration desk', 'Stage coordination'],
    description: 'Guest relations, registration and stage coordination. An awards night for 600 employees and guests, with a red carpet, dinner and a live band.',
    tags: ['Awards', 'Corporate', 'Gala dinner'], highlights: ['Red Carpet', 'Award Ceremony', 'Live Band', 'Gala Dinner'],
  },
  {
    key: 'collegefest', photo: 'campus', city: 'Mumbai', inDays: 18, title: 'College Fest 2026', category: 'College Festivals', venue: 'Mumbai University', address: 'Kalina Campus, Santacruz East',
    startTime: '10:00', endTime: '22:00', volunteersNeeded: 30, roles: ['Backstage', 'Event operations', 'Registration desk'],
    description: 'Campus festival operations and backstage support. A full day of competitions and workshops for 8,000 students, ending in a pro night.',
    tags: ['College', 'Competitions', 'Pro night'], highlights: ['Pro Night', 'Dance Battle', 'Battle of Bands', 'Food Court'],
  },
  {
    key: 'musicfest', photo: 'indie', city: 'Gurugram', inDays: 22, title: 'Grand Music Festival', category: 'Music & Concerts', venue: 'Sector 29, Gurugram', address: null,
    startTime: '15:00', endTime: '23:00', volunteersNeeded: 40, roles: ['Concert crew', 'Artist support', 'Crowd management'],
    description: 'Large-scale concert crew and artist support. Two stages and eight artists over one long evening, with an audience of 10,000.',
    tags: ['Festival', 'Live music', 'Two stages'], highlights: ['Two Stages', 'Eight Artists', 'Food Village', 'Merch Stalls'],
  },
  {
    key: 'wedding', photo: 'dandiya', city: 'Jaipur', inDays: 27, title: 'Luxury Wedding Celebration', category: 'Private Events', venue: 'Jaipur', address: null,
    startTime: '17:00', endTime: '23:30', volunteersNeeded: 16, roles: ['Guest hospitality', 'Guest movement', 'Production support'],
    description: 'Hospitality, guest movement and production support. A destination wedding with 400 guests; this shift covers the sangeet night.',
    tags: ['Wedding', 'Hospitality'], highlights: ['Sangeet Night', 'Live Dhol', 'Guest Lounge', 'Fireworks'],
  },
  {
    key: 'youthfest', photo: 'holi', city: 'Punjab', inDays: 31, title: 'North India Youth Fest', category: 'College Festivals', venue: 'Chandigarh', address: null,
    startTime: '10:00', endTime: '20:00', volunteersNeeded: 22, roles: ['Volunteer coordination', 'Registration desk', 'Crowd management'],
    description: 'Volunteer coordination and registration. Students from 40 colleges across the region compete in music, dance and debate.',
    tags: ['Youth', 'Inter-college', 'Culture'], highlights: ['Inter-college Contests', 'Folk Performances', 'Debate Arena', 'Food Stalls'],
  },
  {
    key: 'summit', photo: 'techfest', city: 'Chennai', inDays: 35, title: 'Brand Leadership Summit', category: 'Corporate Events', venue: 'Chennai Trade Centre', address: 'Nandambakkam',
    startTime: '09:00', endTime: '18:00', volunteersNeeded: 14, roles: ['Delegate support', 'Registration desk', 'Hall management'],
    description: 'Delegate support and conference operations. A one-day summit with 25 speakers and 800 delegates from marketing and brand teams.',
    tags: ['Conference', 'Corporate'], highlights: ['Keynote Talks', 'Panel Discussions', 'Networking Lunch', 'Expo Booths'],
  },
  {
    key: 'cityedm', photo: 'spring', city: 'Mumbai', inDays: 41, title: 'City EDM Experience', category: 'Music & Concerts', venue: 'Mumbai', address: null,
    startTime: '18:00', endTime: '23:30', volunteersNeeded: 35, roles: ['Stage crew', 'Crowd management', 'Artist management'],
    description: 'Stage, crowd and artist management. A large-format EDM night with three DJs and a laser show.',
    tags: ['EDM', 'Night', 'Festival'], highlights: ['Three DJs', 'Laser Show', 'VIP Deck', 'Food Court'],
  },
  {
    key: 'nyegala', photo: 'diwali', city: 'Delhi', inDays: 54, title: 'New Year Private Gala', category: 'Private Events', venue: 'Delhi NCR', address: null,
    startTime: '20:00', endTime: '00:30', volunteersNeeded: 20, roles: ['Guest experience', 'Event execution', 'Cloakroom & help desk'],
    description: 'Guest experience and event execution. A private countdown party for 300 guests with a live band and a midnight fireworks show.',
    tags: ['New Year', 'Private party'], highlights: ['Live Band', 'Countdown Show', 'Fireworks', 'Gourmet Dinner'],
  },
  {
    key: 'campuscarnival', photo: 'carnival', city: 'Lucknow', inDays: 64, title: 'Campus Carnival', category: 'College Festivals', venue: 'Lucknow', address: null,
    startTime: '11:00', endTime: '21:00', volunteersNeeded: 28, roles: ['Event operations', 'Stall support', 'Entry gate'],
    description: 'Student festival and event operations. Games, food stalls and live performances across a university campus.',
    tags: ['Carnival', 'Students'], highlights: ['Game Zone', 'Food Stalls', 'Live Performances', 'Flea Market'],
  },
  {
    key: 'launch', photo: 'hackathon', city: 'Bengaluru', inDays: 70, title: 'Corporate Product Launch', category: 'Corporate Events', venue: 'Bengaluru', address: null,
    startTime: '14:00', endTime: '20:00', volunteersNeeded: 12, roles: ['Brand activation', 'Guest coordination', 'Demo support'],
    description: 'Brand activation and guest coordination. A product reveal for press, partners and 250 invited guests, followed by hands-on demo zones.',
    tags: ['Launch', 'Brand', 'Tech'], highlights: ['Product Reveal', 'Demo Zones', 'Press Area', 'Networking'],
  },
  {
    key: 'wintertour', photo: 'cultural', city: 'Haryana', inDays: 76, title: 'Winter Live Tour', category: 'Music & Concerts', venue: 'Karnal, Haryana', address: null,
    startTime: '17:00', endTime: '22:30', volunteersNeeded: 32, roles: ['Production crew', 'Front-of-house', 'Crowd management'],
    description: 'Concert production and front-of-house crew. The Haryana stop of a six-city winter tour, with an open-air stage and 5,000 fans.',
    tags: ['Tour', 'Live music'], highlights: ['Open-air Stage', 'Headline Act', 'Merch Stall', 'Food Court'],
  },
  { key: 'holi', photo: 'holi', city: 'Delhi', inDays: -40, title: 'Holi Colour Fest', category: 'Music & Concerts', venue: 'Jawaharlal Nehru Stadium', address: 'Lodhi Road', startTime: '10:00', endTime: '18:00', volunteersNeeded: 25, roles: ['Entry gate', 'Colour station', 'Crowd management'], description: 'Daytime colour festival with DJs and food stalls.' },
  { key: 'spring', photo: 'spring', city: 'Delhi', inDays: -24, title: 'College Fest: Spring Edition', category: 'College Festivals', venue: 'Thyagaraj Stadium', address: 'INA', startTime: '12:00', endTime: '22:00', volunteersNeeded: 30, roles: ['Backstage', 'Registration desk'], description: 'Two-day college fest with competitions and a pro night.' },
  { key: 'drop', photo: 'drop', city: 'Delhi', inDays: -9, title: 'Sneaker Drop Pop-up', category: 'Corporate Events', venue: 'Select Citywalk', address: 'Saket', startTime: '11:00', endTime: '20:00', volunteersNeeded: 10, roles: ['Queue management', 'Raffle desk'], description: 'Limited sneaker drop for a footwear brand, with a raffle queue.' },
];

// history: [eventKey, stars or 'no_show', coordinator comment]. upcoming: [eventKey, status, note].
const PEOPLE = [
  {
    key: 'riya', name: 'Riya Kapoor', phone: DEMO_LOGIN.phone, dateOfBirth: '2001-03-14', gender: 'female', area: 'Saket',
    aadhaar: '212121212120', department: 'Crowd management', experience: '1 to 5 events', availability: 'Weekends only',
    skills: ['Crowd management', 'Guest relations & hospitality'], languages: ['Hindi', 'English'],
    emergencyContact: { name: 'Neha Kapoor', phone: '+919811100000', relation: 'Sister' },
    history: [
      ['holi', 5, 'Kept the entry queue moving all day.'],
      ['spring', 4, 'Reliable backstage runner.'],
      ['drop', 5, 'Calm and friendly with a huge raffle crowd.'],
    ],
    upcoming: [['awards', 'approved', 'Report at the Aerocity venue by 4:00 pm. Formal black, please.']],
  },
  {
    key: 'arjun', name: 'Arjun Mehta', phone: '+919999900001', dateOfBirth: '1999-07-02', gender: 'male', area: 'Lajpat Nagar',
    aadhaar: '313131313135', department: 'Stage & backstage', experience: '6 to 20 events', availability: 'Event based',
    skills: ['Stage & backstage', 'Logistics & runners'], languages: ['Hindi', 'English', 'Punjabi'],
    history: [['holi', 5, 'Ran the colour station single-handed.'], ['spring', 5, null], ['drop', 5, null]],
    upcoming: [['awards', 'approved', null]],
  },
  {
    key: 'sana', name: 'Sana Khan', phone: '+919999900002', dateOfBirth: '2002-11-20', gender: 'female', area: 'Dwarka',
    aadhaar: '414141414145', department: 'Registration & help desk', experience: '1 to 5 events', availability: 'Event based',
    skills: ['Registration & help desk', 'Social media & content'], languages: ['Hindi', 'English', 'Urdu'],
    history: [['holi', 4, null], ['drop', 5, 'Great at the raffle desk.']],
    upcoming: [['nyegala', 'applied', null]],
  },
  {
    key: 'kabir', name: 'Kabir Singh', phone: '+919999900003', dateOfBirth: '2000-01-09', gender: 'male', area: 'Rohini',
    aadhaar: '515151515151', department: 'Crowd management', experience: '1 to 5 events', availability: 'Weekends only',
    skills: ['Crowd management', 'Production & technical'], languages: ['Hindi'],
    history: [['holi', 3, null], ['spring', 4, null], ['drop', 3, 'Arrived late, but solid once there.']],
  },
  {
    key: 'meera', name: 'Meera Iyer', phone: '+919999900004', dateOfBirth: '2003-05-30', gender: 'female', area: 'Vasant Kunj',
    aadhaar: '616161616166', department: 'First aid', experience: '1 to 5 events', availability: 'Weekdays',
    skills: ['First aid', 'Guest relations & hospitality'], languages: ['English', 'Tamil', 'Hindi'],
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
  for (const { key, photo: photoKey, inDays, city, ...rest } of EVENTS) {
    const date = addDays(today, inDays);
    const event = {
      id: `evt_demo_${key}`,
      ...rest,
      ...cityField(city, { required: true }),
      ...photo(photoKey),
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
      department: person.department,
      experience: person.experience,
      availability: person.availability,
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

  // Demo events from older versions of the prototype: remove them with their demo
  // applications. One that real volunteers applied to is kept, marked cancelled, so their
  // history still makes sense.
  const current = new Set([...events.values()].map((e) => e.id));
  let applications = await db.all('applications');
  for (const event of await db.all('events')) {
    if (event.createdBy !== BY || current.has(event.id)) continue;
    const demoApps = applications.filter((x) => x.eventId === event.id && x.id.startsWith('app_demo_'));
    for (const app of demoApps) {
      await store.hdel('applications', app.id);
      await store.hdel('idx:application', `${event.id}:${app.volunteerId}`);
    }
    applications = applications.filter((x) => !demoApps.includes(x));
    if (applications.some((x) => x.eventId === event.id)) {
      if (event.status !== 'cancelled') await db.put('events', { ...event, status: 'cancelled', updatedAt: svc.nowIso() });
    } else {
      await store.hdel('events', event.id);
    }
  }

  await store.hset('meta', 'demoData', stamp);
  return true;
}
