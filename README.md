# GBoard Personal Dictionary Generator

This tool enhances GBoard's personal dictionary by extracting vocabulary from your SMS messages. It analyzes your outgoing messages to identify frequently used words and phrases, then generates a GBoard-compatible dictionary file.

## Features

- **Frequency-based filtering**: Only includes words and phrases you use frequently
- **Unicode support**: Properly handles special characters (č, š, ž, etc.)
- **Bigram extraction**: Captures common two-word phrases
- **Automatic timestamping**: Output files include ISO timestamps
- **ZIP packaging**: Creates GBoard-ready zip archives
- **Configurable thresholds**: Customize minimum frequency and word length

## Installation

```bash
npm install
```

## How to Use

### 1. Export SMS Messages

Install [SMS Backup & Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore) on your Android phone and export your SMS messages.

### 2. Prepare Data

Copy the exported `sms.xml` file into the `data/` directory.

### 3. Filter SMS Messages

Extract only your outgoing messages:

```bash
npm run filter
# or manually:
node filter-sms.js data/sms.xml data/filtered_sms.xml
```

### 4. Generate Dictionary

Create the personal dictionary with frequency analysis:

```bash
npm run generate
# or manually:
node personal_dictionary.js data/filtered_sms.xml
```

This creates a timestamped file like `output/personal_dictionary_2026-02-20T12-07-45.txt`

### 5. Package for GBoard

Pack the dictionary into a zip file ready for import:

```bash
npm run pack
# or manually with specific file:
node pack_dictionary.js output/personal_dictionary_2026-02-20T12-07-45.txt
```

This creates `output/gboard_dictionary_2026-02-20_12-08-30.zip`

### 6. Import to GBoard

1. Transfer the `.zip` file to your Android device
2. Open GBoard settings → Dictionary → Personal dictionary
3. Import the zip file

## Additional Commands

### Unpack Dictionary

Extract a dictionary from a zip file:

```bash
npm run unpack output/gboard_dictionary_2026-02-20_12-08-30.zip
# or manually:
node unpack_dictionary.js output/gboard_dictionary_2026-02-20_12-08-30.zip output/extracted.txt
```

## Configuration

Edit the constants in `personal_dictionary.js` to customize filtering:

- `UNIGRAM_THRESHOLD`: Minimum frequency for single words (default: 5)
- `BIGRAM_THRESHOLD`: Minimum frequency for word pairs (default: 3)
- `MIN_WORD_LENGTH`: Minimum word length (default: 2)

## Output Format

The generated dictionary follows GBoard's format:

```
# Gboard Dictionary version:1
	word1
	word2
	phrase one
```

Statistics are appended at the end showing:

- Total SMS processed
- Number of frequent unigrams and bigrams
- Configuration settings used
