import rateLimit from 'express-rate-limit';


export const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});