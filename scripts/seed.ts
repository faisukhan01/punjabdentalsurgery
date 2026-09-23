// Seed demo data so the admin dashboard has meaningful numbers on first open.
// Safe to re-run: clears Appointment + Visit tables first.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const KARACHI_OFFSET_MS = 5 * 60 * 60 * 1000;

function dayStr(offsetDays: number): string {
  return new Date(Date.now() + KARACHI_OFFSET_MS + offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

function dateTimeOnDay(dayOffset: number, hourUTC: number): Date {
  const d = new Date();
  d.setUTCHours(hourUTC, Math.floor(Math.random() * 59), 0, 0);
  return new Date(d.getTime() - dayOffset * 86_400_000);
}

const SERVICES = [
  "General Dental Checkup",
  "Teeth Cleaning & Scaling",
  "Tooth Filling",
  "Root Canal Treatment",
  "Tooth Extraction",
  "Teeth Whitening",
  "Braces & Orthodontics",
  "Dental Implants",
  "Crown & Bridge",
  "Kids Dentistry",
  "Emergency Dental Care",
];

const NAMES = [
  "Ahmed Raza",
  "Fatima Khan",
  "Muhammad Bilal",
  "Ayesha Malik",
  "Usman Tariq",
  "Sana Javed",
  "Hamza Sheikh",
  "Zainab Iqbal",
  "Kashif Nawaz",
  "Maryam Aslam",
  "Bilal Chaudhry",
  "Hira Shahid",
];

const SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
];

async function main() {
  await db.appointment.deleteMany();
  await db.visit.deleteMany();

  // Appointments spread across the past week, today and the next two days.
  const plan: { day: number; status: string }[] = [
    { day: -6, status: "COMPLETED" },
    { day: -5, status: "COMPLETED" },
    { day: -4, status: "COMPLETED" },
    { day: -3, status: "COMPLETED" },
    { day: -3, status: "CANCELLED" },
    { day: -2, status: "COMPLETED" },
    { day: -1, status: "CONFIRMED" },
    { day: 0, status: "PENDING" },
    { day: 0, status: "CONFIRMED" },
    { day: 0, status: "PENDING" },
    { day: 1, status: "PENDING" },
    { day: 2, status: "PENDING" },
  ];

  let nameIdx = 0;
  const usedSlotByDay = new Map<string, Set<string>>();

  for (const p of plan) {
    const date = dayStr(p.day);
    if (!usedSlotByDay.has(date)) usedSlotByDay.set(date, new Set());
    const used = usedSlotByDay.get(date)!;

    let timeSlot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    while (used.has(timeSlot)) {
      timeSlot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    }
    used.add(timeSlot);

    const name = NAMES[nameIdx++ % NAMES.length];
    await db.appointment.create({
      data: {
        name,
        phone: `03${Math.floor(10 + Math.random() * 89)}${Math.floor(1000000 + Math.random() * 8999999)}`,
        email: null,
        service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
        date,
        timeSlot,
        message: Math.random() > 0.5 ? "Please call to confirm the timing." : null,
        status: p.status,
        createdAt: dateTimeOnDay(Math.max(0, -p.day), 6 + Math.floor(Math.random() * 12)),
      },
    });
  }

  // Visits across the last 7 days — ~70% mobile (matches the clinic's audience).
  const devices = ["mobile", "mobile", "mobile", "mobile", "mobile", "mobile", "mobile", "desktop", "desktop", "tablet"];
  let sessionCounter = 0;
  for (let day = 6; day >= 0; day--) {
    const visitsCount = day === 0 ? 9 : 4 + Math.floor(Math.random() * 8);
    const sessions = Math.max(2, Math.floor(visitsCount * 0.7));
    const sessionIds = Array.from({ length: sessions }, () => `seed-sess-${++sessionCounter}`);
    for (let i = 0; i < visitsCount; i++) {
      await db.visit.create({
        data: {
          sessionId: sessionIds[i % sessions],
          device: devices[Math.floor(Math.random() * devices.length)],
          createdAt: dateTimeOnDay(day, 5 + Math.floor(Math.random() * 16)),
        },
      });
    }
  }

  const appts = await db.appointment.count();
  const visits = await db.visit.count();
  console.log(`Seeded ${appts} appointments and ${visits} visits.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
