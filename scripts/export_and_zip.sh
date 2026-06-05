#!/bin/bash

# ./scripts/export_and_zip.sh "/Users/ddbrother/Desktop/Exports"
# export_and_zip.sh
# Runs InDesign batch export on a folder and then zips the resulting HTML and resources.

if [ -z "$1" ]; then
    echo "Usage: ./export_and_zip.sh /path/to/folder"
    exit 1
fi

TARGET_DIR="$1"

# Check if directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' does not exist."
    exit 1
fi

# Convert to absolute path so InDesign knows exactly where to look
TARGET_DIR=$(cd "$TARGET_DIR" && pwd)

echo "Starting InDesign export for: $TARGET_DIR"

# Run the InDesign ExtendScript via osascript
# We pass the TARGET_DIR as an argument so it skips the popup dialog
osascript <<EOF
tell application "Adobe InDesign 2026"
    set myScriptFile to POSIX file "/Users/ddbrother/Github/nobelium/scripts/batchexport.jsx"
    set myArgs to {"$TARGET_DIR"}
    do script myScriptFile language javascript with arguments myArgs
end tell
EOF

echo "InDesign export finished."
echo "Starting zipping process..."

cd "$TARGET_DIR" || exit 1

for html_file in *.html; do
    [ -e "$html_file" ] || continue

    base_name="${html_file%.html}"
    resources_folder="${base_name}-web-resources"
    
    if [ -d "$resources_folder" ]; then
        echo "Zipping $base_name..."
        zip -r -q "${base_name}.zip" "$html_file" "$resources_folder"
        echo "Created ${base_name}.zip"
    else
        echo "No resources folder found for $base_name, zipping HTML only..."
        zip -q "${base_name}.zip" "$html_file"
        echo "Created ${base_name}.zip"
    fi
done

echo "All finished successfully!"
