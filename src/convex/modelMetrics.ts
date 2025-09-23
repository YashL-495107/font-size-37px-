import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the latest model performance metrics
export const getLatestMetrics = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await ctx.db
      .query("modelMetrics")
      .order("desc")
      .first();

    // Return default metrics if none exist
    if (!metrics) {
      return {
        modelVersion: "v1.0.0",
        accuracy: 0.947,
        precision: 0.923,
        recall: 0.891,
        f1Score: 0.906,
        trainingDataSize: 9564,
        validationDataSize: 2391,
        featureImportance: [
          { feature: "period", importance: 0.234 },
          { feature: "transitDuration", importance: 0.198 },
          { feature: "planetRadius", importance: 0.187 },
          { feature: "stellarRadius", importance: 0.156 },
          { feature: "stellarMass", importance: 0.134 },
          { feature: "stellarTemperature", importance: 0.091 },
        ],
      };
    }

    return metrics;
  },
});

// Store new model metrics (admin only)
export const updateMetrics = mutation({
  args: {
    modelVersion: v.string(),
    accuracy: v.number(),
    precision: v.number(),
    recall: v.number(),
    f1Score: v.number(),
    trainingDataSize: v.number(),
    validationDataSize: v.number(),
    featureImportance: v.optional(v.array(v.object({
      feature: v.string(),
      importance: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    // In a real app, you'd check for admin permissions here
    const metricsId = await ctx.db.insert("modelMetrics", args);
    return metricsId;
  },
});

// Get all model versions and their metrics
export const getAllMetrics = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await ctx.db
      .query("modelMetrics")
      .order("desc")
      .collect();

    return metrics;
  },
});
