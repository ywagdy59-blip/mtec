const asyncHandler = require("../middleware/asyncHandler");
const Lead = require("../models/Lead");
const { STATUSES, SERVICES } = require("../models/constants");

const MONTHS_BACK = 6;

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [total, statusRows, serviceRows, monthRows, followUpsDue] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: "$service", count: { $sum: 1 } } }]),
    Lead.aggregate([
      { $match: { created_at: { $gte: firstMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } }, count: { $sum: 1 } } },
    ]),
    Lead.countDocuments({
      followUpDate: { $ne: null, $lte: endOfToday },
      status: { $nin: ["Won", "Lost"] },
    }),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  statusRows.forEach((row) => (byStatus[row._id] = row.count));

  const serviceCounts = Object.fromEntries(serviceRows.map((r) => [r._id, r.count]));
  const byService = SERVICES.map((service) => ({ service, count: serviceCounts[service] || 0 }));

  const monthCounts = Object.fromEntries(monthRows.map((r) => [r._id, r.count]));
  const byMonth = Array.from({ length: MONTHS_BACK }, (_, i) => {
    const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
    const key = monthKey(date);
    return { month: key, count: monthCounts[key] || 0 };
  });

  res.status(200).json({
    success: true,
    stats: {
      total,
      new: byStatus["New"],
      contacted: byStatus["Contacted"],
      interested: byStatus["Interested"],
      inProgress: byStatus["In Progress"],
      won: byStatus["Won"],
      lost: byStatus["Lost"],
      followUpsDue,
      byStatus,
      byService,
      byMonth,
    },
  });
});

module.exports = { getStats };
