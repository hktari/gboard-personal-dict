#!/usr/bin/env node

/**
 * personal_dictionary.js
 *
 * This program reads a filtered SMS XML file (typically created by the SMS filter process) and generates a GBoard
 * Dictionary file. The dictionary file is formatted so that each line represents an entry in the form:
 *
 *     "{shortcut}\t{word}\t\n"
 *
 * For entries that are phrases (i.e. contain more than one word), the shortcut is left empty since GBoard shortcuts
 * must be a single word.
 *
 * The program performs the following steps:
 *   1. Reads the input XML file (default: data/filtered_sms.xml).
 *   2. Parses the XML to extract SMS messages and retrieves the body text from each SMS.
 *   3. Extracts unigrams (single words) using an enhanced regex that captures apostrophes, hyphens, and Unicode letters.
 *   4. Generates bigrams (two-word phrases) for each SMS and counts their frequency.
 *   5. Retains only those bigrams that appear at or above a specified frequency threshold (default threshold: 3).
 *   6. Combines the set of unigrams and frequent bigrams, sorts them, and writes them to the output dictionary file.
 *
 * Usage: node personal_dictionary.js [input_file] [output_file]
 *   - input_file defaults to 'data/filtered_sms.xml'
 *   - output_file defaults to 'personal_dictionary.txt'
 */

const fs = require("fs");
const xml2js = require("xml2js");

// Get input and output file paths from command-line arguments
const inputPath = process.argv[2] || "data/filtered_sms.xml";
const outputPath = process.argv[3] || "output/personal_dictionary.txt";

// Frequency threshold for including bigrams
const BIGRAM_THRESHOLD = 3;

// Enhanced regex to capture words including apostrophes and hyphens (with Unicode support)
function getWords(text) {
  if (!text) return [];
  // Matches words with letters, numbers, underscores, apostrophes, and hyphens
  const matches = text.match(/\b[\w'-]+\b/gu);
  return matches ? matches : [];
}

// Generate bigrams (two-word phrases) from an array of tokens
function getBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(tokens[i] + " " + tokens[i + 1]);
  }
  return bigrams;
}

// Read the input XML file
fs.readFile(inputPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    process.exit(1);
  }

  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  parser.parseString(data, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      process.exit(1);
    }

    // Expect the XML to have a <smses> root element with many <sms> children
    let smsEntries = [];
    if (result.smses && result.smses.sms) {
      smsEntries = Array.isArray(result.smses.sms)
        ? result.smses.sms
        : [result.smses.sms];
    } else {
      console.error("No SMS entries found in the XML file.");
      process.exit(1);
    }
    // Filter out incoming SMS messages (only keep outgoing messages, type '2')
    smsEntries = smsEntries.filter((sms) => sms.type === "2");

    // Use a Set to collect unique unigrams
    const unigramSet = new Set();
    // Object to count frequency of bigrams
    const bigramFreq = {};

    smsEntries.forEach((sms) => {
      const body = sms.body;
      const tokens = getWords(body).map((word) => word.toLowerCase());
      tokens.forEach((token) => {
        unigramSet.add(token);
      });
      const bigrams = getBigrams(tokens);
      bigrams.forEach((bigram) => {
        bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
      });
    });

    // Filter bigrams based on the frequency threshold
    const frequentBigrams = Object.keys(bigramFreq).filter(
      (bigram) => bigramFreq[bigram] >= BIGRAM_THRESHOLD
    );

    // Combine unigrams and frequent bigrams into one set
    const dictionaryEntries = new Set();
    unigramSet.forEach((word) => dictionaryEntries.add(word));
    frequentBigrams.forEach((bg) => dictionaryEntries.add(bg));

    // Convert to array and sort alphabetically
    const uniqueEntries = Array.from(dictionaryEntries).sort();

    // Prepare output lines with header
    const lines = ["# Gboard Dictionary version:1\n"];
    uniqueEntries.forEach((entry) => {
      // If the entry is a phrase (contains spaces), leave the shortcut field empty
      // Otherwise, also leave it empty for now (could be later extended to generate custom shortcuts)
      lines.push(`\t${entry}\t\n`);
    });

    // Write the dictionary entries to the output file
    fs.writeFile(outputPath, lines.join(""), "utf8", (err) => {
      if (err) {
        console.error("Error writing output file:", err);
        process.exit(1);
      }
      console.log(`Personal dictionary has been created: ${outputPath}`);
    });
  });
});
