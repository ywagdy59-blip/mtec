const Joi = require("joi");
const { STATUSES, SERVICES, BUDGETS } = require("../models/constants");

const OPTIONS = { abortEarly: false, stripUnknown: true, convert: true };

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ "string.pattern.base": "{{#label}} must be a valid ID" });

// digits, spaces and + - ( ) only, 7 to 20 characters
const phoneField = Joi.string()
  .trim()
  .pattern(/^\+?[0-9][0-9\s\-()]{5,19}$/)
  .messages({
    "string.pattern.base": "Phone must be a valid phone number",
    "string.empty": "Phone is required",
  });

// ---------------- lead schemas ----------------
const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().max(254).email().required(),
  phone: phoneField.required(),
  company: Joi.string().trim().max(100).allow("").optional(),
  service: Joi.string().valid(...SERVICES).required(),
  budget: Joi.string().valid(...BUDGETS).allow("").optional(),
  message: Joi.string().trim().min(1).max(2000).required(),
  // honeypot field: real visitors never fill this
  website: Joi.string().allow("").max(200).optional(),
});

const updateLeadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: phoneField,
  company: Joi.string().trim().max(100).allow(""),
  service: Joi.string().valid(...SERVICES),
  budget: Joi.string().valid(...BUDGETS).allow(""),
  message: Joi.string().trim().min(1).max(2000),
  status: Joi.string().valid(...STATUSES),
  notes: Joi.string().trim().max(2000).allow(""),
  followUpDate: Joi.date().iso().allow(null),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).max(128).required(),
});

const idSchema = Joi.object({ id: objectId.required() });

const leadQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(""),
  status: Joi.string().valid("All", ...STATUSES),
  sort: Joi.string().valid("newest", "oldest", "name", "status", "service").default("newest"),
});

// ---------------- factory ----------------
const makeValidator = (source, message, target) => (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req[source] ?? {}, OPTIONS);

  if (error) {
    return res.status(400).json({
      success: false,
      message,
      errors: error.details.map((d) => d.message),
    });
  }

  // req.query is read-only in Express 5, so we store it somewhere else
  req[target || source] = value;
  next();
};

const body = makeValidator("body", "Validation error");
const params = makeValidator("params", "Invalid URL parameters");
const query = makeValidator("query", "Invalid query parameters", "validatedQuery");

// the brief writes budgets with an en dash (–), the API stores a normal hyphen
const normalizeBudget = (req, res, next) => {
  if (req.body && typeof req.body.budget === "string") {
    req.body.budget = req.body.budget.replace(/\s*[–—]\s*/g, " - ").trim();
  }
  next();
};

module.exports = {
  validateCreateLead: [normalizeBudget, body(createLeadSchema)],
  validateUpdateLead: [normalizeBudget, body(updateLeadSchema)],
  validateLogin: body(loginSchema),
  validateId: params(idSchema),
  validateLeadQuery: query(leadQuerySchema),
};
