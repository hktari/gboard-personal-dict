#!/usr/bin/python3

import os
from zipfile import ZipFile
from datetime import datetime

# Input and output paths
input_file = "output/personal_dictionary.txt"
output_dir = "output"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_name = f"gboard_dictionary_{timestamp}"

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Create zip file
zip_path = os.path.join(output_dir, f"{output_name}.zip")
with ZipFile(zip_path, 'w') as zipObj:
    # Add dictionary file to zip with the correct name
    zipObj.write(input_file, f"{output_name}.txt")

print(f"Dictionary packaged successfully: {zip_path}")
