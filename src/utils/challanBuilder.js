// Builds challan objects from analysis results
// Aggregates violations per vehicle, applies state-specific fines

import { v4 as uuidv4 } from "uuid";
import { VIOLATIONS } from "../data/mvact";
import { STATE_MULTIPLIERS } from "../data/states";

// build a challan for a single vehicle with its violations
export function buildChallan(vehicle, violations, selectedState, evidenceImage) {
  const stateInfo = STATE_MULTIPLIERS[selectedState] || { name: "Unknown", multiplier: 1.0 };
  const multiplier = stateInfo.multiplier;

  // compute fine for each violation
  const violationDetails = violations.map((v) => {
    const vInfo = VIOLATIONS[v.type] || {};
    const baseFine = vInfo.base_fine || 500;
    const adjustedFine = Math.round(baseFine * multiplier);
    return {
      type: v.type,
      label: vInfo.label || v.type,
      section: vInfo.section || "N/A",
      description: vInfo.description || "",
      confidence: v.confidence,
      severity: v.severity,
      base_fine: baseFine,
      adjusted_fine: adjustedFine
    };
  });

  const totalFine = violationDetails.reduce((sum, v) => sum + v.adjusted_fine, 0);

  return {
    challan_id: uuidv4(),
    timestamp: new Date().toISOString(),
    camera_id: "CAM-DEMO-01",
    vehicle: {
      id: vehicle.id,
      class: vehicle.class,
      plate: vehicle.plate,
      occupants: vehicle.occupants,
      position: vehicle.position,
      confidence: vehicle.confidence
    },
    violations: violationDetails,
    total_fine: totalFine,
    state: selectedState,
    state_name: stateInfo.name,
    multiplier,
    evidence_image: evidenceImage
  };
}

// build challans for all vehicles in an analysis result
export function buildAllChallans(analysisResult, selectedState, evidenceImage) {
  if (!analysisResult?.vehicles) return [];

  return analysisResult.vehicles
    .filter((v) => {
      // only create challans for vehicles that have violations
      const vehicleViolations = (analysisResult.violations || []).filter(
        (viol) => viol.vehicle_id === v.id
      );
      return vehicleViolations.length > 0;
    })
    .map((vehicle) => {
      const vehicleViolations = analysisResult.violations.filter(
        (viol) => viol.vehicle_id === vehicle.id
      );
      return buildChallan(vehicle, vehicleViolations, selectedState, evidenceImage);
    });
}
