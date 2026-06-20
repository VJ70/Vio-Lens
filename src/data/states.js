// Indian state codes with fine multipliers per MV Act 2019 amendments
export const STATE_MULTIPLIERS = {
  "DL": { name: "Delhi", multiplier: 1.5 },
  "MH": { name: "Maharashtra", multiplier: 1.2 },
  "KA": { name: "Karnataka", multiplier: 1.0 },
  "TN": { name: "Tamil Nadu", multiplier: 1.0 },
  "UP": { name: "Uttar Pradesh", multiplier: 0.8 },
  "RJ": { name: "Rajasthan", multiplier: 0.8 },
  "GJ": { name: "Gujarat", multiplier: 1.0 },
  "WB": { name: "West Bengal", multiplier: 1.0 },
  "HR": { name: "Haryana", multiplier: 1.1 },
  "PB": { name: "Punjab", multiplier: 1.0 },
  "AP": { name: "Andhra Pradesh", multiplier: 1.0 },
  "TS": { name: "Telangana", multiplier: 1.0 },
  "KL": { name: "Kerala", multiplier: 1.0 },
  "MP": { name: "Madhya Pradesh", multiplier: 0.9 },
  "BR": { name: "Bihar", multiplier: 0.8 },
  "JH": { name: "Jharkhand", multiplier: 0.8 },
  "CG": { name: "Chhattisgarh", multiplier: 0.9 },
  "GA": { name: "Goa", multiplier: 1.0 },
  "HP": { name: "Himachal Pradesh", multiplier: 0.9 },
  "UK": { name: "Uttarakhand", multiplier: 0.9 },
  "JK": { name: "Jammu & Kashmir", multiplier: 0.8 },
  "AS": { name: "Assam", multiplier: 0.8 },
  "OR": { name: "Odisha", multiplier: 0.9 },
  "CH": { name: "Chandigarh", multiplier: 1.2 },
  "BH": { name: "Bihar (BH)", multiplier: 0.8 }
};

// sorted list for dropdown
export const STATE_LIST = Object.entries(STATE_MULTIPLIERS)
  .map(([code, data]) => ({ code, ...data }))
  .sort((a, b) => a.name.localeCompare(b.name));
