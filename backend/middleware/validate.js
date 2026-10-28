
const Joi = require("joi");
const { STATUSES, SERVICES, BUDGETS } = require("../models/constants");

const OPTIONS = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

// ---------------- common schemas ----------------

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid ID",
  });

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
  .messages({
    "object.min": "Provide at least one field to update",
  });

// ---------------- auth schemas ----------------

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).max(128).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required(),
  newPassword: Joi.string().min(6).max(72).required(),
}).unknown(false);

// ---------------- ID schemas ----------------

const idSchema = Joi.object({
  id: objectId.required(),
});

// ---------------- lead query schema ----------------

const leadQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(""),
  status: Joi.string().valid("All", ...STATUSES),
  sort: Joi.string()
    .valid("newest", "oldest", "name", "status", "service")
    .default("newest"),
});

// ---------------- course schemas ----------------

const courseFields = {
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().min(1).max(10000),
  price: Joi.number().min(0).max(100000000),
  category: objectId,
  level: Joi.string().trim().min(1).max(50),
  thumbnail: Joi.string().trim().max(2048).allow(""),
  isPublished: Joi.boolean(),
};

const validateCourseSchema = Joi.object({
  ...courseFields,
  title: courseFields.title.required(),
  description: courseFields.description.required(),
  price: courseFields.price.required(),
  category: courseFields.category.required(),
  level: courseFields.level.required(),
});

const validateUpdateCourseSchema = Joi.object(courseFields).min(1).messages({
  "object.min": "Provide at least one field to update",
});

const courseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(""),
  category: objectId,
  level: Joi.string().trim().max(50),
  sort: Joi.string()
    .valid("newest", "oldest", "price_asc", "price_desc")
    .default("newest"),
  isPublished: Joi.boolean(),
});
// ---------------- category schemas ----------------

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(500).allow("").optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  description: Joi.string().trim().max(500).allow(""),
})
  .min(1)
  .messages({
    "object.min": "Provide at least one field to update",
  });

// ---------------- validator factory ----------------

const makeValidator = (source, message, target) => (schema) =>
  (req, res, next) => {
    const { error, value } = schema.validate(
      req[source] ?? {},
      OPTIONS
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message,
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Express 5 req.query is read-only.
    req[target || source] = value;

    return next();
  };

const body = makeValidator("body", "Validation error");
const params = makeValidator("params", "Invalid URL parameters");
const query = makeValidator(
  "query",
  "Invalid query parameters",
  "validatedQuery"
);

// Normalize budget ranges such as "5000 – 10000".
const normalizeBudget = (req, res, next) => {
  if (req.body && typeof req.body.budget === "string") {
    req.body.budget = req.body.budget
      .replace(/\s*[–—]\s*/g, " - ")
      .trim();
  }

  return next();
};
// ---------------- payment schemas ----------------

const checkoutSchema = Joi.object({
  courseId: objectId.required(),
}).unknown(false);

const guestCheckoutSchema = Joi.object({
  courseId: objectId.required(),
  method: Joi.string().valid("card", "cash").required(),
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().max(254).email().required(),
  phone: phoneField.required(),
}).unknown(false);

const sessionIdSchema = Joi.object({
  sessionId: Joi.string()
    .trim()
    .pattern(/^cs_(test|live)_[A-Za-z0-9]+$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Stripe session ID",
    }),
});
// ---------------- exports ----------------

module.exports = {
  // Leads
  validateCreateLead: [normalizeBudget, body(createLeadSchema)],
  validateUpdateLead: [normalizeBudget, body(updateLeadSchema)],
  validateLeadQuery: query(leadQuerySchema),

  // Authentication
  validateLogin: body(loginSchema),
  validateChangePassword: body(changePasswordSchema),

  // IDs
  validateId: params(idSchema),
  validateObjectId: params(idSchema),
  validateCourseId: params(idSchema),

  // Courses
  validateCourse: body(validateCourseSchema),
  validateUpdateCourse: body(validateUpdateCourseSchema),
  validateCourseQuery: query(courseQuerySchema),
  validateCategory: body(categorySchema),
validateUpdateCategory: body(updateCategorySchema),
validateCheckout: body(checkoutSchema),
validateGuestCheckout: body(guestCheckoutSchema),
validateSessionId: params(sessionIdSchema),
};
