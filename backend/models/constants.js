// Single source of truth for the allowed values (used by the model + validation)
const STATUSES = ["New", "Contacted", "Interested", "In Progress", "Won", "Lost"];

const SERVICES = [
  "Web Development",
  "Mobile App",
  "E-Commerce",
  "UI/UX Design",
  "Digital Marketing",
  "Other",
];

const BUDGETS = ["Less than 10,000", "10,000 - 25,000", "25,000 - 50,000", "50,000+", "Not Sure"];

module.exports = { STATUSES, SERVICES, BUDGETS };
