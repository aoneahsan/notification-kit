#!/bin/bash

# Sync documentation from /docs to /website/docs
echo "Syncing documentation..."

# Create website docs directory if it doesn't exist
mkdir -p website/docs

# Copy all documentation files
cp -r docs/* website/docs/

echo "Documentation synced successfully!"