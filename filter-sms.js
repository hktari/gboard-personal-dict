#!/usr/bin/env node

/**
 * filter-sms.js
 *
 * This script reads an SMS Backup XML file, filters out SMS messages
 * where the contact_name attribute is empty, and writes a filtered XML file.
 * 
 * Usage: node filter-sms.js [input_sms.xml] [output_filtered.xml]
 * If no input is provided, defaults to 'data/sms-20250323205702.xml'.
 * If no output is provided, defaults to 'filtered_sms.xml'.
 */

const fs = require('fs');
const xml2js = require('xml2js');

// Get input and output paths from command-line arguments
const inputPath = process.argv[2] || 'data/sms-20250323205702.xml';
const outputPath = process.argv[3] || 'filtered_sms.xml';

// Read the input XML file
fs.readFile(inputPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        process.exit(1);
    }

    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    parser.parseString(data, (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            process.exit(1);
        }
        
        // Ensure that the root element is <smses> containing <sms> elements
        let smsEntries = [];
        if (result.smses && result.smses.sms) {
            smsEntries = Array.isArray(result.smses.sms) ? result.smses.sms : [result.smses.sms];
        } else {
            console.error('No SMS entries found in the XML file.');
            process.exit(1);
        }

        // Filter out SMS messages where contact_name is missing or empty
        const filtered = smsEntries.filter(sms => sms.contact_name && sms.contact_name.trim() !== "");

        // Update the result object with filtered SMS entries
        result.smses.sms = filtered;

        // Build the XML string from the updated object
        const builder = new xml2js.Builder();
        const xmlOutput = builder.buildObject(result);

        // Write the filtered XML to output file
        fs.writeFile(outputPath, xmlOutput, 'utf8', (err) => {
            if (err) {
                console.error('Error writing output file:', err);
                process.exit(1);
            }
            console.log(`Filtered XML has been written to ${outputPath} with ${filtered.length} SMS entries.`);
        });
    });
});
