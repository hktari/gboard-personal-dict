#!/usr/bin/env node

/**
 * unpack_dictionary.js
 *
 * This script extracts a dictionary file from a GBoard dictionary zip archive.
 *
 * Usage: node unpack_dictionary.js <zip_file> [output_file]
 *   - zip_file: path to the zip archive (required)
 *   - output_file: destination path for extracted dictionary (optional, defaults to output/extracted_dictionary.txt)
 */

const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

// Get command-line arguments
const zipFile = process.argv[2];
const outputFile = process.argv[3] || "output/extracted_dictionary.txt";

if (!zipFile) {
  console.error("Error: Please provide a zip file path");
  console.error("Usage: node unpack_dictionary.js <zip_file> [output_file]");
  process.exit(1);
}

// Check if zip file exists
if (!fs.existsSync(zipFile)) {
  console.error(`Error: Zip file not found: ${zipFile}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Extract the zip file
console.log(`Extracting dictionary from: ${zipFile}`);

fs.createReadStream(zipFile)
  .pipe(unzipper.Parse())
  .on("entry", (entry) => {
    const fileName = entry.path;
    const type = entry.type;

    if (type === "File" && fileName.endsWith(".txt")) {
      console.log(`Extracting: ${fileName}`);
      entry
        .pipe(fs.createWriteStream(outputFile))
        .on("finish", () => {
          console.log(`Dictionary extracted successfully: ${outputFile}`);
        })
        .on("error", (err) => {
          console.error("Error writing extracted file:", err);
          process.exit(1);
        });
    } else {
      entry.autodrain();
    }
  })
  .on("error", (err) => {
    console.error("Error extracting zip file:", err);
    process.exit(1);
  })
  .on("finish", () => {
    console.log("Extraction complete");
  });
