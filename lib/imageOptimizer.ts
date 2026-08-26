const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_MAX_BYTES = 800 * 1024;
const DEFAULT_WEBP_QUALITY = 0.82;
const MIN_SCALE = 0.45;
const SCALE_STEP = 0.9;
const QUALITY_STEP = 0.08;
const MIN_QUALITY = 0.5;

export type OptimizedImagePayload = {
  dataUrl: string;
  mimeType: "image/webp" | "image/jpeg";
  width: number;
  height: number;
  sizeBytes: number;
};

type ImageSource = ImageBitmap | HTMLImageElement;

function clampDimensions(
  width: number,
  height: number,
  maxDimension: number,
  scaleMultiplier = 1,
): { width: number; height: number } {
  const baseScale = Math.min(1, maxDimension / Math.max(width, height));
  const finalScale = Math.min(1, baseScale * scaleMultiplier);

  return {
    width: Math.max(1, Math.round(width * finalScale)),
    height: Math.max(1, Math.round(height * finalScale)),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read the selected image."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected image file."));
    };

    reader.readAsDataURL(file);
  });
}

async function loadImageSource(file: File): Promise<ImageSource> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fallback to HTMLImageElement for older/buggy mobile browsers
    }
  }

  const src = await readFileAsDataUrl(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode the selected image."));
    image.src = src;
  });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function renderToCanvas(source: ImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.drawImage(source, 0, 0, width, height);

  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed during export."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to convert optimized image into a transferable payload."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to serialize the optimized image."));
    };

    reader.readAsDataURL(blob);
  });
}

function getSourceDimensions(source: ImageSource): { width: number; height: number } {
  if ("width" in source && "height" in source) {
    return { width: source.width, height: source.height };
  }

  throw new Error("Unable to read the image dimensions.");
}

async function tryEncodeAtTarget(
  source: ImageSource,
  width: number,
  height: number,
  mimeType: "image/webp" | "image/jpeg",
  initialQuality: number,
  maxBytes: number,
): Promise<OptimizedImagePayload | null> {
  const canvas = renderToCanvas(source, width, height);
  let quality = initialQuality;

  while (quality >= MIN_QUALITY) {
    const blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob.size < maxBytes) {
      return {
        dataUrl: await blobToDataUrl(blob),
        mimeType,
        width,
        height,
        sizeBytes: blob.size,
      };
    }

    quality = Number((quality - QUALITY_STEP).toFixed(2));
  }

  return null;
}

export async function optimizeImageForUpload(
  file: File,
  options?: {
    maxDimension?: number;
    maxBytes?: number;
    preferredQuality?: number;
  },
): Promise<OptimizedImagePayload> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Image optimization must run in the browser.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const source = await loadImageSource(file);

  try {
    const { width: sourceWidth, height: sourceHeight } = getSourceDimensions(source);
    const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
    const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
    const preferredQuality = options?.preferredQuality ?? DEFAULT_WEBP_QUALITY;
    const mimeCandidates: Array<"image/webp" | "image/jpeg"> = ["image/webp", "image/jpeg"];

    let scaleMultiplier = 1;

    while (scaleMultiplier >= MIN_SCALE) {
      const bounded = clampDimensions(sourceWidth, sourceHeight, maxDimension, scaleMultiplier);

      for (const mimeType of mimeCandidates) {
        const encoded = await tryEncodeAtTarget(
          source,
          bounded.width,
          bounded.height,
          mimeType,
          preferredQuality,
          maxBytes,
        );

        if (encoded) {
          return encoded;
        }
      }

      scaleMultiplier = Number((scaleMultiplier * SCALE_STEP).toFixed(2));
    }
  } finally {
    if ("close" in source && typeof source.close === "function") {
      source.close();
    }
  }

  throw new Error("The image is still too large after compression. Please retake it with better lighting or crop closer to the label.");
}
