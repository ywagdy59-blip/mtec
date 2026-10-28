const { STATUSES } = require("../models/constants");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORTS = {
  newest: { created_at: -1 },
  oldest: { created_at: 1 },
  name: { name: 1 },
  status: { status: 1, created_at: -1 },
  service: { service: 1, created_at: -1 },
};

// builds the Mongo filter from ?search= and ?status=
const buildFilter = ({ search, status }) => {
  const filter = {};

  if (status && status !== "All" && STATUSES.includes(status)) filter.status = status;

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { company: regex }];
  }

  return filter;
};

const buildSort = (sort) => ({ ...(SORTS[sort] || SORTS.newest), _id: -1 });

// CSV cells that start with = + - @ can run as formulas in Excel, so we neutralize them
const csvCell = (value) => {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const leadsToCsv = (leads) => {
  const columns = [
    ["ID", (l) => l.id],
    ["Name", (l) => l.name],
    ["Email", (l) => l.email],
    ["Phone", (l) => l.phone],
    ["Company", (l) => l.company],
    ["Service", (l) => l.service],
    ["Budget", (l) => l.budget],
    ["Status", (l) => l.status],
    ["Message", (l) => l.message],
    ["Notes", (l) => l.notes],
    ["Follow-up date", (l) => l.followUpDate],
    ["Created at", (l) => l.created_at],
    ["Updated at", (l) => l.updated_at],
  ];

  const header = columns.map(([title]) => csvCell(title)).join(",");
  const rows = leads.map((lead) => columns.map(([, get]) => csvCell(get(lead))).join(","));

  // BOM so Excel opens Arabic text correctly
  return "\uFEFF" + [header, ...rows].join("\r\n");
};

module.exports = { buildFilter, buildSort, leadsToCsv };
