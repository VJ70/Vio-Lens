// MV Act 2019 violation definitions with sections and fines
export const VIOLATIONS = {
  helmet_rider: {
    label: "Helmet Non-Compliance (Rider)",
    section: "Section 129",
    description: "Two-wheeler rider not wearing helmet",
    base_fine: 1000,
    repeat_fine: 2000
  },
  helmet_pillion: {
    label: "Helmet Non-Compliance (Pillion)",
    section: "Section 129",
    description: "Pillion rider not wearing helmet",
    base_fine: 1000,
    repeat_fine: 2000
  },
  triple_riding: {
    label: "Triple Riding",
    section: "Section 128",
    description: "More than 2 persons on two-wheeler",
    base_fine: 1000,
    repeat_fine: 2000
  },
  seatbelt: {
    label: "Seatbelt Non-Compliance",
    section: "Section 194B",
    description: "Driver/passenger not wearing seatbelt",
    base_fine: 1000,
    repeat_fine: 1000
  },
  wrong_side: {
    label: "Wrong Side Driving",
    section: "Section 184",
    description: "Driving against traffic flow",
    base_fine: 5000,
    repeat_fine: 10000
  },
  red_light: {
    label: "Red Light Violation",
    section: "Section 177",
    description: "Jumping red light signal",
    base_fine: 1000,
    repeat_fine: 2000
  },
  stop_line: {
    label: "Stop Line Violation",
    section: "Section 177",
    description: "Vehicle beyond stop line at signal",
    base_fine: 1000,
    repeat_fine: 2000
  },
  illegal_parking: {
    label: "Illegal Parking",
    section: "Section 122",
    description: "Vehicle parked in no-parking zone",
    base_fine: 500,
    repeat_fine: 1500
  },
  footpath_encroachment: {
    label: "Footpath Encroachment",
    section: "Section 283",
    description: "Vehicle on pedestrian footpath",
    base_fine: 500,
    repeat_fine: 1500
  },
  overloading: {
    label: "Vehicle Overloading",
    section: "Section 194",
    description: "Excessive load on vehicle",
    base_fine: 2000,
    repeat_fine: 2000
  },
  no_plate: {
    label: "No Visible License Plate",
    section: "Section 192",
    description: "License plate missing or not visible",
    base_fine: 5000,
    repeat_fine: 10000
  }
};
