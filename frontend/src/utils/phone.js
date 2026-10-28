import { DEFAULT_COUNTRY_CODE } from "./constants";

// "+20 100 000 0000" / "01000000000" / "0020100..." -> "201000000000" (digits only, with country code)
export const toInternational = (phone = "") => {
  const trimmed = String(phone).trim();
  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return DEFAULT_COUNTRY_CODE + digits.slice(1);
  return digits;
};

export const telLink = (phone) => `tel:${String(phone).replace(/[^\d+]/g, "")}`;
export const whatsappLink = (phone, text = "") =>
  `https://wa.me/${toInternational(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mailLink = (email, subject = "") =>
  `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
