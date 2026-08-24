import { z } from "zod";

export const novaGroupSchema = z.enum([
  "1 - Unprocessed or Minimally Processed",
  "2 - Processed Culinary Ingredients",
  "3 - Processed Foods",
  "4 - Ultra-Processed Food (UPF)",
]);

export const concernLevelSchema = z.enum(["Low", "Moderate", "High"]);

export const consumptionAdviceSchema = z.enum([
  "Safe for Daily Consumption",
  "Occasional (1-2 times per week)",
  "Strictly a Treat / Highly Processed",
]);

export const claimAuditItemSchema = z.object({
  claim: z
    .string()
    .min(1)
    .describe("Front-of-pack marketing claim exactly as seen or faithfully inferred."),
  reality: z
    .string()
    .min(1)
    .describe("Short truth-check explaining whether the claim matches the ingredient reality."),
});

export const insCodeDecodedSchema = z.object({
  code: z.string().min(1).describe("INS additive code, for example INS 150c, INS 500(ii), INS 322, or INS 627."),
  name: z.string().min(1).describe("Decoded chemical or additive name."),
  category: z.string().min(1).describe("Additive category such as Preservative, Flavor Enhancer, Color, or Emulsifier."),
  purpose: z.string().min(1).describe("Why the manufacturer uses the additive."),
  concernLevel: concernLevelSchema.describe("Practical risk flag for regular consumption."),
  explanation: z
    .string()
    .min(1)
    .describe("Simple-language health context focused on gut microbiome, metabolic, or inflammatory impact."),
});

export const sugarMetricsSchema = z.object({
  sugarPer100g: z.coerce
    .number()
    .min(0)
    .max(1000)
    .default(0)
    .describe("Total or added sugar in grams per 100g or 100ml based on the nutrition table."),
  teaspoonsEquivalent: z.coerce
    .number()
    .min(0)
    .max(250)
    .default(0)
    .describe("Sugar grams converted using 4 grams per household teaspoon."),
  hiddenSugarAliases: z
    .array(z.string().min(1))
    .nullish()
    .transform((val) => val ?? [])
    .default([])
    .describe("Disguised sugar aliases detected in the ingredients list (e.g. Maltodextrin, Invert Syrup, Corn Solids)."),
});

export const fatMetricsSchema = z.object({
  primaryOil: z
    .string()
    .nullish()
    .transform((val) => val || "Not Disclosed")
    .default("Not Disclosed")
    .describe("Dominant fat source such as Refined Palmolein Oil, Butter, or Cold-Pressed Mustard Oil."),
  isRefinedOrHydrogenated: z
    .boolean()
    .default(false)
    .describe("True if the label indicates refined, interesterified, or hydrogenated oils/fats."),
});

export const cleanPackagedSwapSchema = z.object({
  name: z.string().min(1).describe("Specific real clean packaged product name (e.g. 'The Whole Truth 100% Cacao Almond Mix')."),
  brandOrType: z.string().min(1).describe("Brand name (e.g. 'The Whole Truth / Two Brothers Organic Farms')."),
  whyBetter: z.string().min(1).describe("Exact nutritional proof: 0g added refined sugar, 0 palm oil, 100% whole food."),
});

export const desiKitchenSwapSchema = z.object({
  name: z.string().min(1).describe("Traditional 100% whole-food Indian kitchen recipe (e.g. 'Roasted Chana Sattu Badam Shake')."),
  recipeOrFormat: z.string().min(1).describe("Step-by-step home kitchen preparation method."),
  whyBetter: z.string().min(1).describe("Nutritional superiority over industrial ultra-processed foods."),
});

export const recommendationsSchema = z.object({
  cleanPackagedSwap: cleanPackagedSwapSchema,
  desiKitchenSwap: desiKitchenSwapSchema,
});

export const dailyRiskItemSchema = z.object({
  impactArea: z.string().min(1).describe("Target bodily system e.g. 'Metabolic & Blood Sugar', 'Gut Barrier & Microbiome', 'Cardiovascular & Liver'."),
  effect: z.string().min(1).describe("What happens to your body if consumed on a daily basis over months/years."),
  severity: concernLevelSchema.describe("Severity rating: Low, Moderate, High."),
});

