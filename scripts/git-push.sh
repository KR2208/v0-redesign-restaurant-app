#!/bin/bash
set -e

cd /vercel/share/v0-project

# Configure git
git config user.name "v0[bot]" || true
git config user.email "v0[bot]@users.noreply.github.com" || true

# Add all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi

# Commit changes
git commit -m "feat: retro diner theme redesign for Yelpy

- Updated color scheme with 1950s diner aesthetic (red, teal, mustard)
- Added retro typography (Pacifico, Poppins, Special Elite)
- Generated diner-themed images (hero, burger, milkshake, pie)
- Redesigned restaurant cards with checkered borders and images
- Enhanced AI recommendations section with vintage styling
- Styled map with retro markers and popups
- Added chrome borders and nostalgic design elements

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"

# Push to remote
git push origin HEAD:v0/koushikramesh2002-4396-3f7f1cbd

echo "✅ Successfully pushed to GitHub!"
