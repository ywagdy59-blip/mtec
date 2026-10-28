const Stripe = require("stripe");

let stripe;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe checkout is not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
};

module.exports = getStripe;
