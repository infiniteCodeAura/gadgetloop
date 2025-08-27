import rateLimit from "express-rate-limit";

// Export the limiter middleware
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: {
    status: 429,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
