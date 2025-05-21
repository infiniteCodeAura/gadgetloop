import sanitizeHtml from "sanitize-html";
import validator from "validator";
export const sanitizeData = (input) => {
  // If it's a number or can be converted to a valid number
  if (typeof input !== "string") {
    if (!isNaN(Number(input))) {
      return Number(input);
    } else {
      return input; // return as-is if not a valid number
    }
  }

  // If it's a string, sanitize it
  let data = input.trim();
  data = validator.escape(data);
  data = sanitizeHtml(data, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return data;
};

export const emailSanitize = (input) => {
  if (typeof input !== "string" && typeof input !== "number") {
    return "";
  }

  // Convert to string and trim
  let rawEmail = input.toString().trim();

  // Sanitize HTML
  rawEmail = sanitizeHtml(rawEmail, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Normalize email (fix format like capital letters, etc.)
  const email = validator.normalizeEmail(rawEmail, {
    gmail_remove_dots: false,
  });

  // Validate the result
  if (!email || !validator.isEmail(email)) {
    return "";
  }

  return email;
};

