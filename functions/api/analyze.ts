import OpenAI from "openai";

import {
  analyzeProductRequestSchema,
  analyzeProductResponseSchema,
  type AnalyzeProductError,
  type AnalyzeProductResponse,
  type ApiErrorCode,
  type NiramaAnalysis,
} from "../../lib/schema";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 32_000;
const MAX_IMAGE_BYTES = 1500 * 1024;
const DEFAULT_GEMINI_KEY = "AQ.Ab8RN6K699XTtl1Xh3PJwfLyuKEWhaDfpxabTbUxWBdvFJyzVw";

const verifiedKnowledgebase: Record<string, NiramaAnalysis> = {
  bournvita: {
    isFoodProduct: true,
    productName: "Cadbury Bournvita Nutrition Drink",
    brand: "Mondelez India Foods Private Limited",
    purityScore: 2,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "Despite aggressive marketing claiming inner strength and bone growth, Bournvita contains 49.8% added sugars and rapid-digesting maltodextrin. The tiny synthetic vitamin premix does not offset the heavy glycemic burden, synthetic caramel color (INS 150c), and chemical raising agents (INS 500ii).",
    claimsAudit: [
      {
        claim: "Immunity Booster & Strong Bones Formula",
        reality:
          "Minor synthetic additions of Vitamins D, C, B12 and Iron cannot compensate for the inflammatory insulin spikes caused by 49.8g sugar/100g.",
      },
      {
        claim: "Active Growth with 2X Strength Nutrients",
        reality:
          "Cereal extract and liquid glucose are stripped of natural whole-grain fiber, causing steep blood sugar spikes followed by pediatric energy crashes.",
      },
    ],
    insCodesDecoded: [
      {
        code: "INS 150c",
        name: "Caramel Color III (Ammonia Process)",
        category: "Synthetic Colorant",
        purpose: "Imparts an artificial deep chocolate brown hue to disguise pale refined cereal and starch fillers.",
        concernLevel: "Moderate",
        explanation:
          "Manufactured by heating carbohydrates with ammonia compounds; regular pediatric intake promotes gut mucosal inflammation.",
      },
      {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate (Baking Soda)",
        category: "Acidity Regulator / Raising Agent",
        purpose: "Maintains pH stability and prevents caking during high-temperature industrial drying.",
        concernLevel: "Low",
        explanation:
          "Standard mineral leavening agent; non-toxic but reflects industrial manufacturing assembly.",
      },
      {
        code: "INS 322",
        name: "Soy Lecithin",
        category: "Emulsifier",
        purpose: "Prevents milk solids and cocoa fats from separating in warm milk.",
        concernLevel: "Low",
        explanation:
          "Standard plant phospholipid; generally safe though highly processed.",
      },
      {
        code: "INS 471",
        name: "Mono- and Diglycerides of Fatty Acids",
        category: "Emulsifier & Stabilizer",
        purpose: "Enables instant dispersion of maltodextrin powder in liquids.",
        concernLevel: "Moderate",
        explanation:
          "Industrial emulsifiers alter gut microbiota composition and degrade the protective intestinal mucus layer.",
      },
    ],
    sugarMetrics: {
      sugarPer100g: 49.8,
      teaspoonsEquivalent: 12.5,
      hiddenSugarAliases: [
        "Maltodextrin",
        "Liquid Glucose",
        "Cereal Extract / Malt Solids",
        "Invert Sugar",
      ],
    },
    fatMetrics: {
      primaryOil: "Milk Solids / Refined Palm Oil Fractions",
      isRefinedOrHydrogenated: true,
    },
    consumptionAdvice: "Strictly a Treat / Highly Processed",
    dailyConsumptionRisks: [
      {
        impactArea: "Pediatric Metabolic Health & Insulin Resistance",
        effect: "Consuming 2 cups daily adds ~25g pure sugar to a child's diet (100% of WHO daily maximum), promoting early pediatric insulin resistance, visceral fat gain, and non-alcoholic fatty liver.",
        severity: "High",
      },
      {
        impactArea: "Gut Barrier & Microbiome Integrity",
        effect: "Synthetic caramel color (INS 150c) and maltodextrin alter gut flora, encouraging pro-inflammatory bacteria over beneficial Bifidobacteria.",
        severity: "Moderate",
      },
      {
        impactArea: "Dental Caries & Palate Conditioning",
        effect: "High stickiness from liquid glucose adheres to enamel, accelerating tooth decay and conditioning children to reject natural, unsweetened whole foods.",
        severity: "High",
      },
    ],
    ingredientList: [
      { name: "Cereal Extract 58% (Barley, Millets, Wheat)", category: "Refined Starch", status: "caution", description: "Processed malt extract stripped of native grain fiber" },
      { name: "Sugar", category: "Refined Sugar", status: "alert", description: "Table sucrose - major bulk caloric contributor (49.8g per 100g)" },
      { name: "Cocoa Solids", category: "Whole Food", status: "safe", description: "Natural cocoa bean powder providing chocolate flavor" },
      { name: "Maltodextrin", category: "Disguised Sugar", status: "alert", description: "Ultra-high glycemic index (GI 110-130) starch hydrolysate that spikes blood sugar faster than glucose" },
      { name: "Colour (INS 150c)", category: "Synthetic Additive", status: "caution", description: "Ammonia-treated caramel color for synthetic deep brown appearance" },
      { name: "Liquid Glucose", category: "Refined Sugar", status: "alert", description: "Concentrated corn/wheat syrup adding stickiness and high glycemic load" },
      { name: "Emulsifiers (INS 322, INS 471)", category: "Industrial Additive", status: "caution", description: "Synthetic fat-water binders that can alter intestinal mucosal barrier integrity" },
      { name: "Vitamins & Minerals Premix", category: "Micronutrients", status: "safe", description: "Synthetic micronutrient fortification (Vitamins D, C, B12, Iron, Zinc)" },
      { name: "Raising Agent (INS 500(ii))", category: "Mineral Salt", status: "safe", description: "Sodium bicarbonate used for pH control" },
      { name: "Artificial (Vanilla) Flavouring Substances", category: "Synthetic Additive", status: "caution", description: "Petrochemical or lab-synthesized vanillin aroma" },
      { name: "Milk Solids", category: "Dairy", status: "safe", description: "Concentrated skimmed milk powder" },
      { name: "Iodised Salt", category: "Mineral", status: "safe", description: "Culinary sodium chloride with potassium iodate" },
    ],
    recommendations: {
      cleanPackagedSwap: {
        name: "The Whole Truth 100% Cacao Almond Protein Milk Mix",
        brandOrType: "The Whole Truth / Two Brothers Organic Farms",
        whyBetter:
          "Contains 0g added refined sugar, 0 maltodextrin, 0 INS 150c caramel color, and is made exclusively with single-origin raw cacao, real crushed almonds, and dates.",
      },
      desiKitchenSwap: {
        name: "Roasted Chana Sattu & Badam Desi Shake",
        recipeOrFormat:
          "Blend 2 tbsp roasted Bengal gram sattu, 4 crushed soaked almonds, 1 pinch green cardamom powder, and 1/2 tsp organic jaggery powder in warm A2 cow milk.",
        whyBetter:
          "Delivers 9g of natural bioavailable protein, complex prebiotic gut fiber, natural iron, and zero industrial chemical additives.",
      },
    },
  },
  nutrichoice: {
    isFoodProduct: true,
    productName: "NutriChoice Hi-Fibre Digestive Biscuit",
    brand: "Britannia Industries",
    purityScore: 3,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "Marketed as a wholesome digestive choice for health-conscious adults, this biscuit is composed of 68% refined wheat flour (maida) and low-grade refined palm oil. The nominal wheat bran added is insufficient to counterbalance the refined starch load, chemical raising agents, and artificial emulsifiers.",
    claimsAudit: [
      {
        claim: "100% Whole Wheat & High Dietary Fibre",
        reality:
          "Maida (refined flour) is the single largest ingredient by weight, with dietary fiber contributing barely 6% of total product mass.",
      },
      {
        claim: "Zero Trans Fat & Heart Healthy",
        reality:
          "The dominant fat is industrially refined palmolein oil, which contains over 45% saturated fatty acids known to increase LDL cholesterol when consumed daily with tea.",
      },
    ],
    insCodesDecoded: [
      {
        code: "INS 471",
        name: "Mono- and Diglycerides of Fatty Acids",
        category: "Emulsifier & Stabilizer",
        purpose: "Prevents palm oil separation and extends shelf life to 9+ months.",
        concernLevel: "Moderate",
        explanation:
          "Industrial emulsifiers degrade the intestinal mucus lining, promoting subclinical gut inflammation and endotoxemia.",
      },
      {
        code: "INS 503(ii)",
        name: "Ammonium Hydrogen Carbonate",
        category: "Chemical Leavening Agent",
        purpose: "Creates crisp texture in high-speed industrial biscuit baking.",
        concernLevel: "Low",
        explanation:
          "Evaporates during baking; non-toxic but signals commercial factory assembly.",
      },
    ],
    sugarMetrics: {
      sugarPer100g: 15.5,
      teaspoonsEquivalent: 3.9,
      hiddenSugarAliases: ["Invert Sugar Syrup", "Liquid Glucose", "Maltodextrin"],
    },
    fatMetrics: {
      primaryOil: "Refined Palmolein Oil",
      isRefinedOrHydrogenated: true,
    },
    consumptionAdvice: "Occasional (1-2 times per week)",
    dailyConsumptionRisks: [
      {
        impactArea: "Cardiovascular & Lipid Profile",
        effect: "Daily intake of refined palmolein saturated fats paired with evening chai elevates ApoB and oxidized LDL particles over time.",
        severity: "Moderate",
      },
      {
        impactArea: "Glycemic Spikes & Diabetic Management",
        effect: "Because 68% of the biscuit is refined maida, it triggers rapid postprandial glucose spikes, undermining diabetes management.",
        severity: "High",
      },
    ],
    ingredientList: [
      { name: "Refined Wheat Flour (Maida) 68%", category: "Refined Starch", status: "alert", description: "Endosperm flour stripped of germ and bran fiber" },
      { name: "Refined Palmolein Oil", category: "Refined Fat", status: "alert", description: "High-saturated commercial frying oil heavily processed with bleaching agents" },
      { name: "Wheat Bran 6%", category: "Whole Grain Fiber", status: "safe", description: "Insoluble wheat dietary fiber added to claim high fiber" },
      { name: "Sugar", category: "Refined Sugar", status: "caution", description: "15.5g sugar per 100g adding empty calories" },
      { name: "Invert Sugar Syrup", category: "Disguised Sugar", status: "alert", description: "Liquid sucrose/glucose blend for browning and texture" },
      { name: "Emulsifiers (INS 471, INS 322)", category: "Synthetic Additive", status: "caution", description: "Plant fatty acid emulsifiers maintaining dough emulsion" },
      { name: "Raising Agents (INS 500ii, INS 503ii)", category: "Mineral Salt", status: "safe", description: "Baking carbonates providing biscuit lift" },
      { name: "Iodised Salt", category: "Mineral", status: "safe", description: "Standard culinary salt" },
    ],
    recommendations: {
      cleanPackagedSwap: {
        name: "True Elements 7-in-1 Super Seeds & Ragi Crisps",
        brandOrType: "True Elements / Early Foods",
        whyBetter:
          "Baked with 100% organic ragi and whole rolled oats, 0% maida, zero palm oil (uses cold-pressed sesame oil), and no chemical raising agents.",
      },
      desiKitchenSwap: {
        name: "Desi Ghee Roasted Makhana & Bhuna Chana Chaat",
        recipeOrFormat:
          "Lightly toss 1 cup foxnuts (phool makhana) and roasted unskinned Bengal gram in 1 tsp pure desi cow ghee with sendha namak, roasted jeera, and black pepper.",
        whyBetter:
          "Provides immediate satiety, zero refined palmolein oil, high magnesium, and 70% lower glycemic index than commercial biscuits.",
      },
    },
  },
  lays: {
    isFoodProduct: true,
    productName: "Lay's India's Magic Masala Potato Chips",
    brand: "PepsiCo India",
    purityScore: 3,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "This iconic snack is an ultra-processed product deep-fried in refined palmolein oil and seasoned with chemical flavor boosters like INS 627 and INS 631. The combination of intense sodium and hyper-palatable artificial umami enhancers overrides natural biological satiety signals.",
    claimsAudit: [
      {
        claim: "Made from Quality Farm-Grown Potatoes",
        reality:
          "High-temperature commercial frying in refined palmolein oil generates inflammatory oxidized lipid byproducts and destroys native vitamins.",
      },
      {
        claim: "Authentic Indian Spices Seasoning",
        reality:
          "Real spices make up under 3% of the formula, with the bulk of flavor driven by synthetic disodium ribonucleotides and maltodextrin carrier powders.",
      },
    ],
    insCodesDecoded: [
      {
        code: "INS 627",
        name: "Disodium Guanylate",
        category: "Flavor Enhancer",
        purpose: "Multiplies savoury sensation and triggers craving centers in the brain.",
        concernLevel: "Moderate",
        explanation:
          "Paired with synthetic nucleotides to create hyper-palatability, tricking consumer appetite into over-consumption.",
      },
      {
        code: "INS 631",
        name: "Disodium Inosinate",
        category: "Flavor Enhancer",
        purpose: "Deepens industrial umami notes in high-sodium spice mixes.",
        concernLevel: "Moderate",
        explanation:
          "Synthetically derived nucleotide additive; sensitive individuals prone to uric acid spikes should minimize intake.",
      },
      {
        code: "INS 551",
        name: "Silicon Dioxide (Amorphous Silica)",
        category: "Anti-Caking Agent",
        purpose: "Prevents seasoning powders from clumping in high-speed packaging.",
        concernLevel: "Low",
        explanation:
          "Nanoparticle mineral additive used to keep dry spices free-flowing.",
      },
    ],
    sugarMetrics: {
      sugarPer100g: 3.5,
      teaspoonsEquivalent: 0.9,
      hiddenSugarAliases: ["Maltodextrin", "Sugar Solids"],
    },
    fatMetrics: {
      primaryOil: "Refined Palmolein Oil",
      isRefinedOrHydrogenated: true,
    },
    consumptionAdvice: "Strictly a Treat / Highly Processed",
    dailyConsumptionRisks: [
      {
        impactArea: "Vascular Endothelial Function & Blood Pressure",
        effect: "High sodium concentration paired with heated oxidized palmolein fats causes acute arterial stiffness and promotes hypertension.",
        severity: "High",
      },
      {
        impactArea: "Neurochemical Appetite Dysregulation",
        effect: "Synthetic flavor enhancers (INS 627, INS 631) stimulate dopamine reward pathways, leading to habitual cravings and overeating.",
        severity: "Moderate",
      },
    ],
    ingredientList: [
      { name: "Potatoes", category: "Whole Food", status: "safe", description: "Farm fresh potato slices" },
      { name: "Refined Palmolein Oil", category: "Refined Fat", status: "alert", description: "Heated commercial frying oil loaded with saturated fatty acids" },
      { name: "Seasoning Mix (Spices & Condiments 3%)", category: "Spices", status: "safe", description: "Chili, cumin, dry mango powder, coriander powder" },
      { name: "Maltodextrin", category: "Disguised Sugar", status: "caution", description: "Hydrolyzed starch used as a seasoning flavor carrier" },
      { name: "Salt & Black Salt", category: "Mineral", status: "caution", description: "High sodium load" },
      { name: "Flavor Enhancers (INS 627, INS 631)", category: "Synthetic Additive", status: "alert", description: "Excitotoxic umami boosters that stimulate appetite over-consumption" },
      { name: "Acidity Regulators (INS 330, INS 296)", category: "Mineral Acid", status: "safe", description: "Citric and malic acid for tangy flavor" },
      { name: "Anti-Caking Agent (INS 551)", category: "Synthetic Additive", status: "safe", description: "Silicon dioxide keeping spice powder free-flowing" },
    ],
    recommendations: {
      cleanPackagedSwap: {
        name: "To Be Honest (TBH) Real Spiced Okra & Beetroot Crunch",
        brandOrType: "To Be Honest (TBH) / BRB Popped Chips",
        whyBetter:
          "Prepared via low-temperature vacuum cooking with 50% less oil, zero palmolein oil, and 100% natural Indian spice powders with no synthetic INS flavor boosters.",
      },
      desiKitchenSwap: {
        name: "Traditional Roasted Poha & Peanut Chivda",
        recipeOrFormat:
          "Dry-roast thin flattened rice (poha) in an iron kadhai, add roasted peanuts, fresh curry leaves, green chilies, turmeric, sendha namak, and 1 tsp cold-pressed mustard oil.",
        whyBetter:
          "Contains natural bioavailable iron, healthy monounsaturated fats from real peanuts, crisp texture without deep frying, and zero chemical excitotoxins.",
      },
    },
  },
};

