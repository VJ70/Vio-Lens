// Indian vehicle classes for detection
export const VEHICLE_CLASSES = {
  car: {
    label: "Car",
    icon: "🚗",
    color: "#3b82f6",
    applicableViolations: ["seatbelt", "wrong_side", "red_light", "stop_line", "illegal_parking", "no_plate"]
  },
  motorcycle: {
    label: "Motorcycle",
    icon: "🏍️",
    color: "#ef4444",
    applicableViolations: ["helmet_rider", "helmet_pillion", "triple_riding", "wrong_side", "red_light", "stop_line", "no_plate"]
  },
  auto_rickshaw: {
    label: "Auto Rickshaw",
    icon: "🛺",
    color: "#f59e0b",
    applicableViolations: ["overloading", "wrong_side", "red_light", "stop_line", "illegal_parking", "no_plate"]
  },
  e_rickshaw: {
    label: "E-Rickshaw",
    icon: "🔋",
    color: "#10b981",
    applicableViolations: ["overloading", "wrong_side", "red_light", "stop_line", "no_plate"]
  },
  truck: {
    label: "Truck",
    icon: "🚛",
    color: "#6366f1",
    applicableViolations: ["overloading", "wrong_side", "red_light", "stop_line", "illegal_parking", "no_plate"]
  },
  bus: {
    label: "Bus",
    icon: "🚌",
    color: "#8b5cf6",
    applicableViolations: ["overloading", "wrong_side", "red_light", "stop_line", "no_plate"]
  },
  tempo: {
    label: "Tempo",
    icon: "🚐",
    color: "#ec4899",
    applicableViolations: ["overloading", "wrong_side", "red_light", "stop_line", "illegal_parking", "no_plate"]
  },
  cycle: {
    label: "Bicycle",
    icon: "🚲",
    color: "#14b8a6",
    applicableViolations: ["wrong_side", "footpath_encroachment"]
  },
  pedestrian: {
    label: "Pedestrian",
    icon: "🚶",
    color: "#64748b",
    applicableViolations: []
  }
};
