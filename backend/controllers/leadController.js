const asyncHandler = require("../middleware/asyncHandler");
const Lead = require("../models/Lead");
const { buildFilter, buildSort, leadsToCsv } = require("../services/leadService");

const notFound = (res) => {
  res.status(404);
  throw new Error("Lead not found");
};

// POST /api/leads  (public)
const createLead = asyncHandler(async (req, res) => {
  const { website, ...data } = req.body;

  const response = {
    success: true,
    message: "Your request has been submitted successfully. Our team will contact you soon.",
  };

  // honeypot: bots fill hidden fields. We answer "success" but save nothing.
  if (website) return res.status(201).json(response);

  // status is never read from the body here, so it is always "New"
  const lead = await Lead.create(data);

  // public endpoint: only return the id, never the full record
  res.status(201).json({ ...response, lead: { id: lead.id } });
});

// GET /api/leads?search=&status=&sort=&page=&limit=
const getLeads = asyncHandler(async (req, res) => {
  const { page, limit, search, status, sort } = req.validatedQuery;
  const filter = buildFilter({ search, status });

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort(buildSort(sort))
      .skip((page - 1) * limit)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: leads.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    leads,
  });
});

// GET /api/leads/export  -> CSV file with the same filters
const exportLeads = asyncHandler(async (req, res) => {
  const { search, status, sort } = req.validatedQuery;

  const leads = await Lead.find(buildFilter({ search, status })).sort(buildSort(sort)).limit(10000);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
  res.status(200).send(leadsToCsv(leads));
});

// GET /api/leads/:id
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return notFound(res);

  res.status(200).json({ success: true, lead });
});

// PUT /api/leads/:id
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!lead) return notFound(res);

  res.status(200).json({ success: true, message: "Lead updated successfully", lead });
});

// DELETE /api/leads/:id
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return notFound(res);

  res.status(200).json({ success: true, message: "Lead deleted successfully" });
});

module.exports = { createLead, getLeads, exportLeads, getLeadById, updateLead, deleteLead };
