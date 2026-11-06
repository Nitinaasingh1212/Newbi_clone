// Demo events for the prototype, so a new volunteer in a major city sees something to apply
// to. They are added once, when the store has no events at all. On Vercel without Redis the
// store resets when the server instance restarts, and the demo events come back with fresh
// dates. Switch off with SEED_DEMO_EVENTS=false or PROTOTYPE.seedDemoEvents in config.js.
import { cityField } from './validate.js';

const NOTE = 'Demo event for the volunteer prototype.';

// inDays: how many days after "today" (India time) the event takes place.
const DEMO_EVENTS = [
  { city: 'Delhi', inDays: 3, title: 'Diwali Night Market', venue: 'Jawaharlal Nehru Stadium', address: 'Gate 14, Lodhi Road', startTime: '16:00', endTime: '23:00', volunteersNeeded: 20, roles: ['Entry gate', 'Ticketing', 'Stall support'], description: 'An evening fair with 40 food and craft stalls and a live stage. Shift includes dinner and a crew tee.' },
  { city: 'Delhi', inDays: 10, title: 'Campus Fest Pro Night', venue: 'Thyagaraj Stadium', address: 'INA', startTime: '17:00', endTime: '22:30', volunteersNeeded: 30, roles: ['Crowd management', 'Backstage', 'Registration desk'], description: 'Headline night of a college fest: 4,000 students, two opening acts and a headliner.' },
  { city: 'Mumbai', inDays: 5, title: 'Indie Live: Sunset Sessions', venue: 'NSCI Dome', address: 'Worli', startTime: '17:30', endTime: '23:00', volunteersNeeded: 25, roles: ['Entry gate', 'Hospitality', 'Merch desk'], description: 'Three indie bands, one stage. Help run entry, the merch desk and the artist green room.' },
  { city: 'Mumbai', inDays: 12, title: 'Sneaker Brand Pop-up', venue: 'Phoenix Palladium', address: 'Lower Parel', startTime: '11:00', endTime: '21:00', volunteersNeeded: 10, roles: ['Queue management', 'Product demo'], description: 'Weekend launch pop-up with a raffle queue and live customisation.' },
  { city: 'Bengaluru', inDays: 4, title: 'Tech Fest Expo Day', venue: 'Bangalore International Exhibition Centre', address: 'Tumkur Road', startTime: '09:30', endTime: '18:00', volunteersNeeded: 40, roles: ['Registration desk', 'Hall guide', 'Speaker support'], description: 'Student tech expo with 120 stalls and a speaker stage.' },
  { city: 'Bengaluru', inDays: 9, title: 'Comedy Night Live', venue: 'Chowdiah Memorial Hall', address: 'Malleshwaram', startTime: '19:00', endTime: '22:00', volunteersNeeded: 8, roles: ['Ticketing', 'Ushering'], description: 'Sold-out stand-up show. Help with ticket checks and seating.' },
  { city: 'Hyderabad', inDays: 6, title: 'EDM Night', venue: 'Gachibowli Stadium', address: 'Gachibowli', startTime: '18:00', endTime: '23:30', volunteersNeeded: 35, roles: ['Crowd management', 'Wristbands', 'First aid support'], description: 'Large-format EDM night. Crowd and wristband teams needed.' },
  { city: 'Pune', inDays: 7, title: 'College Cultural Fest', venue: 'COEP Ground', address: 'Shivajinagar', startTime: '10:00', endTime: '21:00', volunteersNeeded: 30, roles: ['Registration desk', 'Event coordination', 'Backstage'], description: 'Day-long cultural fest with dance, music and fashion competitions.' },
  { city: 'Kolkata', inDays: 8, title: 'Food & Music Carnival', venue: 'Eco Park', address: 'New Town', startTime: '14:00', endTime: '22:00', volunteersNeeded: 18, roles: ['Stall support', 'Entry gate'], description: 'Weekend carnival with food stalls and live bands.' },
  { city: 'Chennai', inDays: 11, title: 'Brand Activation: Beach Run', venue: 'Besant Nagar Beach', address: 'Elliot’s Beach', startTime: '05:30', endTime: '10:00', volunteersNeeded: 15, roles: ['Route marshal', 'Hydration station', 'Registration desk'], description: '5K sunrise run with a sponsor activation zone at the finish.' },
];

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export async function seedDemoEvents(svc) {
  // Claim the flag first so two requests starting at once don't both seed.
  if (!(await svc.store.hsetnx('meta', 'demoEventsSeededAt', svc.nowIso()))) return 0;
  if ((await svc.db.all('events')).length) return 0;
  const today = svc.today();
  const now = svc.nowIso();
  for (const { inDays, description, city, ...demo } of DEMO_EVENTS) {
    await svc.db.put('events', {
      id: svc.newId('evt'),
      ...demo,
      ...cityField(city, { required: true }),
      description: `${description} ${NOTE}`,
      date: addDays(today, inDays),
      status: 'open',
      createdBy: 'Demo data',
      createdAt: now,
      updatedAt: now,
    });
  }
  return DEMO_EVENTS.length;
}
