const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://backend-flame-seven-64.vercel.app/api"
  : "http://localhost:5000/api";

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
export const TOKEN_KEY = "mtec_admin_token";
export const DEFAULT_COUNTRY_CODE = import.meta.env.VITE_DEFAULT_COUNTRY_CODE || "20";

// "value" is what the API stores, "key" is used for translations
export const SERVICES = [
  { value: "Web Development", key: "web" },
  { value: "Mobile App", key: "mobile" },
  { value: "E-Commerce", key: "ecommerce" },
  { value: "UI/UX Design", key: "uiux" },
  { value: "Digital Marketing", key: "marketing" },
  { value: "Other", key: "other" },
];

export const BUDGETS = [
  { value: "Less than 10,000", key: "lt10" },
  { value: "10,000 - 25,000", key: "b10_25" },
  { value: "25,000 - 50,000", key: "b25_50" },
  { value: "50,000+", key: "b50p" },
  { value: "Not Sure", key: "unsure" },
];

// the order here is the sales pipeline (Lost is the alternative ending)
export const STATUSES = ["New", "Contacted", "Interested", "In Progress", "Won", "Lost"];
export const PIPELINE = ["New", "Contacted", "Interested", "In Progress", "Won"];

export const statusClass = (status) => `st-${String(status).toLowerCase().replace(/\s+/g, "-")}`;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A-Z" },
  { value: "status", label: "Status" },
  { value: "service", label: "Service" },
];

export const COMPANY = {
  name: "MTEC Software",
  email: "info@mtec-eg.com",
  phone: "+20 114 493 0745",
  whatsapp: "201144930745",
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61568788089404" },
    { label: "Instagram", href: "https://www.instagram.com/mtec_software" },
    { label: "TikTok", href: "https://www.tiktok.com/@mtec_software" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/mtec-academy/" },
  ],
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9][0-9\s\-()]{5,19}$/;
