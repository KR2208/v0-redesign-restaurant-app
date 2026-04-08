import { execSync } from 'child_process';
import path from 'path';

const projectPath = '/vercel/share/v0-project';

try {
  process.chdir(projectPath);

  // Configure git
  try {
    execSync('git config user.name "v0[bot]"', { stdio: 'pipe' });
    execSync('git config user.email "v0[bot]@users.noreply.github.com"', { stdio: 'pipe' });
  } catch (e) {
    // Config might already be set
  }

  // Add all changes
  execSync('git add -A', { stdio: 'inherit' });

  // Check if there are changes to commit
  try {
    execSync('git diff --cached --quiet', { stdio: 'pipe' });
    console.log('No changes to commit');
    process.exit(0);
  } catch (e) {
    // There are changes, continue
  }

  // Commit changes
  const commitMessage = `feat: retro diner theme redesign for Yelpy

- Updated color scheme with 1950s diner aesthetic (red, teal, mustard)
- Added retro typography (Pacifico, Poppins, Special Elite)
- Generated diner-themed images (hero, burger, milkshake, pie)
- Redesigned restaurant cards with checkered borders and images
- Enhanced AI recommendations section with vintage styling
- Styled map with retro markers and popups
- Added chrome borders and nostalgic design elements

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>`;

  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

  // Push to remote
  execSync('git push origin HEAD:v0/koushikramesh2002-4396-3f7f1cbd', { stdio: 'inherit' });

  console.log('✅ Successfully pushed to GitHub!');
} catch (error) {
  console.error('❌ Error during git operations:', error.message);
  process.exit(1);
}
