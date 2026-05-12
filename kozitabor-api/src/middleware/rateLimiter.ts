import rateLimit from "express-rate-limit";

const isTest = () => process.env.NODE_ENV === "test";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: isTest,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok bejelentkezési kísérlet. Próbálj újra 15 perc múlva." },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: isTest,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok kérés. Próbálj újra később." },
});
