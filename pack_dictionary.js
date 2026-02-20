#!/usr/bin/env node

/**
 * pack_dictionary.js
 *
 * This script packages the personal dictionary file into a zip archive
 * with a timestamp in the filename, ready for import into GBoard.
 *
 * Usage: node pack_dictionary.js [input_file]
 *   - input_file defaults to 'output/personal_dictionary.txt'
 */

const fs = require("fs");
const path = require("path");
const { createWriteStream } = require("fs");
const archiver = require("archiver");

// Get input file path from command-line arguments
const inputFile = process.argv[2] || "output/personal_dictionary.txt";
const outputDir = "output";
const timestamp = new Date()
  .toISOString()
  .replace(/:/g, "-")
  .replace(/\..+/, "")
  .replace("T", "_");
const outputName = `gboard_dictionary_${timestamp}`;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create zip file
const zipPath = path.join(outputDir, `${outputName}.zip`);
const output = createWriteStream(zipPath);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Maximum compression
});

// Listen for archive events
output.on("close", () => {
  console.log(`Dictionary packaged successfully: ${zipPath}`);
  console.log(`Total bytes: ${archive.pointer()}`);
});

archive.on("error", (err) => {
  console.error("Error creating zip archive:", err);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

// Add dictionary file to zip with the correct name
archive.file(inputFile, { name: `${outputName}.txt` });

// Finalize the archive
archive.finalize();
