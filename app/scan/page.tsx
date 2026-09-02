"use client";

import { useId, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import type {
  NiramaAnalysis,
  AnalyzeProductResponse,
  ConsumptionAdvice,
  ConcernLevel,
} from "../../lib/schema";
import { optimizeImageForUpload } from "../../lib/imageOptimizer";
import AiPrototypeDisclaimer from "../../components/AiPrototypeDisclaimer";

type AppState = "IDLE" | "COMPRESSING" | "ANALYZING" | "SUCCESS" | "ERROR";

const analysisSteps = [
  "Optical Character Recognition (OCR) Scanning...",
  "Extracting Fine-Print Ingredients & INS Additive Codes...",
  "Auditing Front-of-Pack Marketing Claims vs Laboratory Truth...",
  "Calculating NOVA Ultra-Processing & Refined Sugar Metrics...",
  "Compiling Chronic Health Risks & Culturally Authentic Indian Swaps...",
];

// Rich Verified FMCG Case Studies
const sampleAudits: Record<string, NiramaAnalysis> = {
  bournvita: {
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
      { name: "Cereal Extract 58% (Barley, Millets, Wheat)", category: "Refined Starch", status: "caution", description: "Processed malt extract stripped of native fiber" },
      { name: "Sugar", category: "Refined Sugar", status: "alert", description: "Table sucrose - major bulk contributor (49.8%)" },
      { name: "Cocoa Solids", category: "Whole Food", status: "safe", description: "Natural cocoa powder" },
      { name: "Maltodextrin", category: "Disguised Sugar", status: "alert", description: "Ultra-high glycemic index (GI 110-130) starch hydrolysate" },
      { name: "Colour (150c)", category: "Synthetic Additive", status: "caution", description: "Ammonia caramel color" },
      { name: "Liquid Glucose", category: "Refined Sugar", status: "alert", description: "Concentrated corn/wheat glucose syrup" },
      { name: "Emulsifiers (322, 471)", category: "Industrial Additive", status: "caution", description: "Disrupts intestinal mucosal barrier" },
      { name: "Vitamins & Minerals Premix", category: "Micronutrients", status: "safe", description: "Synthetic vitamins D, C, B12, Iron, Zinc" },
      { name: "Raising Agent (500(ii))", category: "Mineral Salt", status: "safe", description: "Sodium bicarbonate" },
      { name: "Artificial (Vanilla) Flavouring Substances", category: "Synthetic Additive", status: "caution", description: "Lab-synthesized vanillin" },
      { name: "Milk Solids", category: "Dairy", status: "safe", description: "Concentrated skimmed milk powder" },
      { name: "Iodised Salt", category: "Mineral", status: "safe", description: "Fortified culinary salt" },
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
      { name: "Refined Wheat Flour (Maida) 68%", category: "Refined Starch", status: "alert", description: "Stripped of germ and bran fiber" },
      { name: "Refined Palmolein Oil", category: "Refined Fat", status: "alert", description: "High saturated fat commercial frying oil" },
      { name: "Wheat Bran 6%", category: "Whole Grain Fiber", status: "safe", description: "Insoluble wheat dietary fiber" },
      { name: "Sugar", category: "Refined Sugar", status: "caution", description: "15.5g sugar per 100g" },
      { name: "Invert Sugar Syrup", category: "Disguised Sugar", status: "alert", description: "Liquid sucrose/glucose blend" },
      { name: "Emulsifiers (INS 471, INS 322)", category: "Synthetic Additive", status: "caution", description: "Plant fatty acid emulsifiers" },
      { name: "Raising Agents (INS 500ii, INS 503ii)", category: "Mineral Salt", status: "safe", description: "Baking carbonates" },
      { name: "Iodised Salt", category: "Mineral", status: "safe", description: "Table salt" },
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
      { name: "Potatoes", category: "Whole Food", status: "safe", description: "Farm potatoes" },
      { name: "Refined Palmolein Oil", category: "Refined Fat", status: "alert", description: "High saturated commercial frying oil" },
      { name: "Seasoning Mix (Spices & Condiments 3%)", category: "Spices", status: "safe", description: "Chili, cumin, dry mango, coriander" },
      { name: "Maltodextrin", category: "Disguised Sugar", status: "caution", description: "Flavor carrier powder" },
      { name: "Salt & Black Salt", category: "Mineral", status: "caution", description: "High sodium content" },
      { name: "Flavor Enhancers (INS 627, INS 631)", category: "Synthetic Additive", status: "alert", description: "Excitotoxic umami boosters" },
      { name: "Acidity Regulators (INS 330, INS 296)", category: "Mineral Acid", status: "safe", description: "Citric and malic acid" },
      { name: "Anti-Caking Agent (INS 551)", category: "Synthetic Additive", status: "safe", description: "Silicon dioxide" },
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

const defaultMock: NiramaAnalysis = sampleAudits.bournvita;

function getAdviceTone(advice: ConsumptionAdvice) {
  switch (advice) {
    case "Safe for Daily Consumption":
      return "border-[#8CA683]/40 bg-[#8CA683]/15 text-[#385330]";
    case "Occasional (1-2 times per week)":
      return "border-[#D6B570]/50 bg-[#F5EAD4]/80 text-[#7A5B1F]";
    case "Strictly a Treat / Highly Processed":
      return "border-[#F0A89B]/50 bg-[#FBEAE6] text-[#A63A29]";
  }
}

function getRiskTone(level?: ConcernLevel) {
  switch (level) {
    case "High":
      return {
        badge: "border-red-400/40 bg-red-500/10 text-red-700",
        card: "border-red-500/20 bg-red-500/5",
      };
    case "Moderate":
      return {
        badge: "border-amber-400/40 bg-amber-500/10 text-amber-800",
        card: "border-amber-500/20 bg-amber-500/5",
      };
    default:
      return {
        badge: "border-emerald-400/40 bg-emerald-500/10 text-emerald-800",
        card: "border-emerald-500/20 bg-emerald-500/5",
      };
  }
}

function buildMetricCards(data: NiramaAnalysis) {
  const hiddenCount = data.sugarMetrics.hiddenSugarAliases.length;
  const sugarTone =
    data.sugarMetrics.sugarPer100g >= 22.5
      ? "alert"
      : data.sugarMetrics.sugarPer100g >= 10
      ? "caution"
      : "safe";

  const oilTone = data.fatMetrics.isRefinedOrHydrogenated ? "alert" : "safe";
  const novaTone = data.novaGroup.startsWith("4")
    ? "alert"
    : data.novaGroup.startsWith("3")
    ? "caution"
    : "safe";

  const isSugarFree = data.sugarMetrics.sugarPer100g === 0;
  const isZeroFat = data.fatMetrics.primaryOil === "None" || data.fatMetrics.primaryOil.toLowerCase().includes("no added fat");

  return [
    {
      label: "Total Sugar Load",
      value: isSugarFree ? "0g (Zero)" : `${data.sugarMetrics.sugarPer100g}g`,
      subValue: isSugarFree
        ? "0 tsp / 100g · Naturally Sugar Free"
        : `≈ ${data.sugarMetrics.teaspoonsEquivalent} household tsp / 100g`,
      tone: sugarTone,
    },
    {
      label: "Hidden Sugars",
      value: hiddenCount > 0 ? `${hiddenCount} Disguised` : "0 Disguised",
      subValue: hiddenCount > 0 ? data.sugarMetrics.hiddenSugarAliases.join(", ") : "✓ Clean Sweetener Profile",
      tone: hiddenCount > 0 ? "caution" : "safe",
    },
    {
      label: "Dominant Fat Source",
      value: isZeroFat ? "No Added Fat" : data.fatMetrics.primaryOil,
      subValue: isZeroFat
        ? "✓ Fat-Free / Unrefined Formulation"
        : data.fatMetrics.isRefinedOrHydrogenated
        ? "Refined / Hydrogenated"
        : "Cold-Pressed / Traditional",
      tone: oilTone,
    },
    {
      label: "NOVA Processing",
      value: data.novaGroup.split(" - ")[0],
      subValue: data.novaGroup.split(" - ")[1] ?? "Classification",
      tone: novaTone,
    },
  ];
}

function toneClasses(tone: string) {
  switch (tone) {
    case "alert":
      return "border-[#F5C7BD] bg-[#FCF3F1] text-[#9F3D2B]";
    case "caution":
      return "border-[#E7D6B5] bg-[#FAF4E8] text-[#86662D]";
    default:
      return "border-[#D7E3D3] bg-[#F3F7F2] text-[#42613B]";
  }
}

export default function ScanPage() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backCameraInputId = useId();
  const backGalleryInputId = useId();
  const frontCameraInputId = useId();
  const frontGalleryInputId = useId();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);


  const [state, setState] = useState<AppState>("IDLE");
  const [analysis, setAnalysis] = useState<NiramaAnalysis | null>(defaultMock);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Ingestion states
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState<string>("");
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Drag and Drop States
  const [isDraggingBack, setIsDraggingBack] = useState<boolean>(false);
  const [isDraggingFront, setIsDraggingFront] = useState<boolean>(false);

  // Result Tabs
  const [activeResultTab, setActiveResultTab] = useState<"swaps" | "daily_risks" | "ingredients" | "ins" | "claims">("swaps");
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);

  // Step ticker animation during analysis
  useEffect(() => {
    if (state !== "ANALYZING") return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % analysisSteps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [state]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    };
  }, [backPreviewUrl, frontPreviewUrl]);

  const metrics = analysis ? buildMetricCards(analysis) : [];

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    setBackImageFile(file);
    setBackPreviewUrl(URL.createObjectURL(file));
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    setFrontImageFile(file);
    setFrontPreviewUrl(URL.createObjectURL(file));
  };

  const handleBackDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBack(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
      setBackImageFile(file);
      setBackPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFrontDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFront(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
      setFrontImageFile(file);
      setFrontPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeBackImage = () => {
    if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    setBackImageFile(null);
    setBackPreviewUrl("");
  };

  const removeFrontImage = () => {
    if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    setFrontImageFile(null);
    setFrontPreviewUrl("");
  };

  const startAnalysis = async () => {
    if (!backImageFile && !frontImageFile && !searchQuery.trim()) {
      setErrorMessage("Please capture a label photo or type a product name to begin.");
      setState("ERROR");
      return;
    }

    try {
      setState("COMPRESSING");
      setErrorMessage("");

      let backImageBase64: string | undefined;
      let frontImageBase64: string | undefined;

      if (backImageFile) {
        const compressed = await optimizeImageForUpload(backImageFile);
        backImageBase64 = compressed.dataUrl;
      }

      if (frontImageFile) {
        const compressed = await optimizeImageForUpload(frontImageFile);
        frontImageBase64 = compressed.dataUrl;
      }

      setState("ANALYZING");
      setCurrentStepIndex(0);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backImageBase64,
          frontImageBase64,
          queryText: searchQuery.trim() || undefined,
        }),
      });

      const rawText = await response.text();
      let result: AnalyzeProductResponse;
      try {
        result = JSON.parse(rawText) as AnalyzeProductResponse;
      } catch {
        throw new Error(
          response.status === 413
            ? "The image payload is too large. Please retake the photo closer to the label or use a smaller image."
            : response.status === 504
              ? "The AI model timed out analyzing this packaging. Please try again."
              : `The server returned an unexpected response (HTTP ${response.status}). Displaying verified audit.`
        );
      }

      if (!response.ok || !result.ok) {
        throw new Error(
          result.ok === false
            ? result.error.message
            : "The analysis request could not be completed."
        );
      }

      setAnalysis(result.data);
      setState("SUCCESS");
    } catch (err) {
      setState("ERROR");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected audit error occurred."
      );
      setAnalysis(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startAnalysis();
  };

  const loadSampleAudit = (key: string) => {
    const sample = sampleAudits[key];
    if (sample) {
      setAnalysis(sample);
      setErrorMessage("");
      setState("SUCCESS");
    }
  };

  const resetFlow = () => {
    removeBackImage();
    removeFrontImage();
    setSearchQuery("");
    setErrorMessage("");
    setState("IDLE");
  };

  const copySummaryReport = async () => {
    if (!analysis) return;
    const text = `🔍 NIRĀMA FOOD AUDIT REPORT
Product: ${analysis.productName} (${analysis.brand ?? "Indian FMCG"})
Purity Score: ${analysis.purityScore}/10 (${analysis.novaGroup})
Verdict: ${analysis.summaryVerdict}

⚠️ Sugar Load: ${analysis.sugarMetrics.sugarPer100g}g (${analysis.sugarMetrics.teaspoonsEquivalent} tsp)
⚠️ Dominant Fat: ${analysis.fatMetrics.primaryOil}
💡 Clean Swap: ${analysis.recommendations?.cleanPackagedSwap?.name ?? "Clean Whole Food Alternative"}
🌿 Desi Swap: ${analysis.recommendations?.desiKitchenSwap?.name ?? "Traditional Recipe"}

Audited via Nirāma · Food Label Transparency`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
    } catch {}
  };

  const toggleAudio = () => {
    if (!analysis || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (audioPlaying) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }

    const speech = new SpeechSynthesisUtterance(
      `${analysis.productName}. Purity score ${analysis.purityScore} out of 10. ${analysis.summaryVerdict}`
    );
    speech.rate = 0.95;
    speech.onend = () => setAudioPlaying(false);
    speech.onerror = () => setAudioPlaying(false);
    setAudioPlaying(true);
    window.speechSynthesis.speak(speech);
  };

  return (
    <main className="min-h-screen bg-[#F5EDE0] text-[#1A1A1A] font-sans selection:bg-[#B3945E]/20 pb-20">
      {/* Fixed Luxury Dynamic Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-all duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 sm:pt-4">
          <div
            className={`pointer-events-auto flex items-center justify-between rounded-full border transition-all duration-500 ${
              isScrolled
                ? "border-white/60 bg-[#F5EDE0]/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl px-5 py-2.5"
                : "border-black/5 bg-[#F5EDE0]/50 backdrop-blur-md px-5 sm:px-7 py-3 sm:py-3.5"
            }`}
          >
            {/* Brand Logo */}
            <Link href="/" className="group flex items-center gap-3 transition">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="relative flex h-8 sm:h-9 items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Nirama AI"
                  width={140}
                  height={38}
                  priority
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </motion.div>
            </Link>

            {/* Right CTAs */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-xs transition-all duration-300 hover:bg-white hover:scale-[1.04] hover:-translate-y-[1px] active:scale-[0.96]"
              >
                &larr; <span className="hidden sm:inline">Back to </span>Home
              </Link>
              
              <button
                type="button"
                onClick={resetFlow}
                className="relative overflow-hidden rounded-full border border-[#B3945E]/40 bg-gradient-to-r from-[#C9AB73] via-[#B3945E] to-[#937541] px-4 sm:px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_4px_16px_rgba(179,148,94,0.25)] transition-all duration-300 hover:shadow-[0_6px_22px_rgba(179,148,94,0.4)] hover:scale-[1.05] hover:-translate-y-[1px] active:scale-[0.95]"
              >
                New Scan
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full border border-black/10 bg-white/80 text-[#1A1A1A] p-1.5 shadow-xs transition hover:bg-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto mt-2 mx-auto max-w-6xl px-4 sm:px-6"
            >
              <div className="rounded-3xl border border-[#B3945E]/30 bg-[#FAF8F5]/95 p-4 shadow-xl backdrop-blur-3xl flex flex-col gap-2 text-xs font-semibold text-[#1A1A1A]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
                >
                  <span>Home Landing</span>
                  <span className="text-[#8C6F3B]">&rarr;</span>
                </Link>
                <Link
                  href="/#why-nirama"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
                >
                  <span>Why Nirāma</span>
                  <span className="text-[#8C6F3B]">&rarr;</span>
                </Link>
                <Link
                  href="/#greenwash"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
                >
                  <span>Greenwash Decrypter</span>
                  <span className="text-[#8C6F3B]">&rarr;</span>
                </Link>
                <Link
                  href="/#desi-swaps"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
                >
                  <span>Desi Pantry Swaps</span>
                  <span className="text-[#8C6F3B]">&rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    resetFlow();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-1 rounded-2xl bg-[#1A1A1A] py-3 text-center font-bold uppercase tracking-wider text-white shadow-xs"
                >
                  Reset & Start New Scan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 sm:pt-28 space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <motion.span whileHover={{ scale: 1.04 }} className="inline-block rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B] cursor-default">
            Food Transparency Intelligence
          </motion.span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1A1A1A]">
            Audit Any Indian Packaged Food
          </h1>
          <p className="text-xs sm:text-sm text-black/50 max-w-xl mx-auto">
            Upload the back ingredients panel or front cover to decode INS chemicals, hidden sugars, palm oils, and chronic health risks.
          </p>
        </div>

        {/* Dual Ingestion Box */}
        <div className="rounded-[2.5rem] border border-white/90 bg-white/70 p-5 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.04)] backdrop-blur-3xl">
          
          {/* Dual Slot Upload Cards with Drag and Drop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Slot 1: Back Label (Primary) */}
            <motion.div
              whileHover={{ y: -2 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingBack(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDraggingBack(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingBack(false);
              }}
              onDrop={handleBackDrop}
              className={`relative rounded-[2rem] border p-4 sm:p-5 backdrop-blur-xl transition-all ${
                isDraggingBack
                  ? "border-[#B3945E] bg-[#B3945E]/10 ring-2 ring-[#B3945E]/40 scale-[1.01]"
                  : "border-white/80 bg-white/60 hover:border-[#B3945E]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
                    Slot 1 · Required / Primary
                  </span>
                  <h3 className="text-sm font-medium text-[#1A1A1A]">
                    Back Label (Ingredients & Nutrition)
                  </h3>
                </div>
                {backPreviewUrl && (
                  <button
                    onClick={removeBackImage}
                    type="button"
                    className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[0.62rem] font-medium text-red-600 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>

              {backPreviewUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-black/5 bg-black/5">
                  <img
                    src={backPreviewUrl}
                    alt="Back label capture"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 text-[0.68rem] text-white backdrop-blur-md">
                    Back Label Ready
                  </div>
                </div>
              ) : (
                <div
                  className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                    isDraggingBack
                      ? "border-[#B3945E] bg-[#B3945E]/15"
                      : "border-[#B3945E]/30 bg-[#B3945E]/[0.02] hover:border-[#B3945E]/60 hover:bg-[#B3945E]/[0.05]"
                  }`}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B3945E]/10 text-[#8C6F3B]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                      <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3" />
                      <rect width="10" height="10" x="7" y="7" rx="2" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1A1A1A]">
                    {isDraggingBack ? "Drop Back Label Here" : "Upload Back Ingredients Label"}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-black/45 max-w-[24ch]">
                    FSSAI table, fine print ingredients & INS codes
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <label
                      htmlFor={backCameraInputId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#B3945E]/40 bg-[#1A1A1A] px-3.5 py-1.5 text-[0.68rem] font-semibold text-white shadow-xs hover:bg-black transition cursor-pointer active:scale-95"
                    >
                      <span>📸 Snap Camera</span>
                    </label>
                    <label
                      htmlFor={backGalleryInputId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-[0.68rem] font-semibold text-[#1A1A1A] shadow-xs hover:bg-white transition cursor-pointer active:scale-95"
                    >
                      <span>🖼️ Choose File</span>
                    </label>
                  </div>

                  <input
                    id={backCameraInputId}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={handleBackFileChange}
                  />
                  <input
                    id={backGalleryInputId}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleBackFileChange}
                  />
                </div>
              )}
            </motion.div>

            {/* Slot 2: Front Cover (Optional) */}
            <motion.div
              whileHover={{ y: -2 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFront(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDraggingFront(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingFront(false);
              }}
              onDrop={handleFrontDrop}
              className={`relative rounded-[2rem] border p-4 sm:p-5 backdrop-blur-xl transition-all ${
                isDraggingFront
                  ? "border-[#B3945E] bg-[#B3945E]/10 ring-2 ring-[#B3945E]/40 scale-[1.01]"
                  : "border-white/80 bg-white/60 hover:border-[#B3945E]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-black/40">
                    Slot 2 · Optional / Secondary
                  </span>
                  <h3 className="text-sm font-medium text-[#1A1A1A]">
                    Front Cover (Marketing Claims)
                  </h3>
                </div>
                {frontPreviewUrl && (
                  <button
                    onClick={removeFrontImage}
                    type="button"
                    className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[0.62rem] font-medium text-red-600 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>

              {frontPreviewUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-black/5 bg-black/5">
                  <img
                    src={frontPreviewUrl}
                    alt="Front cover capture"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 text-[0.68rem] text-white backdrop-blur-md">
                    Front Cover Ready
                  </div>
                </div>
              ) : (
                <div
                  className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                    isDraggingFront
                      ? "border-[#B3945E] bg-[#B3945E]/15"
                      : "border-black/15 bg-black/[0.01] hover:border-black/30 hover:bg-black/[0.03]"
                  }`}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-black/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1A1A1A]">
                    {isDraggingFront ? "Drop Front Cover Here" : "Upload Front Marketing Pack"}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-black/45 max-w-[24ch]">
                    Audits front claims vs real ingredients
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <label
                      htmlFor={frontCameraInputId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#1A1A1A] px-3.5 py-1.5 text-[0.68rem] font-semibold text-white shadow-xs hover:bg-black transition cursor-pointer active:scale-95"
                    >
                      <span>📸 Snap Camera</span>
                    </label>
                    <label
                      htmlFor={frontGalleryInputId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-[0.68rem] font-semibold text-[#1A1A1A] shadow-xs hover:bg-white transition cursor-pointer active:scale-95"
                    >
                      <span>🖼️ Choose File</span>
                    </label>
                  </div>

                  <input
                    id={frontCameraInputId}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={handleFrontFileChange}
                  />
                  <input
                    id={frontGalleryInputId}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFrontFileChange}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 pt-5 border-t border-black/5">
            <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Or search by brand/product (e.g. 'Bournvita', 'NutriChoice', 'Tang', 'Lay\'s')..."
                  className="w-full rounded-2xl border border-black/10 bg-white/80 py-3.5 pl-4 pr-4 text-xs sm:text-sm text-[#1A1A1A] placeholder:text-black/40 focus:border-[#B3945E] focus:bg-white focus:outline-none transition-all shadow-xs"
                />
              </div>

              <button
                type="button"
                onClick={startAnalysis}
                disabled={state === "ANALYZING" || state === "COMPRESSING"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#B3945E]/50 bg-gradient-to-r from-[#C9AB73] via-[#B3945E] to-[#937541] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_rgba(179,148,94,0.3)] hover:shadow-[0_8px_25px_rgba(179,148,94,0.45)] disabled:opacity-50 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-[2px] active:scale-[0.96]"
              >
                <span>{state === "ANALYZING" ? "Auditing..." : "Audit Product"}</span>
                <span>&rarr;</span>
              </button>
            </form>

            {/* Quick Sample Presets with Pop Micro-Animations */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-black/35 font-semibold">
                Explore Presets:
              </span>
              {[
                { key: "bournvita", label: "🥛 Cadbury Bournvita" },
                { key: "nutrichoice", label: "🍪 Britannia NutriChoice" },
                { key: "lays", label: "🍟 Lay's Magic Masala" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => loadSampleAudit(item.key)}
                  className="rounded-full border border-black/5 bg-white/75 px-3 py-1.5 text-xs text-black/70 transition-all duration-300 shadow-xs hover:scale-[1.06] hover:-translate-y-[2px] active:scale-[0.94] hover:bg-white hover:border-[#B3945E]/40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Processing State */}
        <AnimatePresence>
          {(state === "COMPRESSING" || state === "ANALYZING") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/90 bg-white/70 px-6 py-12 text-center backdrop-blur-3xl shadow-[0_16px_50px_rgba(0,0,0,0.05)]"
            >
              <div className="relative flex h-36 w-36 items-center justify-center">
                <motion.div
                  className="absolute h-28 w-28 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(201,171,115,0.75)_38%,rgba(16,185,129,0.35)_70%,rgba(179,148,94,0.1)_100%)] blur-[2px]"
                  animate={{
                    scale: [1, 1.2, 0.94, 1],
                    rotate: [0, 90, 180, 270, 360],
                  }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <div className="absolute h-20 w-20 rounded-full border border-white/80 bg-white/40 backdrop-blur-2xl shadow-inner" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.34em] text-[#8C6F3B]">
                {state === "COMPRESSING" ? "Optimizing Optical Frame" : "Nirāma Multi-Stage Reasoning"}
              </p>

              <p className="mt-2 text-xs sm:text-sm text-black/60 font-medium max-w-[34ch]">
                {state === "COMPRESSING"
                  ? "Downscaling resolution to <800KB for high-fidelity OCR extraction..."
                  : analysisSteps[currentStepIndex]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {state === "ERROR" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-[#F5C7BD] bg-gradient-to-br from-[#FFFDF9] via-[#FBEEEB] to-[#FBEAE6] p-5 sm:p-6 shadow-sm backdrop-blur-2xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-lg border border-red-500/20">
                  {errorMessage.toLowerCase().includes("non-food") || errorMessage.toLowerCase().includes("pen") ? "🚫" : "⚠️"}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9F3D2B]">
                    {errorMessage.toLowerCase().includes("non-food") || errorMessage.toLowerCase().includes("pen")
                      ? "Non-Food Object Detected"
                      : "Audit Could Not Complete"}
                  </h4>
                  <p className="text-xs sm:text-sm text-black/75 leading-relaxed max-w-2xl">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-xs hover:bg-black transition-all hover:scale-[1.04] active:scale-[0.96] shrink-0"
              >
                Scan Another &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {/* Audit Results Dashboard */}
        {(state === "SUCCESS" || (state === "IDLE" && analysis)) && analysis && (
          <div className="space-y-5">
            {/* Header & Verdict */}
            <div className="rounded-[2.5rem] border border-white/90 bg-white/65 p-5 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.04)] backdrop-blur-3xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-black/35">
                      Food Audit Verdict
                    </span>
                    <span className="text-black/25">·</span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] ${getAdviceTone(
                        analysis.consumptionAdvice,
                      )}`}
                    >
                      {analysis.consumptionAdvice}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight text-[#1A1A1A]">
                    {analysis.productName}
                  </h2>

                  <p className="text-xs text-black/50">
                    Manufacturer / Brand: <span className="font-medium text-black/75">{analysis.brand ?? "Verified FMCG Formula"}</span>
                  </p>
                </div>

                {/* Score Dial */}
                <motion.div whileHover={{ y: -3, scale: 1.02 }} className="flex items-center gap-4 rounded-3xl border border-white/90 bg-gradient-to-br from-white/90 to-[#FDFCF8]/95 p-4 shadow-xs">
                  <div className="text-center">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-black/35">
                      Purity Index
                    </span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#1A1A1A]">
                        {analysis.purityScore}
                      </span>
                      <span className="text-xs font-medium text-black/35">/ 10</span>
                    </div>
                  </div>

                  <div className="h-10 w-[1px] bg-black/10" />

                  <div>
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-black/35">
                      NOVA Group
                    </span>
                    <p className="text-[0.7rem] sm:text-xs font-bold text-[#8C6F3B] max-w-[14ch] leading-tight mt-0.5">
                      {analysis.novaGroup}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Verdict Summary */}
              <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8C6F3B]">
                  Truth in Advertising Summary
                </p>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-black/75">
                  {analysis.summaryVerdict}
                </p>
              </div>
            </div>

            {/* 4 Key Metrics with Hover Lift */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric) => (
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  key={metric.label}
                  className={`rounded-[2rem] border bg-gradient-to-br p-4 shadow-xs backdrop-blur-2xl ${toneClasses(
                    metric.tone,
                  )}`}
                >
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-current/70">
                    {metric.label}
                  </p>
                  <p className="mt-1.5 text-lg sm:text-2xl font-medium tracking-tight text-[#1A1A1A]">
                    {metric.value}
                  </p>
                  {metric.subValue && (
                    <p className="mt-1 text-[0.68rem] text-black/50 leading-tight">
                      {metric.subValue}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* 5 Comprehensive Analysis Tabs with Spring Micro-Animations */}
            <div className="flex items-center gap-2 border-b border-black/5 pb-2 overflow-x-auto">
              {[
                { id: "swaps", label: "Clean Indian Swaps" },
                { id: "daily_risks", label: `Daily Consumption Risks (${analysis.dailyConsumptionRisks?.length ?? 0})` },
                { id: "ingredients", label: `Ingredient Stack (${analysis.ingredientList?.length ?? 0})` },
                { id: "ins", label: `Decoded INS Codes (${analysis.insCodesDecoded.length})` },
                { id: "claims", label: `Marketing Claims (${analysis.claimsAudit.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id as typeof activeResultTab)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-all duration-300 hover:scale-[1.04] hover:-translate-y-[1px] active:scale-[0.96] ${
                    activeResultTab === tab.id
                      ? "bg-[#1A1A1A] text-white shadow-xs"
                      : "bg-white/75 text-black/65 hover:bg-white hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Clean Indian Swaps */}
            {activeResultTab === "swaps" && (
              <div className="rounded-[2.5rem] border border-[#EBDDBF] bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F5ECE0] p-5 sm:p-8 shadow-xs">
                <div className="mb-5">
                  <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
                    Smart Swaps · Label Padhega India
                  </span>
                  <h3 className="font-serif mt-2 text-xl sm:text-3xl font-medium text-[#1A1A1A]">
                    Genuine Healthier Alternatives for Your Family
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clean Packaged Brand */}
                  <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#8C6F3B] block mb-1">
                        Tier 1 · Clean Packaged Brand
                      </span>
                      <h4 className="text-base font-semibold text-[#1A1A1A]">
                        {analysis.recommendations?.cleanPackagedSwap?.name ?? "The Whole Truth 100% Cacao Almond Mix"}
                      </h4>
                      <p className="text-xs text-[#8C6F3B] font-medium mt-0.5">
                        Brand: {analysis.recommendations?.cleanPackagedSwap?.brandOrType ?? "The Whole Truth / Two Brothers Organic Farms"}
                      </p>
                    </div>
                    <p className="text-xs text-black/75 mt-3 leading-relaxed bg-[#FCFBF8] p-3.5 rounded-xl border border-black/5">
                      <span className="font-semibold text-[#1A1A1A]">Why It&apos;s Better: </span>
                      {analysis.recommendations?.cleanPackagedSwap?.whyBetter ?? "0g refined sugar, 0 palm oil, and zero synthetic INS chemical preservatives."}
                    </p>
                  </motion.div>

                  {/* 100% Desi Kitchen Swap */}
                  <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl border border-[#64825E]/30 bg-white/90 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#64825E] block mb-1">
                        Tier 2 · 100% Desi Kitchen Swap
                      </span>
                      <h4 className="text-base font-semibold text-[#1A1A1A]">
                        {analysis.recommendations?.desiKitchenSwap?.name ?? "Roasted Chana Sattu & Badam Desi Shake"}
                      </h4>
                      <p className="text-xs text-[#4E6B48] font-medium mt-0.5">
                        Recipe: {analysis.recommendations?.desiKitchenSwap?.recipeOrFormat ?? "Blend roasted sattu with warm A2 milk and crushed almonds"}
                      </p>
                    </div>
                    <p className="text-xs text-black/75 mt-3 leading-relaxed bg-[#FCFBF8] p-3.5 rounded-xl border border-black/5">
                      <span className="font-semibold text-[#1A1A1A]">Nutritional Superiority: </span>
                      {analysis.recommendations?.desiKitchenSwap?.whyBetter ?? "Rich in natural bioavailable protein, prebiotic fiber, and zero chemical additives."}
                    </p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Tab 2: Daily Consumption Risks */}
            {activeResultTab === "daily_risks" && (
              <div className="rounded-[2.5rem] border border-white/90 bg-white/70 p-5 sm:p-8 backdrop-blur-3xl shadow-xs space-y-4">
                <div>
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-red-700">
                    Chronic Biological Impact
                  </span>
                  <h3 className="mt-2 text-lg sm:text-2xl font-medium text-[#1A1A1A]">
                    What Happens If You Consume This Daily?
                  </h3>
                  <p className="text-xs text-black/50 mt-1">
                    Clinical breakdown of metabolic, vascular, and gut mucosal changes over continuous consumption.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {analysis.dailyConsumptionRisks && analysis.dailyConsumptionRisks.length > 0 ? (
                    analysis.dailyConsumptionRisks.map((risk, idx) => {
                      const tone = getRiskTone(risk.severity);
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.008 }}
                          key={idx}
                          className={`rounded-2xl border p-4 sm:p-5 transition-shadow shadow-xs hover:shadow-sm ${tone.card}`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h4 className="text-sm sm:text-base font-semibold text-[#1A1A1A]">
                              {risk.impactArea}
                            </h4>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase ${tone.badge}`}>
                              {risk.severity} Risk
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                            {risk.effect}
                          </p>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5 text-center text-xs text-black/60">
                      Regular consumption is safe within standard dietary calories.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Complete Ingredient Stack */}
            {activeResultTab === "ingredients" && (
              <div className="rounded-[2.5rem] border border-white/90 bg-white/70 p-5 sm:p-8 backdrop-blur-3xl shadow-xs space-y-4">
                <div>
                  <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-black/60">
                    Full Packaging Ingestion
                  </span>
                  <h3 className="mt-2 text-lg sm:text-2xl font-medium text-[#1A1A1A]">
                    Transcribed Ingredient Stack Breakdown
                  </h3>
                  <p className="text-xs text-black/50 mt-1">
                    Every ingredient color-coded by health impact so you know what enters your body.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {analysis.ingredientList && analysis.ingredientList.length > 0 ? (
                    analysis.ingredientList.map((ing, idx) => (
                      <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        key={idx}
                        className={`rounded-2xl border p-3.5 transition-shadow shadow-xs hover:shadow-sm flex flex-col justify-between ${
                          ing.status === "alert"
                            ? "border-red-500/20 bg-red-500/[0.04]"
                            : ing.status === "caution"
                            ? "border-amber-500/20 bg-amber-500/[0.04]"
                            : "border-emerald-500/20 bg-emerald-500/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">
                            {ing.name}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase shrink-0 ${
                              ing.status === "alert"
                                ? "border-red-400 bg-red-50 text-red-700"
                                : ing.status === "caution"
                                ? "border-amber-400 bg-amber-50 text-amber-800"
                                : "border-emerald-400 bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {ing.status === "alert" ? "Heavy UPF" : ing.status === "caution" ? "Caution" : "Whole / Clean"}
                          </span>
                        </div>
                        {ing.description && (
                          <p className="text-[0.7rem] text-black/60 mt-1.5 leading-snug">
                            <span className="font-medium text-black/75">{ing.category}: </span>
                            {ing.description}
                          </p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-2xl border border-black/5 bg-black/[0.02] p-5 text-center text-xs text-black/60">
                      Standard ingredients transcribed from packaging.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: INS Codes Matrix */}
            {activeResultTab === "ins" && (
              analysis.insCodesDecoded && analysis.insCodesDecoded.length > 0 ? (
                <div className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/70 backdrop-blur-3xl shadow-xs divide-y divide-black/5">
                  {analysis.insCodesDecoded.map((chem) => {
                    const tone = getRiskTone(chem.concernLevel);
                    return (
                      <motion.div whileHover={{ backgroundColor: "rgba(0,0,0,0.015)" }} key={chem.code} className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1A1A1A]">{chem.code} · {chem.name}</span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase ${tone.badge}`}>
                            {chem.concernLevel} Concern
                          </span>
                        </div>
                        <p className="text-xs text-black/70"><span className="font-semibold">Functional Purpose: </span>{chem.purpose}</p>
                        <p className="text-xs text-black/65 bg-[#FCFBF8] p-3 rounded-xl border border-black/5">
                          <span className="font-semibold text-[#8C6F3B]">Biological Impact: </span>{chem.explanation}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-[#F4FAF2] to-white p-8 text-center backdrop-blur-3xl shadow-xs space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 text-xl border border-emerald-500/25">
                    🌱
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-emerald-950">Zero Synthetic INS Additives Detected</h4>
                  <p className="text-xs sm:text-sm text-emerald-900/80 max-w-md mx-auto leading-relaxed">
                    This food product contains no artificial chemical preservatives, synthetic dyes, chemical leaveners, or industrial emulsifiers.
                  </p>
                </div>
              )
            )}

            {/* Tab 5: Claims vs Reality */}
            {activeResultTab === "claims" && (
              analysis.claimsAudit && analysis.claimsAudit.length > 0 ? (
                <div className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/70 backdrop-blur-3xl shadow-xs divide-y divide-black/5">
                  {analysis.claimsAudit.map((item, idx) => (
                    <motion.div whileHover={{ backgroundColor: "rgba(0,0,0,0.015)" }} key={idx} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">Front Claim:</p>
                        <p className="text-sm font-semibold text-[#1A1A1A] mt-1">&ldquo;{item.claim}&rdquo;</p>
                      </div>
                      <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">Fine Print Reality:</p>
                        <p className="text-xs sm:text-sm text-red-950 mt-1 leading-relaxed">{item.reality}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-black/5 bg-black/[0.02] p-8 text-center backdrop-blur-3xl shadow-xs space-y-2">
                  <h4 className="font-serif text-base font-semibold text-black/75">No Misleading Marketing Claims Detected</h4>
                  <p className="text-xs text-black/50">Packaging is straightforward without exaggerated wellness headlines.</p>
                </div>
              )
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/90 bg-white/70 px-5 py-3 shadow-xs">
              <span className="text-xs text-black/60 font-medium">
                Audited with Multimodal Vision Intelligence
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySummaryReport}
                  className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-black hover:text-white transition-colors"
                >
                  {copiedState ? "✓ Copied" : "Share Summary"}
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-full bg-gradient-to-r from-[#C9AB73] to-[#A88851] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:shadow-md transition-shadow"
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer & Creator Note */}
        <footer className="mt-16 sm:mt-20 border-t border-black/5 pt-10 sm:pt-14 pb-12">
          <div className="space-y-8">
            {/* AI Prototype & Transparency Caution Card */}
            <AiPrototypeDisclaimer />



            <div className="text-center text-xs text-black/45 space-y-2">
              <p className="font-medium uppercase tracking-[0.22em] text-black/35">
                Nirāma (निराम) · Food Label Transparency
              </p>
              <p className="max-w-md mx-auto leading-relaxed">
                Built to democratize nutritional transparency across packaged goods in India. Content generated for nutritional education based on FSSAI guidelines.
              </p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
