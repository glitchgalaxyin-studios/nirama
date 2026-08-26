"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

import PhoneMockupShowcase from "../components/PhoneMockupShowcase";
import AiPrototypeDisclaimer from "../components/AiPrototypeDisclaimer";
import { optimizeImageForUpload } from "../lib/imageOptimizer";
import type {
  AnalyzeProductResponse,
  NiramaAnalysis,
} from "../lib/schema";

type AppState = "IDLE" | "COMPRESSING" | "ANALYZING" | "SUCCESS" | "ERROR";

type MetricCard = {
  label: string;
  value: string;
  subValue?: string;
  tone: "neutral" | "safe" | "warning" | "alert";
};

// Verified FMCG Case Studies
const sampleAudits: Record<string, NiramaAnalysis> = {
  bournvita: {
    productName: "Bournvita Chocolate Health & Nutrition Drink",
    brand: "Mondelez / Cadbury India",
    purityScore: 2,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "Despite being marketed to Indian parents as a growth and immunity booster, Bournvita contains nearly 50% added sugars and fast-digesting maltodextrin that cause severe glycemic spikes in growing children. The microscopic vitamin and mineral premix does not offset the heavy metabolic burden of synthetic caramel coloring and liquid glucose fillers.",
    claimsAudit: [
      {
        claim: "Immunity Booster & Strong Bones Formula",
        reality:
          "The minor addition of synthetic Vitamins (D, C, B12) and Iron cannot counteract the inflammatory and metabolic stress caused by 49.8g of sugar and maltodextrin per 100g.",
      },
      {
        claim: "Active Growth with Inner Strength",
        reality:
          "Malt extract and liquid glucose are stripped of natural fiber, resulting in immediate insulin spikes followed by energy crashes rather than sustained cellular vitality.",
      },
    ],
    insCodesDecoded: [
      {
        code: "INS 150c",
        name: "Caramel Color III (Ammonia Process)",
        category: "Synthetic Colorant",
        purpose: "Imparts an artificial deep chocolate brown hue to disguise pale refined starch filler.",
        concernLevel: "Moderate",
        explanation:
          "Manufactured using ammonia reagents; frequent intake is linked to gut inflammation and potential metabolic toxicity in pediatric diets.",
      },
      {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate",
        category: "Acidity Regulator / Raising Agent",
        purpose: "Maintains shelf stability and controls pH during industrial malt drying.",
        concernLevel: "Low",
        explanation:
          "Standard mineral raising salt; generally safe in micro-quantities but indicates intensive industrial assembly.",
      },
    ],
    sugarMetrics: {
      sugarPer100g: 49.8,
      teaspoonsEquivalent: 12.5,
      hiddenSugarAliases: [
        "Maltodextrin",
        "Liquid Glucose",
        "Malt Extract Solids",
        "Invert Sugar",
      ],
    },
    fatMetrics: {
      primaryOil: "Milk Solids / Refined Palm Oil Fractions",
      isRefinedOrHydrogenated: true,
    },
    consumptionAdvice: "Strictly a Treat / Highly Processed",
    recommendations: {
      cleanPackagedSwap: {
        name: "100% Raw Cocoa & Nut Protein Milk Mix",
        brandOrType: "The Whole Truth / Two Brothers Organic Farms",
        whyBetter:
          "Contains 0g refined sugar, 0 maltodextrin, and uses pure single-origin Indian cacao sweetened exclusively with dates and real almonds.",
      },
      desiKitchenSwap: {
        name: "Roasted Sattu Badam Kheer / Milk Shake",
        recipeOrFormat:
          "Blend 2 tbsp roasted chana sattu, 4 crushed soaked almonds, 1 pinch cardamom, and 1/2 tsp organic jaggery powder in warm A2 cow milk.",
        whyBetter:
          "Delivers 9g of natural bioavailable protein, complex prebiotic fiber for gut microbiome health, and zero industrial chemical additives.",
      },
    },
  },
  nutrichoice: {
    productName: "NutriChoice Hi-Fibre Digestive Biscuit",
    brand: "Britannia Industries",
    purityScore: 3,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "Marketed as a wholesome high-fiber digestive choice for diabetic and health-conscious adults, this biscuit is primarily composed of 68% refined wheat flour (maida) and low-grade refined palm oil. The nominal wheat bran added is insufficient to counterbalance the refined starch load, chemical raising agents, and artificial emulsifiers.",
    claimsAudit: [
      {
        claim: "100% Whole Wheat & High Dietary Fibre",
        reality:
          "FSSAI ingredient disclosures reveal that refined wheat flour (maida) is the single largest ingredient by volume, with dietary fiber contributing barely 6% of total product mass.",
      },
      {
        claim: "Zero Trans Fat & Heart Healthy",
        reality:
          "The primary fat source is industrially refined palmolein oil, which contains over 45% saturated fatty acids known to increase LDL cholesterol when consumed daily with tea.",
      },
    ],
    insCodesDecoded: [
      {
        code: "INS 471",
        name: "Mono- and Diglycerides of Fatty Acids",
        category: "Emulsifier & Stabilizer",
        purpose: "Prevents palm oil separation and extends retail shelf life to 9+ months.",
        concernLevel: "Moderate",
        explanation:
          "Industrial emulsifiers disrupt the intestinal mucosal barrier (mucus lining), promoting subclinical gut inflammation and metabolic endotoxemia.",
      },
      {
        code: "INS 503(ii)",
        name: "Ammonium Hydrogen Carbonate",
        category: "Chemical Leavening Agent",
        purpose: "Creates ultra-crisp factory texture in high-speed commercial baking ovens.",
        concernLevel: "Low",
        explanation:
          "Common baking chemical; evaporates during baking but signals an industrially reconstituted dough formula.",
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
    recommendations: {
      cleanPackagedSwap: {
        name: "100% Whole Grain Multi-Seed Crackers",
        brandOrType: "True Elements / Early Foods",
        whyBetter:
          "Baked with 100% organic ragi and whole oats, 0% maida, 0 palm oil (uses cold-pressed sesame oil), and no chemical raising agents.",
      },
      desiKitchenSwap: {
        name: "Desi Ghee Roasted Makhana & Bhuna Chana Chaat",
        recipeOrFormat:
          "Lightly toss 1 cup foxnuts (phool makhana) and roasted unskinned Bengal gram in 1 tsp pure desi cow ghee with rock salt, black pepper, and roasted cumin.",
        whyBetter:
          "Provides immediate satiety, zero refined palmolein oil, high magnesium, and 70% lower glycemic index than industrial biscuits.",
      },
    },
  },
  lays: {
    productName: "Lay's India's Magic Masala Potato Chips",
    brand: "PepsiCo India",
    purityScore: 3,
    novaGroup: "4 - Ultra-Processed Food (UPF)",
    summaryVerdict:
      "This iconic snack is an industrially engineered ultra-processed product fried in refined palmolein oil and seasoned with chemical flavor boosters like INS 627 and INS 631. The combination of intense sodium, hyper-palatable artificial umami enhancers, and high fat density is scientifically formulated to override natural biological satiety signals.",
    claimsAudit: [
      {
        claim: "Made from Quality Farm-Grown Potatoes",
        reality:
          "While potatoes are used, high-temperature frying in refined palmolein oil generates inflammatory oxidized lipid byproducts and destroys all native micronutrients.",
      },
      {
        claim: "Authentic Indian Spices Seasoning",
        reality:
          "Real spices make up less than 3% of the formula, with the bulk of flavor driven by synthetic disodium ribonucleotides, maltodextrin carrier powders, and added flavorants.",
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
          "Frequently paired with MSG/nucleotides to create hyper-palatability, tricking consumer appetite into over-consumption.",
      },
      {
        code: "INS 631",
        name: "Disodium Inosinate",
        category: "Flavor Enhancer",
        purpose: "Deepens industrial umami notes in high-sodium spice mixes.",
        concernLevel: "Moderate",
        explanation:
          "Synthetically derived nucleotide additive; individuals prone to hyperuricemia, gout, or asthmatic sensitivity should minimize intake.",
      },
      {
        code: "INS 551",
        name: "Silicon Dioxide (Amorphous Silica)",
        category: "Anti-Caking Agent",
        purpose: "Prevents seasoning powders from clumping in commercial high-speed packaging.",
        concernLevel: "Low",
        explanation:
          "Nanoparticle additive used to keep dry mixes free-flowing; non-nutritive industrial processing aid.",
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
    recommendations: {
      cleanPackagedSwap: {
        name: "Vacuum-Fried Spiced Okra / Beetroot Crisps",
        brandOrType: "BRB Popped Chips / To Be Honest (TBH)",
        whyBetter:
          "Prepared via low-temperature vacuum drying using 50% less oil, zero palmolein, and 100% natural spice powders without synthetic INS flavor boosters.",
      },
      desiKitchenSwap: {
        name: "Traditional Roasted Poha & Peanut Chivda",
        recipeOrFormat:
          "Dry-roast thin flattened rice (poha) in an iron kadhai, add roasted peanuts, curry leaves, green chilies, turmeric, and 1 tsp cold-pressed mustard oil with sendha namak.",
        whyBetter:
          "Contains natural iron, healthy monounsaturated fats from real peanuts, crisp texture without deep frying, and zero chemical excitotoxins.",
      },
    },
  },
};

const defaultMock = sampleAudits.bournvita;

// Interactive Greenwash claims
const interactiveGreenwashClaims = [
  {
    badge: "BAKERY",
    claim: "100% Whole Wheat Atta",
    reality: "68% Refined Maida + 4% Wheat Bran added back",
    context: "FSSAI allows products with minimal whole wheat to use 'Atta' marketing headlines while maida remains the bulk filler.",
  },
  {
    badge: "BEVERAGES",
    claim: "Zero Added Cane Sugar",
    reality: "Packed with 24g Liquid Glucose & Maltodextrin",
    context: "Maltodextrin has a Glycemic Index of 110—significantly higher than standard table sugar (GI 65), spiking insulin instantly.",
  },
  {
    badge: "SNACKS",
    claim: "Baked, Not Deep Fried",
    reality: "Sprayed with hot Palm Oil & INS 627 / 631",
    context: "Total fat content remains over 28g per 100g, heavily seasoned with chemical umami excitotoxins to drive overeating.",
  },
  {
    badge: "BREAKFAST",
    claim: "Real Fruit Juice Goodness",
    reality: "85% Sugar Syrup + 0.5% Fruit Puree Concentrate",
    context: "Native Vitamin C is degraded during high-heat commercial pasteurization and replaced with cheap synthetic ascorbic acid.",
  },
];

// Interactive Sugar Radar
const sugarAliasesList = [
  { name: "Maltodextrin", gi: 110, category: "Ultra-High GI Starch", risk: "Severe Spike" },
  { name: "Liquid Glucose", gi: 100, category: "Industrial Hydrolysate", risk: "Rapid Spike" },
  { name: "Invert Sugar Syrup", gi: 65, category: "Split Sucrose", risk: "High Fructose Load" },
  { name: "Malt Extract Solids", gi: 75, category: "Refined Grain Sugar", risk: "Insulin Spike" },
  { name: "High Fructose Corn Syrup", gi: 87, category: "Fatty Liver Inducer", risk: "Metabolic Stress" },
  { name: "Caramelized Dextrose", gi: 100, category: "Synthetic Brown Filler", risk: "Glycemic Burden" },
];

// Interactive Chemical Explorer items
const insExplorerData = [
  {
    code: "INS 150d",
    name: "Caramel Color IV (Sulfite Ammonia)",
    category: "Synthetic Colorant",
    risk: "High" as const,
    usage: "Dark colas, malt drinks, packaged gravies",
    impact: "Manufactured using ammonium reagents; contains 4-MEI byproduct linked to gut inflammation.",
  },
  {
    code: "INS 627",
    name: "Disodium Guanylate",
    category: "Flavor Booster (Umami)",
    risk: "Moderate" as const,
    usage: "Instant noodles, potato chips, savory extruded puffs",
    impact: "Overrides biological satiety cues, stimulating the appetite control center in the brain to promote bingeing.",
  },
  {
    code: "INS 471",
    name: "Mono- & Diglycerides of Fatty Acids",
    category: "Industrial Emulsifier",
    risk: "Moderate" as const,
    usage: "Commercial breads, biscuits, packaged ice creams",
    impact: "Thins the gut mucosal barrier lining, increasing intestinal permeability and subclinical endotoxemia.",
  },
  {
    code: "INS 322",
    name: "Lecithin (Soy / Sunflower)",
    category: "Natural Phospholipid",
    risk: "Low" as const,
    usage: "Chocolates, bakery spreads",
    impact: "Naturally derived emulsifier; generally well tolerated with a neutral metabolic profile.",
  },
];

// Desi Pantry Swap Database
const desiPantryCravings = [
  {
    craving: "Crunchy Masala Chips",
    packagedTrap: "Palmolein oil, INS 627/631, 380mg Sodium",
    desiSwap: "Ghee-Roasted Phool Makhana with Chaat Masala",
    nutritionWin: "85% less saturated fat, zero industrial chemical flavorants, high natural magnesium.",
  },
  {
    craving: "Tea-Time Glucose / Marie Biscuit",
    packagedTrap: "65% Refined Maida, Liquid Glucose, INS 503ii",
    desiSwap: "Roasted Bengal Gram (Bhuna Chana) & Gur Piece",
    nutritionWin: "Complex low-GI carbs, 7g bioavailable protein per fistful, zero palm oil.",
  },
  {
    craving: "Chilled Packaged Fruit Juice",
    packagedTrap: "14g Liquid Sugar/100ml, zero fiber, reconstituted concentrate",
    desiSwap: "Fresh Spiced Tender Coconut Water or Mint Chaas",
    nutritionWin: "Natural bio-electrolytes, live probiotic gut cultures, zero added refined sucrose.",
  },
  {
    craving: "2-Minute Instant Noodles",
    packagedTrap: "Deep-fried Maida cake, Palm oil, INS 635, TBHQ",
    desiSwap: "Stir-Fried Poha or Jowar Daliya with Peanuts & Mustard Seeds",
    nutritionWin: "Slow-digesting whole grains, authentic cold-pressed mustard oil, high bioavailable iron.",
  },
];

const analysisSteps = [
  "Optical scan & perspective calibration...",
  "Extracting FSSAI ingredient stack & nutrition table...",
  "Deciphering cryptic INS numbers & hidden sugars...",
  "Evaluating NOVA processing tier & oil refining quality...",
  "Formulating clean Desi & packaged swaps...",
];

function getRiskTone(level: "Low" | "Moderate" | "High"): {
  dot: string;
  badge: string;
} {
  switch (level) {
    case "Low":
      return { dot: "bg-[#64825E]", badge: "text-[#496B43] bg-[#EFF8ED] border-[#CCE5C7]" };
    case "Moderate":
      return { dot: "bg-[#C4933F]", badge: "text-[#875F1E] bg-[#FCF6E8] border-[#F1DFC1]" };
    case "High":
      return { dot: "bg-[#C85A48]", badge: "text-[#9B3926] bg-[#FCEFEB] border-[#F5C7BD]" };
    default:
      return { dot: "bg-black/20", badge: "text-black/60 bg-black/5 border-black/10" };
  }
}

function getAdviceTone(advice: NiramaAnalysis["consumptionAdvice"]): string {
  if (advice === "Safe for Daily Consumption") {
    return "text-[#496B43] bg-[#EFF8ED] border-[#CCE5C7]";
  }
  if (advice === "Occasional (1-2 times per week)") {
    return "text-[#875F1E] bg-[#FCF6E8] border-[#F1DFC1]";
  }
  return "text-[#9B3926] bg-[#FCEFEB] border-[#F5C7BD]";
}

function toneClasses(tone: MetricCard["tone"]): string {
  switch (tone) {
    case "safe":
      return "from-[#F2F8F0] to-white text-[#55774E] border-[#D6E8D2]";
    case "warning":
      return "from-[#FCF7EB] to-white text-[#8E6725] border-[#F3E2C4]";
    case "alert":
      return "from-[#FCEFEB] to-white text-[#9B3926] border-[#F5C9C0]";
    default:
      return "from-white/80 to-white/50 text-[#1A1A1A] border-white/60";
  }
}

function buildMetricCards(result: NiramaAnalysis): MetricCard[] {
  return [
    {
      label: "TOTAL SUGAR BURDEN",
      value: `${result.sugarMetrics.sugarPer100g}g`,
      subValue: "per 100g serving",
      tone:
        result.sugarMetrics.sugarPer100g <= 5
          ? "safe"
          : result.sugarMetrics.sugarPer100g <= 12
            ? "warning"
            : "alert",
    },
    {
      label: "TEASPOONS OF SUGAR",
      value: `${result.sugarMetrics.teaspoonsEquivalent} tsp`,
      subValue: "4g household tsp scale",
      tone:
        result.sugarMetrics.teaspoonsEquivalent <= 1
          ? "safe"
          : result.sugarMetrics.teaspoonsEquivalent <= 2.5
            ? "warning"
            : "alert",
    },
    {
      label: "PRIMARY FAT / OIL",
      value: result.fatMetrics.primaryOil,
      subValue: result.fatMetrics.isRefinedOrHydrogenated ? "Refined / Palmolein" : "Unrefined / Cold-pressed",
      tone: result.fatMetrics.isRefinedOrHydrogenated ? "alert" : "safe",
    },
    {
      label: "HIDDEN SUGAR ALIASES",
      value:
        result.sugarMetrics.hiddenSugarAliases.length > 0
          ? `${result.sugarMetrics.hiddenSugarAliases.length} Disguised`
          : "None Detected",
      subValue:
        result.sugarMetrics.hiddenSugarAliases.length > 0
          ? result.sugarMetrics.hiddenSugarAliases.slice(0, 2).join(", ")
          : "Clean Sweetener Profile",
      tone: result.sugarMetrics.hiddenSugarAliases.length > 0 ? "warning" : "safe",
    },
  ];
}

export default function Page() {
  const backInputId = useId();
  const frontInputId = useId();
  const scannerRef = useRef<HTMLDivElement>(null);

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
  const [activeSampleKey, setActiveSampleKey] = useState<string>("bournvita");

  // UI Interactive States
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeGreenwashIndex, setActiveGreenwashIndex] = useState<number>(0);
  const [activeCravingIndex, setActiveCravingIndex] = useState<number>(0);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "ins" | "claims" | "swaps">("overview");
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [sugarSearchTerm, setSugarSearchTerm] = useState<string>("");

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showFooterPhone, setShowFooterPhone] = useState<boolean>(false);

  // Smooth scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

    setErrorMessage("");
    setState("COMPRESSING");
    setCurrentStepIndex(0);

    try {
      let backBase64: string | undefined;
      let frontBase64: string | undefined;

      if (backImageFile) {
        const optBack = await optimizeImageForUpload(backImageFile);
        backBase64 = optBack.dataUrl;
      }

      if (frontImageFile) {
        const optFront = await optimizeImageForUpload(frontImageFile);
        frontBase64 = optFront.dataUrl;
      }

      setState("ANALYZING");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backImageBase64: backBase64,
          frontImageBase64: frontBase64,
          queryText: searchQuery.trim() || undefined,
        }),
      });

      const rawText = await response.text();
      let payload: AnalyzeProductResponse;
      try {
        payload = JSON.parse(rawText) as AnalyzeProductResponse;
      } catch {
        throw new Error(
          response.status === 413
            ? "The image payload is too large. Please retake the photo closer to the label or use a smaller image."
            : response.status === 504
              ? "The AI model timed out analyzing this packaging. Please try again."
              : `The server returned an unexpected response (HTTP ${response.status}).`
        );
      }

      if (!response.ok || !payload.ok) {
        const msg = payload.ok ? "The label analysis could not finish." : payload.error.message;
        throw new Error(msg);
      }

      setAnalysis(payload.data);
      setState("SUCCESS");
      scrollToScanner();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error interrupted the scan. Showing sample audit instead.";
      setErrorMessage(msg);
      setAnalysis(defaultMock);
      setState("ERROR");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    void startAnalysis();
  };

  const loadSampleAudit = (key: string) => {
    setActiveSampleKey(key);
    setAnalysis(sampleAudits[key] || defaultMock);
    setState("SUCCESS");
    setErrorMessage("");
    scrollToScanner();
  };

  const resetFlow = () => {
    setState("IDLE");
    setErrorMessage("");
    removeBackImage();
    removeFrontImage();
    setSearchQuery("");
    setAnalysis(defaultMock);
  };

  const copySummaryReport = () => {
    if (!analysis) return;
    const text = `🔍 Nirāma Food Audit: ${analysis.productName}
Purity Index: ${analysis.purityScore}/10 (${analysis.novaGroup})
Consumption Advice: ${analysis.consumptionAdvice}
Verdict: ${analysis.summaryVerdict}
Sugar: ${analysis.sugarMetrics.sugarPer100g}g/100g (${analysis.sugarMetrics.teaspoonsEquivalent} tsp)
Primary Fat: ${analysis.fatMetrics.primaryOil}
Clean Desi Swap: ${analysis.recommendations?.desiKitchenSwap?.name}

Audited via Nirāma · Label Padhega India`;
    void navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
  };

  const toggleAudio = () => {
    setAudioPlaying(!audioPlaying);
  };

  const filteredSugarAliases = sugarAliasesList.filter((s) =>
    s.name.toLowerCase().includes(sugarSearchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(sugarSearchTerm.toLowerCase())
  );

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#FCFBF8] text-[#1A1A1A] antialiased selection:bg-[#B3945E]/20">
      
      {/* ============================================================ */}
      {/* LUXURY GLASSMORPHIC NAVBAR WITH SUBTLE GOLDEN BOTTOM-TO-MIDDLE GRADIENT */}
      {/* ============================================================ */}
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none pt-2.5 sm:pt-4 px-3 sm:px-6 transition-all duration-300">
        <nav
          className={`relative overflow-hidden pointer-events-auto mx-auto w-full max-w-7xl flex items-center justify-between rounded-full border transition-all duration-300 ease-out ${
            isScrolled
              ? "border-[#B3945E]/35 bg-[#FCFBF8]/92 px-4 py-2 sm:px-6 sm:py-2 shadow-[0_14px_36px_rgba(0,0,0,0.06),0_0_20px_rgba(179,148,94,0.08)] backdrop-blur-3xl"
              : "border-[#B3945E]/25 bg-[#FCFBF8]/80 px-4 py-2 sm:px-6 sm:py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.03),0_0_14px_rgba(179,148,94,0.05)] backdrop-blur-2xl"
          }`}
        >
          {/* Subtle dark golden gradient fading from bottom to middle with 50% opacity */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#B3945E]/30 via-[#1C1812]/15 to-transparent opacity-50" />

          {/* Left Brand Wordmark */}
          <a href="#" className="relative z-10 flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="Nirāma Logo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Navigation Links with Micro-Animations */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-[0.78rem] font-medium text-black/70">
            <a href="#what-is-nirama" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              What is Nirāma
            </a>
            <a href="#why-nirama" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Why Nirāma
            </a>
            <a href="#greenwash" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Greenwash
            </a>
            <a href="#sugar-radar" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Sugar Radar
            </a>
            <a href="#oil-spectrum" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Oil Index
            </a>
            <a href="#desi-swaps" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Desi Swaps
            </a>
            <a href="#scalability" className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-black/[0.04] hover:text-[#8C6F3B]">
              Scalability
            </a>
          </div>

          {/* Right Hackathon Badge & CTA Button */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.span whileHover={{ scale: 1.04 }} className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1.5 text-[0.7rem] font-medium text-black/65 whitespace-nowrap shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              OpenAI × FoodPharmer
            </motion.span>

            <Link
              href="/scan"
              className="group relative inline-flex items-center gap-2 rounded-full border border-[#B3945E]/40 bg-gradient-to-r from-[#C9AB73] via-[#B3945E] to-[#937541] px-4 py-2 sm:px-5 sm:py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_4px_14px_rgba(179,148,94,0.25)] transition-all duration-300 hover:shadow-[0_6px_22px_rgba(179,148,94,0.4)] hover:scale-[1.04] hover:-translate-y-[1px] active:scale-[0.96] whitespace-nowrap"
            >
              <span>Scan Label</span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-8 w-8 rounded-full border border-black/10 bg-white/80 text-[#1A1A1A] p-1.5 shadow-xs transition hover:bg-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Slide-down Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto mt-2 mx-auto w-full max-w-7xl rounded-3xl border border-[#B3945E]/30 bg-[#FCFBF8]/95 p-4 shadow-xl backdrop-blur-3xl lg:hidden flex flex-col gap-2 text-xs font-semibold text-[#1A1A1A]"
            >
              <a
                href="#what-is-nirama"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>What is Nirāma</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#why-nirama"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Why Nirāma</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#greenwash"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Greenwash Decrypter</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#sugar-radar"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Hidden Sugar Radar</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#oil-spectrum"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Oil Index</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#desi-swaps"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Desi Pantry Swaps</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <a
                href="#scalability"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-2.5 hover:bg-black/5 flex items-center justify-between"
              >
                <span>Scalability Roadmap</span>
                <span className="text-[#8C6F3B]">&rarr;</span>
              </a>
              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-2xl bg-[#1A1A1A] py-3 text-center font-bold uppercase tracking-wider text-white shadow-xs"
              >
                Launch Label Scanner &rarr;
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* SECTION 1: CINEMATIC HERO & ATMOSPHERIC MULTIMODAL SHOWCASE */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 sm:px-6 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Cinematic Atmospheric Background with Dotted Pattern & Dynamic Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
          {/* High-Definition Dotted Grid Pattern with Radial Vignette */}
          <div
            className="absolute inset-0 opacity-[0.24]"
            style={{
              backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #B3945E 1.2px, transparent 0)`,
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 32%, #000 20%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 32%, #000 20%, transparent 80%)",
            }}
          />

          {/* Secondary Subtly Rotated Micro-Coordinate Grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)`,
              backgroundSize: "112px 112px",
              maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 15%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 15%, transparent 75%)",
            }}
          />

          {/* Cinematic Luminous Glowing Orbs & Halos */}
          <div className="absolute -top-[140px] left-1/2 -translate-x-1/2 h-[520px] w-[750px] rounded-full bg-gradient-to-b from-[#D4B87C]/30 via-[#B3945E]/18 to-transparent blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute top-[240px] -left-[10%] h-[420px] w-[420px] rounded-full bg-[#10B981]/12 blur-[110px] pointer-events-none" />
          <div className="absolute top-[300px] -right-[10%] h-[460px] w-[460px] rounded-full bg-[#C9AB73]/20 blur-[110px] pointer-events-none" />
        </div>

        {/* Main Hero Header Title */}
        <div className="text-center space-y-5 sm:space-y-6 max-w-5xl mx-auto flex flex-col items-center justify-center">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-normal tracking-tight text-[#141414] leading-[1.08] text-center max-w-4xl">
            <span className="block text-[#141414] drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              Know what&apos;s inside your food.
            </span>
            
            <span className="block mt-2 font-serif italic bg-gradient-to-r from-[#B3945E] via-[#D4B87C] to-[#8C6F3B] bg-clip-text text-transparent animate-shimmer-gold filter drop-shadow-[0_2px_18px_rgba(179,148,94,0.22)]">
              Before you take a bite.
            </span>
          </h1>

          <p className="text-sm sm:text-lg leading-relaxed text-black/65 font-normal max-w-2xl mx-auto text-center">
            Big brands hide sugar, refined palm oil, and chemical codes behind healthy-looking labels.
            Just snap a photo of any food packet—Nirāma instantly decodes the micro-text and gives you clean Indian kitchen swaps.
          </p>

          {/* Action CTAs with Light-Sheen Micro-Animations */}
          <div className="pt-2 sm:pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/scan"
                className="group relative overflow-hidden inline-flex items-center gap-3 rounded-full border border-[#D4B87C]/60 bg-gradient-to-r from-[#1A1A1A] via-[#242424] to-[#141414] px-8 py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(179,148,94,0.35)] hover:border-[#D4B87C]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/15 to-transparent ease-in-out pointer-events-none" />
                <span className="relative z-10 flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="relative z-10">Scan Any Food Label</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="relative z-10 h-4 w-4 text-[#C9AB73] transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            <a
              href="#greenwash"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-6 py-3.5 sm:px-7 sm:py-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/75 backdrop-blur-xl transition hover:bg-white hover:text-black shadow-xs hover:shadow-md"
            >
              <span>Common Food Traps</span>
              <span className="text-[#8C6F3B]">&rarr;</span>
            </a>
          </div>

          {/* Feature Highlight Ticker Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-black/65 font-medium">
            <motion.span whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3.5 py-1.5 backdrop-blur-md shadow-xs cursor-default">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              100% Free · No App Download
            </motion.span>
            <motion.span whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3.5 py-1.5 backdrop-blur-md shadow-xs cursor-default">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B3945E]" />
              Decodes 40+ Hidden Sugars
            </motion.span>
            <motion.span whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3.5 py-1.5 backdrop-blur-md shadow-xs cursor-default">
              <span className="h-1.5 w-1.5 rounded-full bg-[#64825E]" />
              Traditional Desi Kitchen Swaps
            </motion.span>
          </div>

          {/* Instant 1-Tap Audits with Pop Micro-Animations */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[0.72rem]">
            <span className="text-black/45 font-semibold uppercase tracking-wider text-[0.65rem] mr-1">
              Try Instant Demo:
            </span>
            <button
              onClick={() => loadSampleAudit("bournvita")}
              className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.5 text-amber-900 font-semibold shadow-xs transition-all duration-300 hover:bg-amber-500/20 hover:shadow-sm hover:scale-[1.06] hover:-translate-y-[2px] active:scale-[0.94]"
            >
              🥛 Bournvita · 49.8% Sugar
            </button>
            <button
              onClick={() => loadSampleAudit("nutrichoice")}
              className="rounded-full border border-red-500/25 bg-red-500/10 px-3.5 py-1.5 text-red-900 font-semibold shadow-xs transition-all duration-300 hover:bg-red-500/20 hover:shadow-sm hover:scale-[1.06] hover:-translate-y-[2px] active:scale-[0.94]"
            >
              🍪 NutriChoice · 68% Maida
            </button>
            <button
              onClick={() => loadSampleAudit("lays")}
              className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.5 text-amber-900 font-semibold shadow-xs transition-all duration-300 hover:bg-amber-500/20 hover:shadow-sm hover:scale-[1.06] hover:-translate-y-[2px] active:scale-[0.94]"
            >
              🍟 Lay&apos;s · Palm Oil & INS 627
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* HERO SHOWCASE: CLEAN 2D SMARTPHONE + VERIFIED AUDIT CARDS */}
        {/* ============================================================ */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-center w-full">
          
          {/* Left Floating Graphic: Live Audit Card */}
          <div className="lg:col-span-4 rounded-[2.5rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/65 to-[#FAF6EF]/70 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-3xl space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-red-700">
                🚨 UPF Grade Alert
              </span>
              <span className="text-xs text-black/45 font-mono">FSSAI Decoded</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Cadbury Bournvita Drink</h3>
              <p className="text-xs text-black/50">Marketed as Pediatric Immunity Growth Drink</p>
            </div>

            {/* Score Ring & Sugar Counter */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-black/5 bg-[#FCFBF8]/90 p-3.5 text-center shadow-xs">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-black/40">Purity Index</span>
                <p className="font-serif text-3xl font-normal text-red-700 tracking-tight mt-0.5">2<span className="text-xs text-black/40">/10</span></p>
                <p className="text-[0.62rem] font-medium text-red-700 mt-0.5">NOVA 4 Ultra-Processed</p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#FCFBF8]/90 p-3.5 text-center shadow-xs">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-black/40">Total Sugar</span>
                <p className="font-serif text-3xl font-normal text-[#8C6F3B] tracking-tight mt-0.5">49.8<span className="text-xs text-black/40">g</span></p>
                <p className="text-[0.62rem] font-medium text-[#8C6F3B] mt-0.5">12.5 Teaspoons / 100g</p>
              </div>
            </div>

            {/* Hidden Additive Pills */}
            <div className="space-y-2 pt-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-black/40">Identified Fine-Print Additives:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-medium text-amber-800 border border-amber-500/20">
                  INS 150c Caramel Color
                </span>
                <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[0.68rem] font-medium text-red-800 border border-red-500/20">
                  Liquid Glucose
                </span>
                <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[0.68rem] font-medium text-red-800 border border-red-500/20">
                  Maltodextrin (GI 110)
                </span>
              </div>
            </div>

            {/* Indian Swap Preview */}
            <div className="rounded-2xl bg-[#64825E]/10 p-3.5 border border-[#64825E]/25 text-xs">
              <span className="font-bold text-[#496B43] uppercase tracking-[0.18em] text-[0.62rem] block">Desi Kitchen Swap:</span>
              <p className="text-[#3A5635] mt-0.5 font-medium">Roasted Sattu Badam Milk Shake (0g refined sugar)</p>
            </div>
          </div>

          {/* Center Graphic: Clean 2D Phone Showcase with Ambient Backlight */}
          <div className="lg:col-span-4 flex items-center justify-center relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-b from-[#C9AB73]/25 to-[#10B981]/15 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <PhoneMockupShowcase />
            </div>
          </div>

          {/* Right Floating Graphic: Greenwash Truth Buster */}
          <div className="lg:col-span-4 rounded-[2.5rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/65 to-[#FAF6EF]/70 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-3xl space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-amber-800">
                ⚡ Greenwash Exposed
              </span>
              <span className="text-xs text-black/45 font-mono">Britannia NutriChoice</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Digestive Biscuit Illusion</h3>
              <p className="text-xs text-black/50">Sold as Everyday Health Snack for Families</p>
            </div>

            {/* Front vs Back Reality Comparison */}
            <div className="space-y-2.5 pt-1">
              <div className="rounded-2xl border border-black/5 bg-[#FCFBF8]/90 p-3.5 shadow-xs">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-black/40 block">Front-Of-Pack Claim:</span>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">&ldquo;100% Whole Wheat & Hi-Fibre Formula&rdquo;</p>
              </div>

              <div className="rounded-2xl border border-[#F5C7BD] bg-[#FBEEEB] p-3.5 shadow-xs">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#9F3D2B] block">FSSAI Micro-Text Reality:</span>
                <p className="text-sm font-semibold text-[#9F3D2B] mt-0.5">68% Refined Maida + 45% Saturated Palm Oil</p>
              </div>
            </div>

            {/* Fast Stats */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-center">
              <div className="rounded-2xl bg-black/[0.02] p-2.5 border border-black/5">
                <span className="text-[0.6rem] text-black/40 uppercase font-bold">Maida Ratio</span>
                <p className="text-base font-semibold text-[#1A1A1A]">68% Volume</p>
              </div>
              <div className="rounded-2xl bg-black/[0.02] p-2.5 border border-black/5">
                <span className="text-[0.6rem] text-black/40 uppercase font-bold">Fiber Reality</span>
                <p className="text-base font-semibold text-[#8C6F3B]">Barely 6%</p>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={() => loadSampleAudit("nutrichoice")}
              className="w-full rounded-2xl border border-[#B3945E]/40 bg-gradient-to-r from-[#B3945E]/15 to-[#C9AB73]/20 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#8C6F3B] hover:bg-[#B3945E]/30 transition-all shadow-xs active:scale-98"
            >
              Inspect Complete Audit &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: WHAT IS NIRĀMA & HOW WE ARE DIFFERENT */}
      {/* ============================================================ */}
      <section id="what-is-nirama" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        
        {/* Header Badge & Title */}
        <div className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto space-y-3">
          <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
            Platform Philosophy & Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            What is Nirāma — and how does it redefine food transparency in India?
          </h2>
          <p className="text-xs sm:text-base text-black/65 leading-relaxed">
            Rooted in the Sanskrit principle of <span className="font-semibold text-[#8C6F3B]">निराम (pure, wholesome, and free from disease)</span>, Nirāma is India&apos;s first autonomous, vision-native food audit platform engineered to dismantle packaged food marketing illusions.
          </p>
        </div>

        {/* What Nirāma Does: 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-14">
          <motion.div whileHover={{ y: -3 }} className="rounded-[2.2rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/60 to-[#FAF6EF]/75 p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] backdrop-blur-2xl space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#B3945E]/20 bg-[#B3945E]/10 text-[#8C6F3B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">1. Optical Micro-Text Vision</h3>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              We ingest raw physical packaging photos and extract 4pt micro-ingredients and mandatory FSSAI nutrition tables using sub-second multimodal vision AI—no barcode dependency.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="rounded-[2.2rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/60 to-[#FAF6EF]/75 p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] backdrop-blur-2xl space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">2. Additive & Sugar Forensics</h3>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              Cross-references 40+ disguised sugar aliases (maltodextrin, invert syrup) and 4,000+ INS chemical codes against international toxicology data and the NOVA Ultra-Processed classification.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="rounded-[2.2rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/60 to-[#FAF6EF]/75 p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03)] backdrop-blur-2xl space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">3. Actionable Indian Swaps</h3>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              Instead of guilt-tripping consumers, Nirāma suggests culturally intuitive, affordable Indian kitchen substitutes (Makhana, Sattu, Chana, Bilona Ghee) and clean Indian FMCG alternatives.
            </p>
          </motion.div>
        </div>

        {/* How Nirāma Differs From Other Apps (TruthIn, Yuka, HealthifyMe) */}
        <div className="rounded-[2.8rem] border border-[#EBDDBF] bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F5ECE0] p-6 sm:p-10 shadow-[0_16px_50px_rgba(179,148,94,0.08)] backdrop-blur-3xl">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
              Competitive Advantage
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-medium text-[#1A1A1A]">
              How is Nirāma different from other barcode scanner apps?
            </h3>
            <p className="text-xs sm:text-sm text-black/60">
              Most nutrition apps were built around outdated barcode databases or Western dietary contexts. Here is how Nirāma changes the paradigm:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Comparison Item 1 */}
            <div className="rounded-3xl border border-black/5 bg-white/90 p-5 sm:p-6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6F3B]">01 · Optical Vision vs Barcode Databases</span>
                <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#10B981]">100% Real-Time</span>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                <strong className="font-semibold text-black">Apps like TruthIn / Yuka:</strong> Depend on pre-indexed barcode databases. When Indian brands silently change formulas, reformulate with cheaper palm oil, or launch new SKUs, barcode apps show outdated or missing data.
              </p>
              <p className="text-xs sm:text-sm text-[#496B43] font-medium leading-relaxed bg-[#F2F8F0] p-3 rounded-xl border border-[#D6E8D2]">
                ✦ <strong>The Nirāma Difference:</strong> Vision LLMs read the physical ink on the actual packet in your hand—inspecting the exact batch-specific formulation directly.
              </p>
            </div>

            {/* Comparison Item 2 */}
            <div className="rounded-3xl border border-black/5 bg-white/90 p-5 sm:p-6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6F3B]">02 · Culturally Rooted Indian Swaps</span>
                <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#10B981]">Bharat First</span>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                <strong className="font-semibold text-black">Generic Health Apps:</strong> Recommend impractical Western replacements (like organic Greek yogurt, kale, or expensive imported granola bars) that do not match Indian kitchens or budgets.
              </p>
              <p className="text-xs sm:text-sm text-[#496B43] font-medium leading-relaxed bg-[#F2F8F0] p-3 rounded-xl border border-[#D6E8D2]">
                ✦ <strong>The Nirāma Difference:</strong> Every swap is grounded in Ayurvedic and traditional Indian culinary staples (Roasted Sattu, Roasted Makhana, Jaggery, Kachi Ghani oils).
              </p>
            </div>

            {/* Comparison Item 3 */}
            <div className="rounded-3xl border border-black/5 bg-white/90 p-5 sm:p-6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6F3B]">03 · Deep Regulatory Loophole Forensics</span>
                <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#10B981]">FSSAI Unmasked</span>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                <strong className="font-semibold text-black">Calorie / Macro Trackers:</strong> Only look at raw calories or protein grams, completely missing toxic high-glycemic fillers like Maltodextrin (GI 110) or bleached Palmolein oil.
              </p>
              <p className="text-xs sm:text-sm text-[#496B43] font-medium leading-relaxed bg-[#F2F8F0] p-3 rounded-xl border border-[#D6E8D2]">
                ✦ <strong>The Nirāma Difference:</strong> Explicitly audits front-of-pack greenwashed marketing claims against mandatory back-of-pack micro-text reality.
              </p>
            </div>

            {/* Comparison Item 4 */}
            <div className="rounded-3xl border border-black/5 bg-white/90 p-5 sm:p-6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6F3B]">04 · Zero Friction, Zero Paywalls</span>
                <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#10B981]">100% Free</span>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                <strong className="font-semibold text-black">Commercial Diet Apps:</strong> Force users through tedious 20-question onboarding quizzes, require app store downloads, and lock full reports behind expensive monthly subscriptions.
              </p>
              <p className="text-xs sm:text-sm text-[#496B43] font-medium leading-relaxed bg-[#F2F8F0] p-3 rounded-xl border border-[#D6E8D2]">
                ✦ <strong>The Nirāma Difference:</strong> Instant browser-based optical auditing with zero app installation, zero login friction, and open transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: WHY NIRĀMA EXISTS - INTERACTIVE 3-CARD GLASS GRID */}
      {/* ============================================================ */}
      <section id="why-nirama" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto space-y-3">
          <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
            Food Transparency Crisis
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Why India Needs Autonomous Label Auditing
          </h2>
          <p className="text-xs sm:text-base text-black/60 leading-relaxed">
            Indian food regulations mandate disclosures, but brands bury inflammatory additives behind cryptic INS numbers and tiny 4pt fonts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1 */}
          <div className="rounded-[2.2rem] border border-white/80 bg-white/55 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl transition hover:shadow-lg space-y-3 sm:space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#B3945E]/20 bg-[#B3945E]/10 text-[#8C6F3B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
              </svg>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">The Fine Print Trap</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-black/60">
              Cryptic INS chemical codes (like <span className="font-semibold text-black/80">INS 150d</span> caramel color and{" "}
              <span className="font-semibold text-black/80">INS 627</span> flavor boosters) and 40+ disguised sugar aliases leave everyday consumers blind to what they are feeding their families.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-[2.2rem] border border-white/80 bg-white/55 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl transition hover:shadow-lg space-y-3 sm:space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M2 12h5l3 8 4-16 3 8h5" />
              </svg>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">Multimodal Vision OCR</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-black/60">
              Powered by frontier vision LLMs, Nirāma analyzes the raw physical typography of packaging labels in real-time—eliminating dependence on outdated, static barcode databases.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-[2.2rem] border border-white/80 bg-white/55 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-2xl transition hover:shadow-lg space-y-3 sm:space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#B3945E]/20 bg-[#B3945E]/10 text-[#8C6F3B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">Actionable Indian Swaps</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-black/60">
              We move beyond food shaming by delivering realistic, culturally rooted alternatives readily available in Indian kitchens (Makhana, Sattu, Chana) and certified clean packaged FMCG brands.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: INTERACTIVE GREENWASH BUSTER */}
      {/* ============================================================ */}
      <section id="greenwash" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="rounded-[2.8rem] border border-white/90 bg-gradient-to-br from-white/80 via-white/55 to-[#FAF5EB]/70 p-5 sm:p-12 shadow-[0_16px_50px_rgba(0,0,0,0.04)] backdrop-blur-3xl">
          <div className="max-w-3xl mb-8 sm:mb-10 space-y-2">
            <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
              Interactive Greenwash Decrypter
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
              Click Front Claims to Reveal the Hidden FSSAI Truth
            </h2>
            <p className="text-xs sm:text-base text-black/60 leading-relaxed">
              Indian packaged brands spend crores crafting deceptive claims. Click any claim below to see the verified laboratory and regulatory reality:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Claims Tabs with Micro-Animations */}
            <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
              {interactiveGreenwashClaims.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveGreenwashIndex(index)}
                  className={`w-full text-left rounded-2xl border p-4 sm:p-4.5 transition-all duration-300 hover:scale-[1.02] hover:translate-x-[2px] active:scale-[0.98] ${
                    activeGreenwashIndex === index
                      ? "border-[#B3945E] bg-[#B3945E]/12 shadow-sm"
                      : "border-white/80 bg-white/50 hover:bg-white/85"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">
                      {item.badge}
                    </span>
                    <span className="text-xs text-black/40">Inspect Reality &rarr;</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-[#1A1A1A]">&ldquo;{item.claim}&rdquo;</p>
                </button>
              ))}
            </div>

            {/* Decoded Reality Card with Gentle Entrance */}
            <div
              key={activeGreenwashIndex}
              className="lg:col-span-7 rounded-3xl border border-white/95 bg-white/90 p-5 sm:p-8 shadow-sm backdrop-blur-2xl flex flex-col justify-between space-y-5 sm:space-y-6"
            >
              <div>
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-black/5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-800/75 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                    FSSAI Fine Print Reality
                  </span>
                  <span className="text-xs text-black/40 font-mono">Nirāma OCR Verified</span>
                </div>

                <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">What The Front Packaging Claims:</p>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#1A1A1A] mt-1">
                      &ldquo;{interactiveGreenwashClaims[activeGreenwashIndex].claim}&rdquo;
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-[#FBEEEB] p-4 sm:p-5 border border-[#F5C7BD]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9F3D2B]">What You Are Actually Digesting:</p>
                    <p className="text-base sm:text-lg font-semibold text-[#9F3D2B] mt-1">
                      {interactiveGreenwashClaims[activeGreenwashIndex].reality}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed bg-[#FCFBF8] p-3.5 sm:p-4 rounded-xl border border-black/5">
                    <span className="font-semibold text-black/85">FSSAI Regulation Context: </span>
                    {interactiveGreenwashClaims[activeGreenwashIndex].context}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-black/50">Want to test a specific packet?</span>
                <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/scan"
                    className="font-bold text-[#8C6F3B] hover:underline"
                  >
                    Launch Full Scanner &rarr;
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: INTERACTIVE SUGAR RADAR & OIL SPECTRUM */}
      {/* ============================================================ */}
      <section id="sugar-radar" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Sugar Radar (7 cols) */}
          <div className="lg:col-span-7 rounded-[2.5rem] border border-white/80 bg-white/60 p-5 sm:p-8 backdrop-blur-3xl shadow-sm space-y-4 sm:space-y-5">
            <div>
              <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
                Hidden Sugar Radar
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A] mt-2">Disguised Sugar Aliases in India</h3>
              <p className="text-xs text-black/50 mt-1">40+ chemical names used to hide refined sucrose and spike glycemic loads</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {sugarAliasesList.map((sugar, idx) => (
                <motion.div
                  whileHover={{ y: -3, scale: 1.015 }}
                  key={idx}
                  className="rounded-2xl border border-black/5 bg-white/85 p-3.5 space-y-1 shadow-xs hover:border-[#B3945E]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{sugar.name}</span>
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-700">
                      GI {sugar.gi}
                    </span>
                  </div>
                  <p className="text-xs text-black/50">{sugar.category}</p>
                  <p className="text-[0.7rem] font-medium text-amber-800/80 bg-amber-50/60 px-2 py-1 rounded-lg border border-amber-100/80">
                    Impact: {sugar.risk}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Oil Quality Index (5 cols) */}
          <div id="oil-spectrum" className="lg:col-span-5 rounded-[2.5rem] border border-white/80 bg-white/60 p-5 sm:p-8 backdrop-blur-3xl shadow-sm space-y-4 sm:space-y-5">
            <div>
              <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
                Lipid Quality Index
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A] mt-2">Indian Cooking Oil Spectrum</h3>
              <p className="text-xs text-black/50 mt-1">What FMCG brands use vs what your body needs</p>
            </div>

            <div className="space-y-3 text-xs">
              <motion.div whileHover={{ scale: 1.015, x: 2 }} className="rounded-2xl border border-red-200 bg-[#FBEEEB] p-3.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-red-800">
                  <span>❌ Refined Palmolein Oil</span>
                  <span>Ultra-Processed</span>
                </div>
                <p className="text-red-900/70">Used in 92% of Indian packaged snacks due to cheap cost. 45% saturated fat, bleached at 200°C.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.015, x: 2 }} className="rounded-2xl border border-amber-200 bg-[#FCF7EB] p-3.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-amber-800">
                  <span>⚠️ Solvent-Extracted Seed Oils</span>
                  <span>Inflammatory Omega-6</span>
                </div>
                <p className="text-amber-900/70">Extracted using chemical hexane solvents; prone to high oxidation and lipid peroxidation.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.015, x: 2 }} className="rounded-2xl border border-[#D6E8D2] bg-[#F2F8F0] p-3.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-[#496B43]">
                  <span>✅ Kachi Ghani Mustard & Sesame</span>
                  <span>Traditional Cold-Pressed</span>
                </div>
                <p className="text-[#3A5635]">Cold-pressed without heat or solvents. Rich in native antioxidants and balanced fatty acids.</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.015, x: 2 }} className="rounded-2xl border border-[#EBDDBF] bg-[#FFFDF9] p-3.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-[#8C6F3B]">
                  <span>🌟 Pure Desi Cow Ghee (Bilona)</span>
                  <span>Gold Standard</span>
                </div>
                <p className="text-black/70">Contains butyric acid that feeds the gut microbiome lining with zero industrial trans fats.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: INS CHEMICAL DICTIONARY */}
      {/* ============================================================ */}
      <section id="chemistry" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
              INS Additive Dictionary
            </span>
            <h2 className="font-serif mt-2 text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
              Common Chemical Additives in Indian Supermarkets
            </h2>
          </div>
          <p className="text-xs text-black/50 max-w-xs">
            Decoded from mandatory FSSAI packaging declarations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {insExplorerData.map((chem) => {
            const tone = getRiskTone(chem.risk);
            return (
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                key={chem.code}
                className="rounded-[2rem] border border-white/80 bg-white/60 p-5 sm:p-6 backdrop-blur-2xl shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1A1A1A]">{chem.code}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${tone.badge}`}>
                      {chem.risk} Risk
                    </span>
                  </div>
                  <h4 className="text-base font-medium text-[#1A1A1A]">{chem.name}</h4>
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-black/40 mt-0.5">{chem.category}</p>
                  
                  <div className="mt-3 text-xs text-black/65 leading-relaxed bg-[#FCFBF8] p-3 rounded-xl border border-black/5">
                    <p className="font-semibold text-black/80">Found in:</p>
                    <p>{chem.usage}</p>
                  </div>
                </div>

                <p className="text-[0.75rem] text-black/60 leading-relaxed border-t border-black/5 pt-3">
                  {chem.impact}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6: DESI PANTRY SWAP ENGINE */}
      {/* ============================================================ */}
      <section id="desi-swaps" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="rounded-[2.8rem] border border-[#EBDDBF] bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F5ECE0] p-5 sm:p-12 shadow-[0_16px_50px_rgba(179,148,94,0.08)] backdrop-blur-3xl">
          <div className="max-w-3xl mb-6 sm:mb-8 space-y-2">
            <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
              Desi Pantry Swaps
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
              Culturally Rooted, 100% Whole Food Indian Alternatives
            </h2>
            <p className="text-xs sm:text-base text-black/60 leading-relaxed">
              Nirāma empowers consumers with delicious swaps you can prepare in 5 minutes in any Indian kitchen or buy from certified clean brands:
            </p>
          </div>

          {/* Craving Filter Chips with Micro-Animations */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6 sm:mb-8">
            {desiPantryCravings.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveCravingIndex(i)}
                className={`rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-semibold uppercase tracking-[0.16em] shadow-xs transition-all duration-300 hover:scale-[1.05] hover:-translate-y-[1px] active:scale-[0.95] ${
                  activeCravingIndex === i
                    ? "border-[#B3945E] bg-[#1A1A1A] text-white shadow-md"
                    : "border-black/10 bg-white/75 text-black/70 hover:bg-white"
                }`}
              >
                {item.craving}
              </button>
            ))}
          </div>

          {/* Craving Card Split with Hover Motion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <motion.div whileHover={{ y: -3 }} className="rounded-3xl border border-red-200/90 bg-white/85 p-5 sm:p-7 backdrop-blur-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-red-700">
                  Industrial Ultra-Processed Pack
                </span>
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-red-700">
                  NOVA 4 UPF
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">{desiPantryCravings[activeCravingIndex].craving}</h4>
              <p className="mt-3 text-xs sm:text-sm text-red-900/80 font-mono bg-red-50/80 p-3.5 rounded-2xl border border-red-100">
                {desiPantryCravings[activeCravingIndex].packagedTrap}
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="rounded-3xl border border-[#64825E]/40 bg-gradient-to-br from-[#F4FAF2] to-white p-5 sm:p-7 backdrop-blur-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#64825E]">
                  100% Clean Desi Kitchen Swap
                </span>
                <span className="rounded-full bg-[#64825E]/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-[#64825E]">
                  Whole Food
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">{desiPantryCravings[activeCravingIndex].desiSwap}</h4>
              <div className="mt-3 rounded-2xl bg-white/90 p-3.5 border border-[#D6E6D2]">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#64825E]">Nutritional Superiority:</p>
                <p className="text-xs sm:text-sm text-black/75 mt-1 leading-relaxed">
                  {desiPantryCravings[activeCravingIndex].nutritionWin}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: SCALABILITY ROADMAP (1.4B BHARAT AUDIT) */}
      {/* ============================================================ */}
      <section id="scalability" className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="rounded-[2.8rem] border border-white/90 bg-gradient-to-br from-white/75 via-white/50 to-[#F8F4EC]/65 p-6 sm:p-12 shadow-[0_16px_50px_rgba(0,0,0,0.03)] backdrop-blur-3xl">
          <div className="max-w-3xl">
            <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
              Hackathon Scalability Roadmap
            </span>
            <h2 className="font-serif mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
              Scaling Transparency to 1.4 Billion Consumers
            </h2>
            <p className="mt-3 text-xs sm:text-base leading-relaxed text-black/60">
              Nirāma is engineered as an infrastructure-level layer for Indian public health. Here is how the platform scales:
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div whileHover={{ x: 3 }} className="space-y-2.5 border-l-2 border-[#B3945E]/50 pl-4 sm:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">01 · Quick Commerce</p>
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">In-Cart Blinkit & Zepto Overlay</h4>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                Browser and mobile extension flagging high-glycemic or palm-oil laden products directly inside Blinkit, Zepto, and Swiggy Instamart carts prior to checkout.
              </p>
            </motion.div>

            <motion.div whileHover={{ x: 3 }} className="space-y-2.5 border-l-2 border-[#10B981]/50 pl-4 sm:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981]">02 · Bharat First</p>
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">Regional Language Voice Translation</h4>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                Instant spoken audio breakdowns in Hindi, Kannada, Tamil, Telugu, Marathi, and Bengali to empower non-English reading families across Tier-2/3 India.
              </p>
            </motion.div>

            <motion.div whileHover={{ x: 3 }} className="space-y-2.5 border-l-2 border-[#B3945E]/50 pl-4 sm:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">03 · Crowdsourced</p>
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">FMCG Purity Leaderboards</h4>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                Public decentralized registry tracking honest vs misleading Indian food brands, incentivizing cleaner manufacturing formulations across India.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: FORENSIC FMCG AUDIT CASE STUDIES & INTERACTIVE REPORTS */}
      {/* ============================================================ */}
      <section ref={scannerRef} id="audits" className="scroll-mt-20 sm:scroll-mt-24 mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6 space-y-8 sm:space-y-10">
        
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.span whileHover={{ scale: 1.04 }} className="inline-block rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-4 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B] cursor-default">
            Interactive Demo Reports
          </motion.span>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Real Packaging Audits Decoded
          </h2>
          <p className="text-xs sm:text-base text-black/60">
            Click any product below to inspect its verified laboratory breakdown, or launch the live scanner to audit your own pack:
          </p>

          {/* 3 Real Product Switchers + Launch Scanner Button */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              { key: "bournvita", label: "🥛 Cadbury Bournvita" },
              { key: "nutrichoice", label: "🍪 Britannia NutriChoice" },
              { key: "lays", label: "🍟 Lay's Magic Masala" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => loadSampleAudit(item.key)}
                className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xs hover:scale-[1.05] hover:-translate-y-[2px] active:scale-[0.95] ${
                  activeSampleKey === item.key
                    ? "bg-[#1A1A1A] text-white shadow-md border border-[#B3945E]"
                    : "bg-white/80 text-black/70 hover:bg-white hover:text-black border border-black/10"
                }`}
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-full border border-[#B3945E]/40 bg-gradient-to-r from-[#C9AB73] via-[#B3945E] to-[#937541] px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.05] hover:-translate-y-[2px] active:scale-[0.95]"
            >
              <span>Audit Any Pack</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Results Dashboard */}
        {analysis && (
          <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
            {/* Product Header & Score Card */}
            <div className="rounded-[2.8rem] border border-white/90 bg-white/65 p-5 sm:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.04)] backdrop-blur-3xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                {/* Left Product Title & Brand */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-black/35">
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

                  <h2 className="text-xl sm:text-3xl font-medium tracking-tight text-[#1A1A1A]">
                    {analysis.productName}
                  </h2>

                  <p className="text-xs sm:text-sm text-black/50">
                    Manufacturer / Brand: <span className="font-medium text-black/75">{analysis.brand ?? "Verified FMCG Formula"}</span>
                  </p>
                </div>

                {/* Right: Purity Score Dial */}
                <div className="flex items-center gap-4 sm:gap-5 rounded-3xl border border-white/90 bg-gradient-to-br from-white/90 to-[#FDFCF8]/95 p-4 sm:p-5 shadow-sm backdrop-blur-2xl">
                  <div className="text-center">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-black/35">
                      Purity Index
                    </span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl sm:text-5xl font-light tracking-tight text-[#1A1A1A]">
                        {analysis.purityScore}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-black/35">/ 10</span>
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
                </div>
              </div>

              {/* 2-Sentence Plain English Verdict */}
              <div className="mt-5 sm:mt-6 rounded-2xl border border-black/5 bg-black/[0.02] p-4 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8C6F3B]">
                  Truth in Advertising Summary
                </p>
                <p className="mt-2 text-xs sm:text-base leading-relaxed text-black/75 font-normal">
                  {analysis.summaryVerdict}
                </p>
              </div>
            </div>

            {/* 4 Core Nutrition Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-[2rem] border bg-gradient-to-br p-4 sm:p-6 shadow-sm backdrop-blur-2xl ${toneClasses(
                    metric.tone,
                  )}`}
                >
                  <p className="text-[0.6rem] sm:text-[0.62rem] font-bold uppercase tracking-[0.26em] text-current/70">
                    {metric.label}
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-medium tracking-tight text-[#1A1A1A]">
                    {metric.value}
                  </p>
                  {metric.subValue && (
                    <p className="mt-1 text-[0.68rem] sm:text-[0.72rem] text-black/50 leading-tight">
                      {metric.subValue}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Tabs */}
            <div className="flex items-center gap-2 border-b border-black/5 pb-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview & Swaps" },
                { id: "claims", label: `Claims Audit (${analysis.claimsAudit.length})` },
                { id: "ins", label: `INS Chemistry (${analysis.insCodesDecoded.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id as typeof activeResultTab)}
                  className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition active:scale-95 ${
                    activeResultTab === tab.id
                      ? "bg-[#1A1A1A] text-white shadow-sm"
                      : "bg-white/70 text-black/60 hover:bg-white hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Multi-Tiered Swaps */}
            {activeResultTab === "overview" && (
              <div className="rounded-[2.8rem] border border-[#EBDDBF] bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F5ECE0] p-5 sm:p-10 shadow-[0_16px_50px_rgba(179,148,94,0.08)] backdrop-blur-3xl">
                <div className="mb-6 sm:mb-8">
                  <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[#8C6F3B]">
                    Smart Swaps · Label Padhega India
                  </span>
                  <h3 className="mt-2 text-xl sm:text-3xl font-medium tracking-tight text-[#1A1A1A]">
                    Healthier Alternatives Ready for Your Pantry
                  </h3>
                  <p className="text-xs sm:text-sm text-black/60 mt-1">
                    Swap industrial ultra-processed foods with certified clean FMCG products or 100% whole-food Indian recipes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Tier 1: Clean Packaged Brand Alternative */}
                  <div className="rounded-[2rem] border border-white/90 bg-white/80 p-5 sm:p-7 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#8C6F3B]">
                        Tier 1 · Packaged Brand Convenience
                      </span>
                      <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[0.62rem] font-semibold text-[#10B981]">
                        0% Palm Oil
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
                      {analysis.recommendations?.cleanPackagedSwap?.name ??
                        analysis.betterIndianSwap?.name ??
                        "Clean FMCG Whole Grain Alternative"}
                    </h4>

                    <p className="mt-1 text-xs font-semibold text-black/50">
                      Brand / Category:{" "}
                      <span className="text-black/80 font-normal">
                        {analysis.recommendations?.cleanPackagedSwap?.brandOrType ?? "Verified Clean FMCG"}
                      </span>
                    </p>

                    <div className="mt-4 rounded-2xl bg-[#FCFBF8] p-4 border border-black/5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">
                        Why It Wins:
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-black/70 leading-relaxed">
                        {analysis.recommendations?.cleanPackagedSwap?.whyBetter ??
                          analysis.betterIndianSwap?.whyBetter ??
                          "Zero artificial emulsifiers, unrefined whole grains, and transparent label ingredients."}
                      </p>
                    </div>
                  </div>

                  {/* Tier 2: 100% Traditional Desi Kitchen Alternative */}
                  <div className="rounded-[2rem] border border-white/90 bg-white/80 p-5 sm:p-7 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#64825E]">
                        Tier 2 · 100% Whole Food Desi Swap
                      </span>
                      <span className="rounded-full bg-[#64825E]/10 px-2.5 py-0.5 text-[0.62rem] font-semibold text-[#64825E]">
                        Desi Pantry
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
                      {analysis.recommendations?.desiKitchenSwap?.name ??
                        "Ghee-Roasted Makhana & Bhuna Chana"}
                    </h4>

                    <p className="mt-1 text-xs font-semibold text-black/50">
                      Preparation:{" "}
                      <span className="text-black/80 font-normal">
                        {analysis.recommendations?.desiKitchenSwap?.recipeOrFormat ?? "Quick 5-minute skillet roast with sendha namak"}
                      </span>
                    </p>

                    <div className="mt-4 rounded-2xl bg-[#FCFBF8] p-4 border border-black/5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64825E]">
                        Nutritional Superiority:
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-black/70 leading-relaxed">
                        {analysis.recommendations?.desiKitchenSwap?.whyBetter ??
                          "Delivers natural dietary fiber, zero industrial refining, and sustained blood glucose stability."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Claims vs Reality */}
            {activeResultTab === "claims" && (
              <div className="overflow-hidden rounded-[2.8rem] border border-white/90 bg-white/65 backdrop-blur-3xl shadow-sm">
                <div className="border-b border-black/5 px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[#8C6F3B]">
                      Greenwash Buster
                    </span>
                    <h3 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
                      Front-of-Pack Marketing Claims vs Ingredient Reality
                    </h3>
                  </div>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-[0.65rem] font-medium text-black/60">
                    FSSAI Reality Check
                  </span>
                </div>

                <div className="divide-y divide-black/5">
                  {analysis.claimsAudit.length > 0 ? (
                    analysis.claimsAudit.map((item, idx) => (
                      <div key={idx} className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-700">
                            !
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                              Marketing Claim
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                              &ldquo;{item.claim}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 bg-white/50 rounded-2xl p-4 border border-white/80">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-700">
                            ✕
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800/60">
                              Ingredient Reality
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-black/65 leading-relaxed">
                              {item.reality}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-black/55 text-center">
                      No deceptive marketing claims identified on this product.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: INS Chemical Decoder */}
            {activeResultTab === "ins" && (
              <div className="overflow-hidden rounded-[2.8rem] border border-white/90 bg-white/65 backdrop-blur-3xl shadow-sm">
                <div className="border-b border-black/5 px-5 sm:px-7 py-4 sm:py-5">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[#8C6F3B]">
                    Additive Chemistry
                  </span>
                  <h3 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
                    Decoded INS Additives & Gut Health Risk Flagging
                  </h3>
                </div>

                <div className="divide-y divide-black/5">
                  {analysis.insCodesDecoded.length > 0 ? (
                    analysis.insCodesDecoded.map((chem) => {
                      const tone = getRiskTone(chem.concernLevel);
                      return (
                        <div key={chem.code} className="p-5 sm:p-7 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                              <div>
                                <span className="text-sm sm:text-base font-semibold text-[#1A1A1A]">
                                  {chem.code} · {chem.name}
                                </span>
                                <span className="ml-2 text-xs uppercase tracking-[0.2em] text-black/35">
                                  ({chem.category})
                                </span>
                              </div>
                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] ${tone.badge}`}
                            >
                              {chem.concernLevel} Concern
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                            <span className="font-semibold text-black/85">Manufacturer Purpose: </span>
                            {chem.purpose}
                          </p>

                          <p className="text-xs sm:text-sm text-black/60 leading-relaxed bg-[#FCFBF8] p-3.5 rounded-xl border border-black/[0.04]">
                            <span className="font-semibold text-[#8C6F3B]">Health & Gut Context: </span>
                            {chem.explanation}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-sm text-black/55 text-center">
                      No synthetic INS codes or chemical additives identified in this formulation.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer & Creator Note */}
      <footer className="mt-20 sm:mt-24 border-t border-black/5 pt-12 sm:pt-16 pb-16 px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* AI Prototype & Transparency Caution Card */}
          <AiPrototypeDisclaimer />

          {/* Heartfelt Note Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-3xl border border-[#EBDDBF]/80 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] p-6 sm:p-8 shadow-[0_12px_36px_rgba(179,148,94,0.06)] backdrop-blur-2xl"
          >
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B3945E]/30 bg-[#B3945E]/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B3945E] animate-pulse" />
                Note From The Creator
              </span>
              <span className="text-xs text-black/40 font-mono">Student & Web Developer</span>
            </div>

            {/* Note Body */}
            <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
              Hey, I am truly glad you gave us the opportunity to build Nirāma. I am a student and a part-time web developer working hard to pay my tuition bills, support my family, and build an independent future. I also run my own creative studio at{" "}
              <a
                href="https://glitchgalaxy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#8C6F3B] underline underline-offset-2 hover:text-black transition-colors"
              >
                glitchgalaxy.in
              </a>
              , where I craft custom websites for people (though I haven&apos;t landed many clients yet).
            </p>

            <p className="text-xs sm:text-sm text-black/75 leading-relaxed mt-3">
              Please check out this prototype and consider our work while making your evaluation. If you find value in what we built, feel free to drop me an email or text—with your guidance and support, I can continue learning, growing, and building meaningful tools for India 🙂
            </p>

            {/* Direct Contact Links */}
            <div className="mt-6 pt-5 border-t border-[#B3945E]/20 flex flex-wrap items-center gap-3">
              {/* Email */}
              <a
                href="mailto:bhuvanjg.nova@gmail.com"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-xs hover:bg-black hover:text-white transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#8C6F3B]">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                <span>bhuvanjg.nova@gmail.com</span>
              </a>

              {/* Phone / WhatsApp (Hidden until clicked) */}
              {showFooterPhone ? (
                <a
                  href="tel:9036151876"
                  className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-xs font-semibold text-[#10B981] shadow-xs hover:bg-[#10B981] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>+91 90361 51876</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFooterPhone(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-xs hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#10B981]">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Tap to Reveal Phone No.</span>
                </button>
              )}

              {/* Portfolio */}
              <a
                href="https://glitchgalaxy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#B3945E]/40 bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
              >
                <span className="text-[#C9AB73]">✦</span>
                <span>glitchgalaxy.in</span>
                <span className="text-white/50">&rarr;</span>
              </a>
            </div>
          </motion.div>

          {/* Hackathon Credentials Footer */}
          <div className="text-center text-xs text-black/45 space-y-2">
            <p className="font-medium uppercase tracking-[0.22em] text-black/35">
              Nirāma (निराम) · Label Padhega India · OpenAI × FoodPharmer Hackathon
            </p>
            <p className="max-w-md mx-auto leading-relaxed">
              Built to democratize nutritional transparency across packaged goods in India. Content generated for nutritional education based on FSSAI guidelines.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