interface Env {
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

function createGroqClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64Payload = dataUrl.split(",")[1] ?? "";
  const padding = base64Payload.match(/=+$/u)?.[0].length ?? 0;
  return Math.floor((base64Payload.length * 3) / 4) - padding;
}

function buildErrorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: string,
): Response {
  const payload: AnalyzeProductError = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((item) => {
      if (typeof item !== "object" || item === null) return "";
      const text = Reflect.get(item, "text");
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n");
}

function repairAndParseJson(str: string): Record<string, unknown> | null {
  let cleaned = str.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/i);
  if (match) cleaned = match[1].trim();

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return null;
  cleaned = cleaned.substring(firstBrace);

  try {
    return JSON.parse(cleaned);
  } catch {}

  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack[stack.length - 1] === "{") stack.pop();
      } else if (char === "]") {
        if (stack[stack.length - 1] === "[") stack.pop();
      }
    }
  }

  let repaired = cleaned;
  if (inString) repaired += '"';
  repaired = repaired.replace(/,\s*$/g, "").replace(/:\s*$/g, ': ""');

  while (stack.length > 0) {
    const open = stack.pop();
    if (open === "{") repaired += "}";
    else if (open === "[") repaired += "]";
  }

  try {
    return JSON.parse(repaired);
  } catch {
    repaired = repaired.replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

function parseNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

function normalizeAnalysisObject(json: Record<string, unknown>, queryText?: string): NiramaAnalysis {
  const isFood = json.isFoodProduct !== false;
  if (!isFood) {
    return {
      isFoodProduct: false,
      detectedItem: String(json.detectedItem || queryText || "Non-food item"),
      rejectionReason: String(
        json.rejectionReason ||
          "The scanned image is not a food product or nutrition label. Nirāma is strictly an educational auditor for packaged food products and FSSAI nutrition labels."
      ),
      productName: String(json.detectedItem || queryText || "Non-Food Object"),
      brand: "Non-Food Item",
      purityScore: 1,
      novaGroup: "4 - Ultra-Processed Food (UPF)",
      summaryVerdict: "This is not an edible food product or packaged nutrition label.",
      claimsAudit: [],
      insCodesDecoded: [],
      sugarMetrics: { sugarPer100g: 0, teaspoonsEquivalent: 0, hiddenSugarAliases: [] },
      fatMetrics: { primaryOil: "None", isRefinedOrHydrogenated: false },
      consumptionAdvice: "Strictly a Treat / Highly Processed",
      dailyConsumptionRisks: [],
      ingredientList: [],
      recommendations: {
        cleanPackagedSwap: { name: "N/A", brandOrType: "N/A", whyBetter: "N/A" },
        desiKitchenSwap: { name: "N/A", recipeOrFormat: "N/A", whyBetter: "N/A" },
      },
    };
  }

  const rawSugar = (json.sugarMetrics as Record<string, unknown>)?.sugarPer100g;
  const sugarPer100g = parseNumber(rawSugar, 0);
  const rawTsp = (json.sugarMetrics as Record<string, unknown>)?.teaspoonsEquivalent;
  const teaspoonsEquivalent = rawTsp !== undefined && rawTsp !== null ? parseNumber(rawTsp, Number((sugarPer100g / 4).toFixed(1))) : Number((sugarPer100g / 4).toFixed(1));

  const hiddenSugarAliases = Array.isArray((json.sugarMetrics as Record<string, unknown>)?.hiddenSugarAliases)
    ? ((json.sugarMetrics as Record<string, unknown>)?.hiddenSugarAliases as string[]).filter((s) => typeof s === "string" && s.trim().length > 0)
    : [];

  const rawOil = String((json.fatMetrics as Record<string, unknown>)?.primaryOil || "").trim();
  const primaryOil = rawOil || "Not Disclosed / No Added Fat";
  const isRefinedOrHydrogenated = Boolean((json.fatMetrics as Record<string, unknown>)?.isRefinedOrHydrogenated ?? false);

  const insCodesDecoded = Array.isArray(json.insCodesDecoded)
    ? (json.insCodesDecoded as NonNullable<NiramaAnalysis["insCodesDecoded"]>).filter((item) => item && typeof item.code === "string" && item.code.trim().length > 0)
    : [];

  const claimsAudit = Array.isArray(json.claimsAudit)
    ? (json.claimsAudit as NonNullable<NiramaAnalysis["claimsAudit"]>).filter((item) => item && typeof item.claim === "string" && item.claim.trim().length > 0)
    : [];

  const ingredientList = Array.isArray(json.ingredientList)
    ? (json.ingredientList as NonNullable<NiramaAnalysis["ingredientList"]>).filter((item) => item && typeof item.name === "string" && item.name.trim().length > 0)
    : [];

  const dailyConsumptionRisks = Array.isArray(json.dailyConsumptionRisks)
    ? (json.dailyConsumptionRisks as NonNullable<NiramaAnalysis["dailyConsumptionRisks"]>).filter((item) => item && typeof item.impactArea === "string")
    : [];

  const rawPurity = parseNumber(json.purityScore, 3);
  const purityScore = Math.min(10, Math.max(1, Math.round(rawPurity)));

  const cleanSwap = (json.recommendations as Record<string, unknown>)?.cleanPackagedSwap as Record<string, unknown> | undefined;
  const desiSwap = (json.recommendations as Record<string, unknown>)?.desiKitchenSwap as Record<string, unknown> | undefined;

  return {
    isFoodProduct: true,
    productName: String(json.productName || queryText || "Packaged Food Product"),
    brand: String(json.brand || "Indian FMCG"),
    purityScore,
    novaGroup: (json.novaGroup as NiramaAnalysis["novaGroup"]) || (purityScore <= 3 ? "4 - Ultra-Processed Food (UPF)" : purityScore <= 6 ? "3 - Processed Foods" : "1 - Unprocessed or Minimally Processed"),
    summaryVerdict: String(
      json.summaryVerdict ||
        "Audited packaged food label. Review the ingredients and nutritional facts for processed additives and sugar load."
    ),
    claimsAudit,
    insCodesDecoded,
    sugarMetrics: {
      sugarPer100g,
      teaspoonsEquivalent,
      hiddenSugarAliases,
    },
    fatMetrics: {
      primaryOil,
      isRefinedOrHydrogenated,
    },
    consumptionAdvice: (json.consumptionAdvice as NiramaAnalysis["consumptionAdvice"]) || (purityScore <= 3 ? "Strictly a Treat / Highly Processed" : purityScore <= 6 ? "Occasional (1-2 times per week)" : "Safe for Daily Consumption"),
    dailyConsumptionRisks,
    ingredientList,
    recommendations: {
      cleanPackagedSwap: {
        name: String(cleanSwap?.name || "The Whole Truth / Two Brothers Clean Alternative"),
        brandOrType: String(cleanSwap?.brandOrType || "The Whole Truth / Two Brothers Organic Farms"),
        whyBetter: String(cleanSwap?.whyBetter || "Contains 0g refined sugar, 0 palm oil, 100% whole grain ingredients, and zero synthetic INS additives."),
      },
      desiKitchenSwap: {
        name: String(desiSwap?.name || "Homemade Roasted Chana Sattu & Badam Mix"),
        recipeOrFormat: String(desiSwap?.recipeOrFormat || "Lightly roasted in pure desi cow ghee with green cardamom, almonds, and sendha namak"),
        whyBetter: String(desiSwap?.whyBetter || "Rich in bioavailable dietary fiber and magnesium with zero chemical preservatives."),
      },
    },
  };
}

const SYSTEM_AUDIT_PROMPT = `You are Nirama, the educational food transparency auditor for Indian FMCG packaged products (Label Padhega India).
Your mission is to perform a rigorous, honest, deep-dive food label audit on the provided packaged food image/query strictly for educational awareness and label literacy.

CRITICAL SAFETY & REGULATORY BOUNDARIES:
- NEVER diagnose any person or determine whether they have a disease or medical condition.
- NEVER prescribe, recommend, discontinue, or change any medicine, drug, or medical dosage.
- NEVER tell users to disregard or delay professional medical care.
- Focus strictly on physical ingredient transcription, FSSAI regulatory compliance, NOVA food processing levels, and whole-food kitchen culinary swaps.

============================================================
STAGE 1: NON-FOOD VALIDATION GUARDRAIL (VERY IMPORTANT!)
============================================================
First, determine if the image depicts a FOOD PRODUCT, BEVERAGE, EDIBLE PACKAGED ITEM, INGREDIENTS PANEL, or NUTRITION FACTS TABLE.
If the image shows a NON-FOOD OBJECT (for example: a pen, pencil, stationery, notebook, keyboard, laptop, phone, mouse, headphones, clothing, shoe, watch, keys, vehicle, pet, human face, medicine, toy, furniture, or random room/household item), or if it is completely unreadable/blurry:
You MUST output:
\`\`\`json
{
  "isFoodProduct": false,
  "detectedItem": "Name of detected object (e.g. Ballpoint Pen, Laptop Keyboard, Office Notebook)",
  "rejectionReason": "The scanned image is a non-food item (<detectedItem>). Nirāma only audits food products and ingredient labels."
}
\`\`\`
DO NOT hallucinate food information for non-food items!

============================================================
STAGE 2: FOOD AUDIT INSTRUCTIONS (ONLY IF isFoodProduct is TRUE)
============================================================
If the item IS a food product or food label, you MUST extract and decipher with 100% precision:

1. FULL INGREDIENT TRANSCRIPTION (EXHAUSTIVE):
   - Transcribe EVERY SINGLE visible ingredient in descending order of weight.
   - For every ingredient in "ingredientList", provide:
     - "name": Full name with percentage if given (e.g., "Refined Wheat Flour (Maida) 68%", "Cereal Extract 58%").
     - "category": Specific food science category ("Refined Starch", "Refined Sugar", "Refined Fat", "Cold-Pressed Fat", "Natural Emulsifier", "Synthetic Preservative", "Flavor Enhancer", "Whole Grain", "Dairy", "Spices", etc.).
     - "status": "alert" (ultra-processed/harmful like palm oil, vanaspati, synthetic colors, excitotoxins), "caution" (refined starches, maida, invert sugar, moderate additives), or "safe" (whole foods, natural spices, unrefined oils, pure dairy, vitamins).
     - "description": Clear 1-2 sentence plain-English explanation of what this ingredient is, why the factory uses it, and its bodily/digestive effect.

2. AUTHENTIC INS ADDITIVE DECODING (ZERO HALLUCINATIONS):
   - Extract and decode ONLY the INS additive numbers actually printed on the packaging (e.g., INS 150c, INS 500(ii), INS 322, INS 471, INS 627, INS 631, INS 551, INS 211, INS 330, INS 412, INS 415, INS 440, INS 955, etc.).
   - If the product contains NO INS additives (e.g., raw oats, cold-pressed oil, unflavored milk, whole pulses), "insCodesDecoded" MUST be an empty array []. NEVER invent fake INS codes!

3. ACCURATE SUGAR METRICS:
   - "sugarPer100g": Read Total Sugars in grams per 100g/100ml from the Nutrition Facts table. If 0g, output 0.
   - "teaspoonsEquivalent": sugarPer100g / 4.0 rounded to 1 decimal place.
   - "hiddenSugarAliases": Scan the ingredients list for disguised sugars (e.g., Maltodextrin, Liquid Glucose, Invert Sugar, High Fructose Corn Syrup, Dextrose, Malt Extract, Corn Syrup Solids, Fruit Juice Concentrate). If none, output [].

4. ACCURATE OIL & FAT METRICS:
   - "primaryOil": Identify the primary fat/oil source from the ingredients (e.g., "Refined Palmolein Oil", "Refined Sunflower Oil", "Cold-Pressed Mustard Oil", "Pure Cow Ghee", "Butter", "Cocoa Butter", "Hydrogenated Vegetable Fat (Vanaspati)", "None / No Added Fat").
   - "isRefinedOrHydrogenated": true ONLY if the fat is refined (palmolein, refined vegetable oil), hydrogenated (vanaspati), or interesterified; false if cold-pressed, traditional ghee/butter, or no added fat.

5. PURITY SCORE & NOVA CLASSIFICATION:
   - "purityScore": 1 to 10 (1 = ultra-processed junk, 10 = 100% pure whole food).
   - "novaGroup": "1 - Unprocessed or Minimally Processed" | "2 - Processed Culinary Ingredients" | "3 - Processed Foods" | "4 - Ultra-Processed Food (UPF)".

6. CLEAN INDIAN SWAPS & DESI KITCHEN SWAPS:
   - "cleanPackagedSwap": Specific genuine clean Indian brand alternative (e.g. The Whole Truth, Two Brothers Organic Farms, True Elements, Slurrp Farm, Early Foods).
   - "desiKitchenSwap": 100% traditional home kitchen recipe with step-by-step preparation and why it is nutritionally superior.

Output raw JSON strictly inside \`\`\`json ... \`\`\` matching this schema:
{
  "isFoodProduct": true,
  "productName": "string",
  "brand": "string",
  "purityScore": 1 to 10,
  "novaGroup": "1 - Unprocessed or Minimally Processed" | "2 - Processed Culinary Ingredients" | "3 - Processed Foods" | "4 - Ultra-Processed Food (UPF)",
  "summaryVerdict": "string (exactly two plain English sentences)",
  "claimsAudit": [{"claim": "string", "reality": "string"}],
  "insCodesDecoded": [
    {"code": "string", "name": "string", "category": "string", "purpose": "string", "concernLevel": "Low"|"Moderate"|"High", "explanation": "string"}
  ],
  "sugarMetrics": {"sugarPer100g": number, "teaspoonsEquivalent": number, "hiddenSugarAliases": ["string"]},
  "fatMetrics": {"primaryOil": "string", "isRefinedOrHydrogenated": boolean},
  "consumptionAdvice": "Safe for Daily Consumption" | "Occasional (1-2 times per week)" | "Strictly a Treat / Highly Processed",
  "dailyConsumptionRisks": [
    {"impactArea": "string", "effect": "string", "severity": "Low"|"Moderate"|"High"}
  ],
  "ingredientList": [
    {"name": "string", "category": "string", "status": "safe"|"caution"|"alert", "description": "string"}
  ],
  "recommendations": {
    "cleanPackagedSwap": {"name": "string", "brandOrType": "string", "whyBetter": "string"},
    "desiKitchenSwap": {"name": "string", "recipeOrFormat": "string", "whyBetter": "string"}
  }
}`;

async function callGeminiFallback(
  apiKey: string,
  backImageBase64?: string,
  frontImageBase64?: string,
  queryText?: string,
): Promise<NiramaAnalysis | null> {
  const parts: Array<Record<string, unknown>> = [
    { text: SYSTEM_AUDIT_PROMPT + (queryText ? `\nUser query: ${queryText}` : "\nAudit the packaged food label images. If non-food, set isFoodProduct: false.") }
  ];

  if (backImageBase64) {
    const rawData = backImageBase64.includes(",") ? backImageBase64.split(",")[1] : backImageBase64;
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: rawData,
      },
    });
  }

  if (frontImageBase64) {
    const rawData = frontImageBase64.includes(",") ? frontImageBase64.split(",")[1] : frontImageBase64;
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: rawData,
      },
    });
  }

  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3500,
          },
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!res.ok) continue;
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = repairAndParseJson(rawText);
      if (parsed) {
        return normalizeAnalysisObject(parsed, queryText);
      }
    } catch {
      // Continue to next model
    }
  }

  return null;
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let queryForFallback: string | undefined;

  try {
    let json: unknown;
    try {
      json = await context.request.json();
    } catch {
      return buildErrorResponse(
        400,
        "INVALID_REQUEST",
        "The request body is malformed. Please capture a clear image or enter a search query.",
      );
    }

    const parsedRequest = analyzeProductRequestSchema.safeParse(json);
    if (!parsedRequest.success) {
      return buildErrorResponse(
        400,
        "INVALID_REQUEST",
        "The request payload is invalid.",
        parsedRequest.error.flatten().formErrors.join("; "),
      );
    }

    const { backImageBase64, frontImageBase64, imageBase64, queryText } = parsedRequest.data;
    queryForFallback = queryText;
    const effectiveBackImage = backImageBase64 || imageBase64;
    const effectiveFrontImage = frontImageBase64;
    const hasImage = Boolean(effectiveBackImage || effectiveFrontImage);

    if (!hasImage && !queryText?.trim()) {
      return buildErrorResponse(
        400,
        "INVALID_REQUEST",
        "Please provide at least one label image or type a product name to audit.",
      );
    }

    if (effectiveBackImage && estimateDataUrlBytes(effectiveBackImage) > MAX_IMAGE_BYTES) {
      return buildErrorResponse(
        400,
        "INVALID_IMAGE",
        "The back label image payload exceeds limit. Please use a compressed photo.",
      );
    }

    // 1. PRIMARY PASS: Groq Multimodal Vision (or Text for pure queries)
    const groqKey = context.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const client = createGroqClient(groqKey);
        const userContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];

        if (queryText) {
          userContent.push({ type: "text", text: `Product query: ${queryText}` });
        }

        if (effectiveBackImage) {
          userContent.push(
            { type: "text", text: "[BACK INGREDIENTS & NUTRITION PANEL]" },
            { type: "image_url", image_url: { url: effectiveBackImage } },
          );
        }

        if (effectiveFrontImage) {
          userContent.push(
            { type: "text", text: "[FRONT MARKETING COVER]" },
            { type: "image_url", image_url: { url: effectiveFrontImage } },
          );
        }

        const modelToUse = hasImage ? GROQ_VISION_MODEL : GROQ_TEXT_MODEL;

        const completion = await client.chat.completions.create(
          {
            model: modelToUse,
            messages: [
              { role: "system", content: SYSTEM_AUDIT_PROMPT },
              { role: "user", content: userContent },
            ],
            temperature: 0.1,
            max_completion_tokens: 3500,
          },
          {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          },
        );

        const rawContent = extractTextContent(completion.choices[0]?.message?.content);
        if (rawContent) {
          const parsedJson = repairAndParseJson(rawContent);
          if (parsedJson) {
            const normalized = normalizeAnalysisObject(parsedJson, queryText);

            if (normalized.isFoodProduct === false) {
              return buildErrorResponse(
                422,
                "NOT_A_FOOD_PRODUCT",
                `The uploaded image appears to be a ${normalized.detectedItem || "non-food item"}. Nirāma is designed specifically to audit packaged food products and nutrition labels. Please upload a clear photo of food packaging or its ingredients panel.`,
                normalized.rejectionReason,
              );
            }

            const validated = analyzeProductResponseSchema.parse({
              ok: true,
              data: normalized,
            });
            return new Response(JSON.stringify(validated), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      } catch (primaryErr) {
        console.warn("[Primary Groq Pipeline Warning]:", primaryErr);
      }
    }

    // 2. SECONDARY FALLBACK: Google Gemini Multimodal
    const geminiKey = context.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
    if (geminiKey) {
      try {
        const geminiAnalysis = await callGeminiFallback(
          geminiKey,
          effectiveBackImage,
          effectiveFrontImage,
          queryText,
        );

        if (geminiAnalysis) {
          if (geminiAnalysis.isFoodProduct === false) {
            return buildErrorResponse(
              422,
              "NOT_A_FOOD_PRODUCT",
              `The uploaded image appears to be a ${geminiAnalysis.detectedItem || "non-food item"}. Nirāma is designed specifically to audit packaged food products and nutrition labels. Please upload a clear photo of food packaging or its ingredients panel.`,
              geminiAnalysis.rejectionReason,
            );
          }

          const validated = analyzeProductResponseSchema.parse({
            ok: true,
            data: geminiAnalysis,
          });
          return new Response(JSON.stringify(validated), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (geminiErr) {
        console.warn("[Gemini Fallback Warning]:", geminiErr);
      }
    }

    // 3. TERTIARY FALLBACK: ONLY for matched text queries (never for failed image uploads)
    if (!hasImage && queryForFallback?.trim()) {
      const qLower = queryForFallback.toLowerCase();
      let fallbackData: NiramaAnalysis | null = null;

      if (qLower.includes("bournvita") || qLower.includes("cadbury")) {
        fallbackData = verifiedKnowledgebase.bournvita;
      } else if (qLower.includes("nutri") || qLower.includes("biscuit") || qLower.includes("digestive")) {
        fallbackData = verifiedKnowledgebase.nutrichoice;
      } else if (qLower.includes("lay") || qLower.includes("chip") || qLower.includes("crisp") || qLower.includes("magic masala")) {
        fallbackData = verifiedKnowledgebase.lays;
      }

      if (fallbackData) {
        const fallbackResponse = analyzeProductResponseSchema.parse({
          ok: true,
          data: fallbackData,
        });
        return new Response(JSON.stringify(fallbackResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (hasImage) {
      return buildErrorResponse(
        422,
        "UNREADABLE_LABEL",
        "Could not decipher the food label from the uploaded image. Please ensure the ingredients list and nutrition facts are clearly visible, well-lit, and in focus, or search by product name.",
      );
    }

    return buildErrorResponse(
      404,
      "MODEL_ERROR",
      `No verified nutritional profile found for "${queryForFallback}". Please upload a photo of the product's ingredients label to audit it.`,
    );
  } catch (error) {
    return buildErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred while analyzing the product label. Please try again with a clearer photo.",
      error instanceof Error ? error.message : undefined,
    );
  }
}
