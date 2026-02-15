# GitHub Project Automation Setup

This repository uses GitHub Actions to automatically add issues to the project board.

## Workflows

### 1. Auto-add Review Issues (`auto-review-status.yml`)
- **Trigger**: When an issue is opened or labeled with `review`
- **Action**: Adds issue to Project #2 and sets status to "Review"

### 2. Add All Issues to Project (`add-to-project.yml`)  
- **Trigger**: When any issue is opened
- **Action**: Adds issue to Project #2 with "Todo" status (unless it has the `review` label)

## Required Permissions

For organization projects, the default `GITHUB_TOKEN` has limited permissions. You need to:

### Option 1: Enable GitHub Actions Permissions (Recommended)

1. Go to repository **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check ✅ **Allow GitHub Actions to create and approve pull requests**
5. Save

### Option 2: Use Organization Settings

1. Go to https://github.com/organizations/incial/settings/actions
2. Under **Workflow permissions**, select **Read and write permissions**
3. Save

### Option 3: Create a GitHub App (Most Secure)

If the above doesn't work for organization projects:

1. Go to https://github.com/organizations/incial/settings/apps
2. Click **New GitHub App**
3. Name: "Project Automation"
4. Permissions:
   - **Repository permissions**: Issues (Read & write)
   - **Organization permissions**: Projects (Read & write)
5. Generate a private key
6. Install the app on your repository
7. Add secrets to the repository:
   - `PROJECT_APP_ID`: The app ID
   - `PROJECT_APP_PRIVATE_KEY`: The private key content

## Testing

After setting up permissions, test by:

1. Creating a new issue with the `review` label
2. Check if it appears in Project #2 with "Review" status
3. Create a regular issue and check if it appears with "Todo" status

## Troubleshooting

If workflows fail:
- Check the **Actions** tab for error messages
- Verify the project IDs and field IDs are correct
- Ensure the workflow has project permissions
- Check if the `review` label exists in the repository

## Manual Workflow (Fallback)

If automation doesn't work, manually:
1. Use `gh project item-add 2 --owner incial --url <issue-url>`
2. Set status via project board UI
