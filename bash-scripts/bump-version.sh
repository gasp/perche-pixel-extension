#!/bin/bash
# Usage: ./bump-version.sh [patch|minor|major|<version>]
# Examples:
#   ./bump-version.sh patch      # 0.5.4 -> 0.5.5
#   ./bump-version.sh minor      # 0.5.4 -> 0.6.0
#   ./bump-version.sh major      # 0.5.4 -> 1.0.0
#   ./bump-version.sh 1.2.3      # Set to 1.2.3

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the root package.json path
ROOT_PACKAGE_JSON="./package.json"

# Check if package.json exists
if [ ! -f "$ROOT_PACKAGE_JSON" ]; then
  echo -e "${RED}Error: package.json not found in current directory${NC}"
  exit 1
fi

# Get current version
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' "$ROOT_PACKAGE_JSON" | cut -d'"' -f4)
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"

# Parse current version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Determine new version
if [ $# -eq 0 ]; then
  echo -e "${RED}Error: No version argument provided${NC}"
  echo "Usage: $0 [patch|minor|major|<version>]"
  exit 1
fi

BUMP_TYPE=$1

case $BUMP_TYPE in
  patch)
    NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
    ;;
  minor)
    NEW_VERSION="${MAJOR}.$((MINOR + 1)).0"
    ;;
  major)
    NEW_VERSION="$((MAJOR + 1)).0.0"
    ;;
  *)
    # Check if it's a valid version format
    if [[ "$BUMP_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      NEW_VERSION=$BUMP_TYPE
    else
      echo -e "${RED}Error: Invalid version format '${BUMP_TYPE}'${NC}"
      echo "Usage: $0 [patch|minor|major|<version>]"
      echo "Version format should be: X.Y.Z (e.g., 1.2.3)"
      exit 1
    fi
    ;;
esac

echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Ask for confirmation
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Version bump cancelled${NC}"
  exit 0
fi

# Update version in root package.json only
echo -e "${YELLOW}Updating version in root package.json...${NC}"
perl -i -pe"s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_PACKAGE_JSON"
echo -e "  Updated: $ROOT_PACKAGE_JSON"

# Stage the changes
echo -e "${YELLOW}Staging changes...${NC}"
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo -e "${YELLOW}No changes to commit (version might already be ${NEW_VERSION})${NC}"
  exit 0
fi

# Commit the changes
COMMIT_MESSAGE="chore(bump): new version ${NEW_VERSION}"
echo -e "${YELLOW}Creating commit: ${COMMIT_MESSAGE}${NC}"
git commit -m "$COMMIT_MESSAGE"

# Create git tag
TAG_NAME="v${NEW_VERSION}"
echo -e "${YELLOW}Creating tag: ${TAG_NAME}${NC}"
git tag -a "$TAG_NAME" -m "Version ${NEW_VERSION}"

# Push changes and tags
echo -e "${YELLOW}Pushing changes to origin...${NC}"
git push origin

echo -e "${YELLOW}Pushing tags to origin...${NC}"
git push origin --tags

echo -e "${GREEN}✓ Successfully bumped version to ${NEW_VERSION}${NC}"
echo -e "${GREEN}✓ Created tag ${TAG_NAME}${NC}"
echo -e "${GREEN}✓ Pushed changes and tags to origin${NC}"

