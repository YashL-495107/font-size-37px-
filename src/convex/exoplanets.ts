import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Define the exoplanet data structure
export const exoplanetValidator = v.object({
  keplerName: v.optional(v.string()),
  period: v.number(), // Orbital period in days
  transitDuration: v.number(), // Transit duration in hours
  planetRadius: v.number(), // Planet radius in Earth radii
  stellarRadius: v.number(), // Stellar radius in solar radii
  stellarMass: v.number(), // Stellar mass in solar masses
  stellarTemperature: v.number(), // Stellar effective temperature in K
  equilibriumTemperature: v.optional(v.number()), // Planet equilibrium temperature in K
  insolationFlux: v.optional(v.number()), // Insolation flux in Earth flux
  classification: v.union(
    v.literal("CONFIRMED"),
    v.literal("CANDIDATE"), 
    v.literal("FALSE_POSITIVE")
  ),
  confidence: v.optional(v.number()), // AI model confidence score (0-1)
  source: v.union(v.literal("KEPLER"), v.literal("K2"), v.literal("TESS")),
});

// Store exoplanet predictions
export const createPrediction = mutation({
  args: {
    data: exoplanetValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create predictions");
    }

    const predictionId = await ctx.db.insert("predictions", {
      userId: user._id,
      ...args.data,
    });

    return predictionId;
  },
});

// Get user's predictions
export const getUserPredictions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    return predictions;
  },
});

// Get prediction statistics
export const getPredictionStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        totalPredictions: 0,
        confirmedPlanets: 0,
        candidates: 0,
        falsePositives: 0,
        averageConfidence: 0,
      };
    }

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const totalPredictions = predictions.length;
    const confirmedPlanets = predictions.filter(p => p.classification === "CONFIRMED").length;
    const candidates = predictions.filter(p => p.classification === "CANDIDATE").length;
    const falsePositives = predictions.filter(p => p.classification === "FALSE_POSITIVE").length;
    
    const confidenceScores = predictions
      .filter(p => p.confidence !== undefined)
      .map(p => p.confidence!);
    
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length
      : 0;

    return {
      totalPredictions,
      confirmedPlanets,
      candidates,
      falsePositives,
      averageConfidence,
    };
  },
});

// Batch create predictions from CSV upload
export const batchCreatePredictions = mutation({
  args: {
    predictions: v.array(exoplanetValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create predictions");
    }

    const predictionIds = [];
    for (const prediction of args.predictions) {
      const id = await ctx.db.insert("predictions", {
        userId: user._id,
        ...prediction,
      });
      predictionIds.push(id);
    }

    return predictionIds;
  },
});
