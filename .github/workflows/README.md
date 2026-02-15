# GitHub Project Automation Setup

This repository uses GitHub Actions to automatically add issues to the project board.

## Workflows

### 1. Auto-add Review Issues (`auto-review-status.yml`)
- **Trigger**: When an issue is opened or labeled with `review`
- **Action**: Adds issue to Project #2 and sets status to "Review"

### 2. Add All Issues to Project (`add-to-project.yml`)  
- **Trigger**: When any issue is opened
- **Action**: Adds issue to Project #2 with "Todo" status (unless it has the `review` label)

## Required Setup

**Organization projects require a Personal Access Token (PAT)** because `GITHUB_TOKEN` doesn't have write access to organization-level projects.

### Create Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Configure:
   - **Note**: `Incial Project Automation`
   - **Expiration**: 90 days (recommended)
   - **Scopes**: 
     - ✅ `repo` (Full repository access)
     - ✅ `write:org` (Organization projects access)
3. Click **Generate token**
4. **Copy the token immediately** (you won't see it again!)

### Add Token to Repository Secrets

1. Go to: https://github.com/incial/Incial-web/settings/secrets/actions
2. Click **New repository secret**
3. Name: `PAT_TOKEN`
4. Value: Paste your token
5. Click **Add secret**

## Testing

After adding the PAT_TOKEN secret:

```bash
# Test regular issue (should get "Todo" status)
gh issue create --title "Test: Regular issue" --body "Testing automation"

# Test review issue (should get "Review" status)
gh issue create --title "Test: Review issue" --body "Testing review" --label "review"
```

Verify in project board: https://github.com/orgs/incial/projects/2

## Troubleshooting

**Error: "Resource not accessible by integration"**
- `PAT_TOKEN` secret not configured
- PAT doesn't have `write:org` scope
- PAT has expired

**Issue not added to project**
- Check Actions tab: https://github.com/incial/Incial-web/actions
- Verify PAT owner has project access
- Check if workflows are enabled

**Status not set correctly**
- Field IDs may have changed in project settings
- Verify project structure at https://github.com/orgs/incial/projects/2

## Manual Workflow (Fallback)

If automation doesn't work:
```bash
gh project item-add 2 --owner incial --url https://github.com/incial/Incial-web/issues/<number>
```
