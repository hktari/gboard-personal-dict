#!/usr/bin/env node

/**
 * filter-sms.js
 *
 * This script reads an SMS Backup XML file, filters out SMS messages
 * where the contact_name attribute is empty, and writes a filtered XML file.
 * Uses line-by-line streaming to handle large files without running out of memory.
 *
 * Usage: node filter-sms.js [input_sms.xml] [output_filtered.xml]
 * If no input is provided, defaults to 'data/sms-20250323205702.xml'.
 * If no output is provided, defaults to 'filtered_sms.xml'.
 */

const fs = require("fs");
const readline = require("readline");

// Get input and output paths from command-line arguments
const inputPath = process.argv[2] || "data/sms-20250323205702.xml";
const outputPath = process.argv[3] || "filtered_sms.xml";

const readStream = fs.createReadStream(inputPath, "utf8");
const writeStream = fs.createWriteStream(outputPath, "utf8");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

let count = 0;
let filteredCount = 0;
let headerWritten = false;

console.log(`Filtering SMS from ${inputPath}...`);

rl.on("line", (line) => {
  const trimmedLine = line.trim();

  // Pass through XML declaration
  if (trimmedLine.startsWith("<?xml")) {
    writeStream.write(line + "\n");
    return;
  }

  // Pass through opening smses tag
  if (trimmedLine.startsWith("<smses")) {
    writeStream.write(line + "\n");
    headerWritten = true;
    return;
  }

  // Pass through closing smses tag
  if (trimmedLine === "</smses>") {
    writeStream.write(line + "\n");
    return;
  }

  // Process SMS entries
  if (trimmedLine.startsWith("<sms ")) {
    count++;

    // Filter: only keep outgoing SMS messages (type="2")
    const typeMatch = trimmedLine.match(/type="([^"]*)"/);
    if (typeMatch && typeMatch[1] === "2") {
      filteredCount++;
      writeStream.write(line + "\n");
    }

    if (count % 10000 === 0) {
      console.log(`Processed ${count} messages, kept ${filteredCount}...`);
    }
  }
});

rl.on("close", () => {
  writeStream.end();
  console.log(`\nFiltering complete!`);
  console.log(`Total messages processed: ${count}`);
  console.log(`Messages with contact names: ${filteredCount}`);
  console.log(`Filtered XML written to: ${outputPath}`);
});

rl.on("error", (err) => {
  console.error("Error reading file:", err);
  process.exit(1);
});

writeStream.on("error", (err) => {
  console.error("Error writing output file:", err);
  process.exit(1);
});
