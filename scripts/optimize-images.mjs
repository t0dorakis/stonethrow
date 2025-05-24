import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const INPUT_DIR = "./public";
const SUPPORTED_FORMATS = [".png", ".jpg", ".jpeg", ".webp"];

async function createOptimizedVersions(inputPath) {
  const { ext, name, dir } = parse(inputPath);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const originalStats = await stat(inputPath);

    console.log(
      `Processing ${name}${ext} (${metadata.width}x${metadata.height}, ${(
        originalStats.size /
        1024 /
        1024
      ).toFixed(2)}MB)...`
    );

    // Create optimized versions in original format
    const mediumPath = join(dir, `${name}-min-0${ext}`);
    await createOptimizedVersion(inputPath, mediumPath, ext, "medium");

    const lowPath = join(dir, `${name}-min-1${ext}`);
    await createOptimizedVersion(inputPath, lowPath, ext, "low");

    // Create WebP versions (unless original is already WebP)
    let mediumWebpPath;
    let lowWebpPath;
    if (ext.toLowerCase() !== ".webp") {
      mediumWebpPath = join(dir, `${name}-min-0.webp`);
      await createOptimizedVersion(
        inputPath,
        mediumWebpPath,
        ".webp",
        "medium"
      );

      lowWebpPath = join(dir, `${name}-min-1.webp`);
      await createOptimizedVersion(inputPath, lowWebpPath, ".webp", "low");
    }

    // Check file sizes and report
    const mediumStats = await stat(mediumPath);
    const lowStats = await stat(lowPath);

    const mediumReduction = (
      ((originalStats.size - mediumStats.size) / originalStats.size) *
      100
    ).toFixed(1);
    const lowReduction = (
      ((originalStats.size - lowStats.size) / originalStats.size) *
      100
    ).toFixed(1);

    console.log(
      `✓ Created ${name}-min-0${ext}: ${mediumReduction}% smaller (${(
        mediumStats.size /
        1024 /
        1024
      ).toFixed(2)}MB)`
    );
    console.log(
      `✓ Created ${name}-min-1${ext}: ${lowReduction}% smaller (${(
        lowStats.size /
        1024 /
        1024
      ).toFixed(2)}MB)`
    );

    // Report WebP versions if created
    if (ext.toLowerCase() !== ".webp") {
      const mediumWebpStats = await stat(mediumWebpPath);
      const lowWebpStats = await stat(lowWebpPath);

      const mediumWebpReduction = (
        ((originalStats.size - mediumWebpStats.size) / originalStats.size) *
        100
      ).toFixed(1);
      const lowWebpReduction = (
        ((originalStats.size - lowWebpStats.size) / originalStats.size) *
        100
      ).toFixed(1);

      console.log(
        `✓ Created ${name}-min-0.webp: ${mediumWebpReduction}% smaller (${(
          mediumWebpStats.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
      console.log(
        `✓ Created ${name}-min-1.webp: ${lowWebpReduction}% smaller (${(
          lowWebpStats.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
    }

    console.log(""); // Empty line for better readability
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
  }
}

async function createOptimizedVersion(inputPath, outputPath, ext, quality) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Calculate dimensions for different quality levels
  let resizeOptions = {};
  let qualitySettings = {};

  if (quality === "medium") {
    // Target ~20% of original size
    resizeOptions = {
      width: Math.round(metadata.width * 0.6), // Slightly smaller dimensions
      height: Math.round(metadata.height * 0.6),
      fit: "inside",
      withoutEnlargement: true,
    };
    qualitySettings = getQualitySettings(ext, 65); // Medium quality
  } else if (quality === "low") {
    // Target ~5% of original size
    resizeOptions = {
      width: Math.round(metadata.width * 0.2), // Much smaller dimensions
      height: Math.round(metadata.height * 0.2),
      fit: "inside",
      withoutEnlargement: true,
    };
    qualitySettings = getQualitySettings(ext, 35); // Low quality
  }

  let processedImage = image.resize(resizeOptions);

  switch (ext.toLowerCase()) {
    case ".png":
      processedImage = processedImage.png(qualitySettings);
      break;
    case ".jpg":
    case ".jpeg":
      processedImage = processedImage.jpeg(qualitySettings);
      break;
    case ".webp":
      processedImage = processedImage.webp(qualitySettings);
      break;
    default:
      throw new Error(`Unsupported format: ${ext}`);
  }

  await processedImage.toFile(outputPath);
}

function getQualitySettings(ext, baseQuality) {
  switch (ext.toLowerCase()) {
    case ".png":
      return {
        quality: baseQuality,
        compressionLevel: baseQuality > 50 ? 6 : 9,
        progressive: true,
      };
    case ".jpg":
    case ".jpeg":
      return {
        quality: baseQuality,
        progressive: true,
        mozjpeg: true,
      };
    case ".webp":
      return {
        quality: baseQuality,
        effort: baseQuality > 50 ? 4 : 6,
      };
    default:
      return { quality: baseQuality };
  }
}

async function processDirectory(dir) {
  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await processDirectory(fullPath);
      } else if (stats.isFile()) {
        const { ext, name } = parse(entry);

        // Skip already optimized files and backups
        if (name.includes("-min-") || name.endsWith(".original")) {
          continue;
        }

        if (SUPPORTED_FORMATS.includes(ext.toLowerCase())) {
          await createOptimizedVersions(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

async function main() {
  console.log("🖼️  Creating optimized image versions...");
  console.log("📝  Generating:");
  console.log("    • {name}-min-0.{ext} - medium quality in original format");
  console.log("    • {name}-min-1.{ext} - low quality in original format");
  console.log("    • {name}-min-0.webp - medium quality WebP");
  console.log("    • {name}-min-1.webp - low quality WebP");
  console.log("");

  try {
    await processDirectory(INPUT_DIR);
    console.log("✅ Image optimization complete!");
    console.log("💡 Original files are preserved unchanged");
  } catch (error) {
    console.error("❌ Image optimization failed:", error.message);
    process.exit(1);
  }
}

main();
