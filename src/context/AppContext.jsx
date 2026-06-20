// Global application state via React Context
// Manages: image, analysis results, challans, stats, settings

import { createContext, useContext, useReducer, useCallback } from "react";

const AppContext = createContext(null);

const initialState = {
  // image state
  originalImage: null, // base64 data URL of uploaded image
  processedImage: null, // base64 after weather preprocessing
  weatherMode: "normal",
  selectedState: "DL",

  // analysis state
  analysisResult: null,
  isAnalyzing: false,
  error: null,

  // challan state
  challans: [],

  // session analytics
  sessionStats: {
    totalImagesAnalyzed: 0,
    totalVehiclesDetected: 0,
    totalViolationsFound: 0,
    totalChallansGenerated: 0,
    violationBreakdown: {},
    vehicleBreakdown: {}
  }
};

// reducer handles all state transitions
function appReducer(state, action) {
  switch (action.type) {
    case "SET_ORIGINAL_IMAGE":
      return {
        ...state,
        originalImage: action.payload,
        processedImage: null,
        analysisResult: null,
        challans: [],
        error: null
      };

    case "SET_PROCESSED_IMAGE":
      return { ...state, processedImage: action.payload };

    case "SET_WEATHER_MODE":
      return { ...state, weatherMode: action.payload };

    case "SET_SELECTED_STATE":
      return { ...state, selectedState: action.payload };

    case "SET_ANALYZING":
      return { ...state, isAnalyzing: action.payload, error: null };

    case "SET_ANALYSIS_RESULT":
      return { ...state, analysisResult: action.payload, isAnalyzing: false };

    case "SET_ERROR":
      return { ...state, error: action.payload, isAnalyzing: false };

    case "ADD_CHALLANS": {
      const newChallans = [...state.challans, ...action.payload];
      return { ...state, challans: newChallans };
    }

    case "UPDATE_STATS": {
      const result = action.payload;
      const stats = { ...state.sessionStats };
      stats.totalImagesAnalyzed += 1;
      stats.totalVehiclesDetected += result.total_vehicles || 0;
      stats.totalViolationsFound += result.total_violations || 0;

      // accumulate violation types
      (result.violations || []).forEach((v) => {
        stats.violationBreakdown[v.type] = (stats.violationBreakdown[v.type] || 0) + 1;
      });

      // accumulate vehicle classes
      (result.vehicles || []).forEach((v) => {
        stats.vehicleBreakdown[v.class] = (stats.vehicleBreakdown[v.class] || 0) + 1;
      });

      return { ...state, sessionStats: stats };
    }

    case "UPDATE_CHALLAN_STATS": {
      const stats = { ...state.sessionStats };
      stats.totalChallansGenerated += action.payload;
      return { ...state, sessionStats: stats };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // convenience action dispatchers
  const setOriginalImage = useCallback((img) => dispatch({ type: "SET_ORIGINAL_IMAGE", payload: img }), []);
  const setProcessedImage = useCallback((img) => dispatch({ type: "SET_PROCESSED_IMAGE", payload: img }), []);
  const setWeatherMode = useCallback((mode) => dispatch({ type: "SET_WEATHER_MODE", payload: mode }), []);
  const setSelectedState = useCallback((st) => dispatch({ type: "SET_SELECTED_STATE", payload: st }), []);
  const setAnalyzing = useCallback((v) => dispatch({ type: "SET_ANALYZING", payload: v }), []);
  const setAnalysisResult = useCallback((r) => dispatch({ type: "SET_ANALYSIS_RESULT", payload: r }), []);
  const setError = useCallback((e) => dispatch({ type: "SET_ERROR", payload: e }), []);
  const addChallans = useCallback((c) => dispatch({ type: "ADD_CHALLANS", payload: c }), []);
  const updateStats = useCallback((r) => dispatch({ type: "UPDATE_STATS", payload: r }), []);
  const updateChallanStats = useCallback((n) => dispatch({ type: "UPDATE_CHALLAN_STATS", payload: n }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = {
    ...state,
    setOriginalImage,
    setProcessedImage,
    setWeatherMode,
    setSelectedState,
    setAnalyzing,
    setAnalysisResult,
    setError,
    addChallans,
    updateStats,
    updateChallanStats,
    reset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// hook to access app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
