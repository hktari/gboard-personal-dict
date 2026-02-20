# About

This program aims to improve gboard UX by generating a personal dictionary using exports from user's SMS messages.

# How to use

1. install https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore on your android phone
2. export your SMS messages using the app
3. copy exported sms.xml into data/ directory
4. run `node filter-sms.js data/sms.xml data/filtered_sms.xml` to filter out users SMS messages
5. run `node personal_dictionary.js data/filtered_sms.xml` to generate personal dictionary
6. run `node pack_dictionary.js data/shortcuts-<date>.txt` to pack the dictionary for gboard
7. upload the packed dictionary to your device
8. import the packed dictionary to gboard