export const ingredientItemSchema = z.object({
  name: z.string().min(1).describe("Ingredient name as listed on the packet."),
  category: z.string().min(1).describe("Category e.g. 'Refined Sugar', 'Refined Fat', 'Synthetic Additive', 'Whole Food', 'Mineral/Vitamin'."),
  status: z.enum(["safe", "caution", "alert"]).describe("Health status tag."),
  description: z.string().optional().describe("Brief note on what this ingredient is."),
});

export const NiramaAnalysisSchema = z.object({
  productName: z.string().min(1).describe("Visible or inferred product title."),
  brand: z
    .string()
    .nullish()
    .transform((val) => (val ? val : undefined))
    .optional()
    .describe("Brand or manufacturer if visible or known."),
  purityScore: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Whole-number score from 1 to 10 based on NOVA processing intensity, additive burden, and oil quality."),
  novaGroup: novaGroupSchema.describe("NOVA processing classification."),
  summaryVerdict: z
    .string()
    .min(1)
    .describe("Exactly two authoritative plain-English sentences explaining what the food product actually is."),
  claimsAudit: z
    .array(claimAuditItemSchema)
    .nullish()
    .transform((val) => val ?? [])
    .default([])
    .describe("Front-of-pack marketing claims contrasted with ingredient-level reality."),
  insCodesDecoded: z
    .array(insCodeDecodedSchema)
    .nullish()
    .transform((val) => val ?? [])
    .default([])
    .describe("Decoded INS additives and their digestive/health explanations."),
  sugarMetrics: sugarMetricsSchema,
  fatMetrics: fatMetricsSchema,
  consumptionAdvice: consumptionAdviceSchema.describe("Human-friendly consumption guidance."),
  dailyConsumptionRisks: z
    .array(dailyRiskItemSchema)
    .nullish()
    .transform((val) => val ?? [])
    .default([])
    .optional(),
  ingredientList: z
    .array(ingredientItemSchema)
    .nullish()
    .transform((val) => val ?? [])
    .default([])
    .optional(),
  recommendations: recommendationsSchema,
  betterIndianSwap: z
    .object({
      name: z.string().min(1),
      whyBetter: z.string().min(1),
    })
    .optional(),
});

export const niramaAnalysisSchema = NiramaAnalysisSchema;

export const analyzeProductRequestSchema = z.object({
  backImageBase64: z.string().optional(),
  frontImageBase64: z.string().optional(),
  imageBase64: z.string().optional(),
  queryText: z.string().optional(),
});

export const analyzeImageRequestSchema = analyzeProductRequestSchema;

export const apiErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "INVALID_IMAGE",
  "MODEL_RATE_LIMIT",
  "MODEL_TIMEOUT",
  "MODEL_ERROR",
  "SCHEMA_VALIDATION_FAILED",
  "INTERNAL_SERVER_ERROR",
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const analyzeProductErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string().min(1),
    details: z.string().optional(),
  }),
});

export const analyzeProductSuccessSchema = z.object({
  ok: z.literal(true),
  data: NiramaAnalysisSchema,
});

export const analyzeProductResponseSchema = z.discriminatedUnion("ok", [
  analyzeProductSuccessSchema,
  analyzeProductErrorSchema,
]);

export type NovaGroup = z.infer<typeof novaGroupSchema>;
export type ConcernLevel = z.infer<typeof concernLevelSchema>;
export type ConsumptionAdvice = z.infer<typeof consumptionAdviceSchema>;
export type ClaimAuditItem = z.infer<typeof claimAuditItemSchema>;
export type InsCodeDecoded = z.infer<typeof insCodeDecodedSchema>;
export type SugarMetrics = z.infer<typeof sugarMetricsSchema>;
export type FatMetrics = z.infer<typeof fatMetricsSchema>;
export type CleanPackagedSwap = z.infer<typeof cleanPackagedSwapSchema>;
export type DesiKitchenSwap = z.infer<typeof desiKitchenSwapSchema>;
export type DailyRiskItem = z.infer<typeof dailyRiskItemSchema>;
export type IngredientItem = z.infer<typeof ingredientItemSchema>;

export type NiramaAnalysis = z.infer<typeof NiramaAnalysisSchema>;
export type AnalyzeProductRequest = z.infer<typeof analyzeProductRequestSchema>;
export type AnalyzeProductResponse = z.infer<typeof analyzeProductResponseSchema>;
export type AnalyzeProductError = z.infer<typeof analyzeProductErrorSchema>;
