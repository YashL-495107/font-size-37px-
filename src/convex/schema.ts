import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Exoplanet predictions table
    predictions: defineTable({
      userId: v.id("users"), // User who made the prediction
      keplerName: v.optional(v.string()), // Kepler object name if available
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
      ), // AI model prediction
      confidence: v.optional(v.number()), // AI model confidence score (0-1)
      source: v.union(v.literal("KEPLER"), v.literal("K2"), v.literal("TESS")), // Data source
    })
      .index("by_user_id", ["userId"])
      .index("by_classification", ["classification"])
      .index("by_source", ["source"]),

    // Model performance metrics
    modelMetrics: defineTable({
      modelVersion: v.string(), // Version identifier for the model
      accuracy: v.number(), // Overall accuracy
      precision: v.number(), // Precision score
      recall: v.number(), // Recall score
      f1Score: v.number(), // F1 score
      trainingDataSize: v.number(), // Number of training samples
      validationDataSize: v.number(), // Number of validation samples
      featureImportance: v.optional(v.array(v.object({
        feature: v.string(),
        importance: v.number(),
      }))), // Feature importance scores
    }).index("by_model_version", ["modelVersion"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;