const express = require("express");
const router = express.Router();

const {
  createLead,
  getLeads,
  exportLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { leadFormLimiter } = require("../middleware/rateLimit");
const {
  validateCreateLead,
  validateUpdateLead,
  validateId,
  validateLeadQuery,
} = require("../middleware/validate");

// Public: the website form
router.post("/", leadFormLimiter, validateCreateLead, createLead);

// Everything below is private (logged-in admins only)
router.use(auth, admin);

router.get("/", validateLeadQuery, getLeads);
router.get("/export", validateLeadQuery, exportLeads); // must stay before "/:id"
router.get("/:id", validateId, getLeadById);
router.put("/:id", validateId, validateUpdateLead, updateLead);
router.delete("/:id", validateId, deleteLead);

module.exports = router;
