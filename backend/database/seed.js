// npm run seed         -> creates the admin + sample leads (only if there are no leads yet)
// npm run seed:reset   -> deletes all leads first, then inserts the sample leads again
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./connection");
const User = require("../models/User");
const Lead = require("../models/Lead");

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const inDays = (days) => daysAgo(-days);

const SAMPLE_LEADS = [
  { name: "Ahmed Mohamed", email: "ahmed@example.com", phone: "01000000000", company: "ABC Company", service: "Web Development", budget: "10,000 - 25,000", message: "I need a company website with a blog and an admin panel.", status: "New", created_at: daysAgo(0) },
  { name: "Sara Hassan", email: "sara.hassan@example.com", phone: "01011112222", company: "Nile Fashion", service: "E-Commerce", budget: "25,000 - 50,000", message: "We want an online store with card payments and delivery tracking.", status: "Contacted", created_at: daysAgo(2), notes: "Called on Sunday. Wants a demo next week." },
  { name: "Omar Khaled", email: "omar.k@example.com", phone: "01122223333", company: "", service: "Mobile App", budget: "50,000+", message: "A food delivery app for iOS and Android, with a driver app.", status: "Interested", created_at: daysAgo(4), followUpDate: inDays(1) },
  { name: "Mona Adel", email: "mona.adel@example.com", phone: "01233334444", company: "Bright Clinic", service: "UI/UX Design", budget: "Less than 10,000", message: "Redesign of our patient booking screens.", status: "In Progress", created_at: daysAgo(9) },
  { name: "Youssef Ibrahim", email: "youssef@example.com", phone: "01544445555", company: "Delta Logistics", service: "Other", budget: "50,000+", message: "Custom fleet management system with live tracking.", status: "Won", created_at: daysAgo(20), notes: "Contract signed. Kickoff next month." },
  { name: "Laila Samir", email: "laila.samir@example.com", phone: "01055556666", company: "Samir Studio", service: "Digital Marketing", budget: "Not Sure", message: "Social media campaigns and SEO for a new design studio.", status: "Lost", created_at: daysAgo(25) },
  { name: "Karim Nabil", email: "karim.nabil@example.com", phone: "01166667777", company: "Nabil Real Estate", service: "Web Development", budget: "10,000 - 25,000", message: "Property listing website with search filters and a map.", status: "New", created_at: daysAgo(1) },
  { name: "Hana Mostafa", email: "hana.m@example.com", phone: "01277778888", company: "", service: "Mobile App", budget: "25,000 - 50,000", message: "A fitness tracking app with workout plans and reminders.", status: "Contacted", created_at: daysAgo(35), followUpDate: daysAgo(1) },
  { name: "Tamer Fathy", email: "tamer.fathy@example.com", phone: "01588889999", company: "Fathy Trading", service: "E-Commerce", budget: "10,000 - 25,000", message: "Move our wholesale catalog online with price tiers.", status: "In Progress", created_at: daysAgo(48) },
  { name: "Nour El-Din", email: "nour@example.com", phone: "01099990000", company: "Nour Academy", service: "Web Development", budget: "Less than 10,000", message: "A simple site for our language school with a booking form.", status: "Won", created_at: daysAgo(70) },
];

const seedAdmin = async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = String(process.env.ADMIN_NAME || "Admin").trim();

  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin ${email} already exists`);
    return;
  }

  await User.create({ name, email, password, role: "admin" });
  console.log(`Admin created: ${email}`);
};

const seedLeads = async () => {
  if (process.argv.includes("--reset")) {
    await Lead.deleteMany({});
    console.log("All leads deleted");
  }

  if ((await Lead.countDocuments()) > 0) {
    console.log("Leads already exist, skipping sample data (use npm run seed:reset to replace them)");
    return;
  }

  await Lead.insertMany(SAMPLE_LEADS);
  console.log(`${SAMPLE_LEADS.length} sample leads inserted`);
};

(async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedLeads();
    console.log("Seeding finished");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
