#!/usr/bin/env python3
import subprocess
import os

def run_git_commands():
    """Push the retro diner redesign to GitHub"""
    
    # Change to project directory
    project_dir = "/vercel/share/v0-project"
    os.chdir(project_dir)
    
    print("📝 Adding all changes...")
    subprocess.run(["git", "add", "."], check=True)
    
    print("💾 Committing changes...")
    commit_message = """🎨 Redesign: Retro 1950s Diner Theme

- Complete visual redesign with retro American diner aesthetic
- Updated color scheme: red, teal, mustard with neon glow effects
- New typography: Pacifico for headings, Poppins for body text
- Generated retro diner images for hero, cards, and UI elements
- Redesigned components:
  - Restaurant cards with checkered borders and food images
  - AI recommendations styled as diner menu board
  - Enhanced map with coffee cup markers
  - Sidebar with retro diner hero image
- Added dark/light mode toggle with retro styling
- All elements feature classic diner aesthetic with vintage charm

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"""
    
    subprocess.run(["git", "commit", "-m", commit_message], check=True)
    
    print("🚀 Pushing to GitHub...")
    subprocess.run(["git", "push", "origin", "v0/koushikramesh2002-4396-3f7f1cbd"], check=True)
    
    print("✅ Successfully pushed to GitHub!")

if __name__ == "__main__":
    try:
        run_git_commands()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        exit(1)
