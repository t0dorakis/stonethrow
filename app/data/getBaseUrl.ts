export const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    // On Vercel (preview/production)
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "development") {
    // Local development
    return "http://localhost:3000";
  }
  // Fallback
  return "";
};
