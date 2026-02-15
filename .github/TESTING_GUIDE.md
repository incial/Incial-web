# Testing & Review Guide for Incial Web

Welcome! This guide will help you test the Incial website and submit feedback using GitHub Issues.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Creating a Review Issue](#creating-a-review-issue)
- [Review Types](#review-types)
- [Severity Levels](#severity-levels)
- [Screenshots & Evidence](#screenshots--evidence)
- [Project Board Workflow](#project-board-workflow)
- [Other Issue Types](#other-issue-types)
- [Tips for Effective Testing](#tips-for-effective-testing)

---

## 🚀 Getting Started

### What You'll Need

- A GitHub account
- Access to the Incial-web repository
- A web browser for testing
- Screen capture tool (built into Windows/Mac)

### Where to Test

- **Live Website**: [Your staging/production URL]
- **Local Development**: Ask developers for setup instructions

---

## ✍️ Creating a Review Issue

Review issues are used for reporting bugs, UI/UX feedback, design feedback, and suggestions.

### Step 1: Navigate to Issues

Go to: https://github.com/incial/Incial-web/issues/new/choose

### Step 2: Select "Review / Feedback"

Click the **Get started** button next to "Review / Feedback"

### Step 3: Fill Out the Template

**Required Fields:**

1. **Title** - Short, descriptive summary
   ```
   Good: "Mobile menu doesn't close on navigation"
   Bad: "Menu broken"
   ```

2. **Review Type** - Select the most appropriate:
   - 🐛 **Bug Report** - Something is broken or not working
   - 🎨 **Design Feedback** - Colors, fonts, spacing, visual elements
   - 💡 **UX Feedback** - User experience, navigation, interactions
   - 📱 **Responsive Issue** - Layout problems on different screen sizes
   - ♿ **Accessibility** - Screen reader, keyboard navigation, contrast
   - ⚡ **Performance** - Slow loading, animations lagging
   - 📝 **Content** - Text, images, copy suggestions
   - ✨ **Enhancement** - Improvement ideas
   - ❓ **Question** - Need clarification

3. **Page/Section** - Where did you find the issue?
   ```
   Examples:
   - Homepage > Hero Section
   - About Us > Team Grid
   - Navigation > Mobile Menu
   - Contact Form
   ```

4. **Description** - What did you observe?
   ```markdown
   **What I saw:**
   The mobile menu remains open after clicking a navigation link.
   
   **What I expected:**
   The menu should close automatically when I click a link.
   
   **Steps to reproduce:**
   1. Open website on mobile (or resize browser to 375px)
   2. Click hamburger menu icon
   3. Click any navigation link (e.g., "About Us")
   4. Menu stays open instead of closing
   ```

5. **Severity** - How critical is this?
   - 🔴 **Critical** - Blocks users, site broken, security issue
   - 🟠 **High** - Major functionality affected, poor UX
   - 🟡 **Medium** - Noticeable but has workaround
   - 🟢 **Low** - Minor visual issue, nice-to-have

6. **Screenshots/Videos** - Visual evidence
   - **Required** for visual/UI issues
   - Optional but helpful for other issues

**Optional Fields:**

- **Browser & Version** - Chrome 120, Safari 17, Firefox 121, etc.
- **Device** - Desktop, iPhone 14, iPad Pro, Samsung Galaxy S23
- **Additional Context** - Any other relevant details

### Step 4: Submit

Click **Submit new issue** - it will automatically:
- Be added to Project Board with "Review" status
- Get the `review` label
- Notify the development team

---

## 🏷️ Review Types

### 🐛 Bug Report
**When to use:** Something is broken or doesn't work as expected

**Examples:**
- Form submission fails
- Link goes to wrong page
- Animation doesn't play
- JavaScript error in console

---

### 🎨 Design Feedback
**When to use:** Visual design doesn't match expectations or could be improved

**Examples:**
- Colors don't match brand guidelines
- Font size too small/large
- Spacing feels cramped
- Logo appears pixelated
- Button style inconsistent

---

### 💡 UX Feedback
**When to use:** User experience could be better

**Examples:**
- Navigation confusing
- Too many clicks to complete action
- Unclear call-to-action
- Form validation unclear
- Animations too slow/fast

---

### 📱 Responsive Issue
**When to use:** Layout breaks on different screen sizes

**Examples:**
- Text overlaps on mobile
- Images don't resize properly
- Horizontal scrolling appears
- Menu unusable on tablet

**Testing Sizes:**
- 📱 Mobile: 375px (iPhone SE) - 414px (iPhone Pro Max)
- 📱 Tablet: 768px (iPad) - 1024px (iPad Pro)
- 💻 Desktop: 1280px - 1920px - 2560px

---

### ♿ Accessibility
**When to use:** Site isn't usable for people with disabilities

**Examples:**
- Can't navigate with keyboard (Tab key)
- Screen reader can't read content
- Color contrast too low (text hard to read)
- No alt text on images
- Focus indicators missing

**Testing Checklist:**
- [ ] Can you navigate entire site with Tab/Shift+Tab?
- [ ] Does Enter/Space activate buttons/links?
- [ ] Can you see where focus is (outline/highlight)?
- [ ] Do images have descriptive alt text?
- [ ] Is text readable at high zoom (200%)?

---

### ⚡ Performance
**When to use:** Site feels slow or laggy

**Examples:**
- Page takes >3 seconds to load
- Animations stutter or freeze
- Scrolling isn't smooth
- Images load slowly

**How to test:**
- Open Chrome DevTools > Network tab
- Throttle to "Slow 3G" or "Fast 3G"
- Run Lighthouse audit (DevTools > Lighthouse)

---

### 📝 Content
**When to use:** Text or images need changes

**Examples:**
- Typo or grammar error
- Outdated information
- Missing content
- Broken image
- Incorrect wording

---

### ✨ Enhancement
**When to use:** You have an idea to make things better

**Examples:**
- "Add a dark mode toggle"
- "Include testimonials section"
- "Add smooth scroll to top button"
- "Show loading spinner on form submit"

---

## 🎯 Severity Levels

### 🔴 Critical
- Site completely broken
- Security vulnerability
- Data loss possible
- Checkout/payment broken
- No workaround available

**Action:** Developers will fix immediately

---

### 🟠 High
- Major feature doesn't work
- Significant UX problem
- Affects many users
- Workaround is difficult

**Action:** Fixed in current sprint

---

### 🟡 Medium
- Noticeable issue
- Affects some users
- Workaround available
- Not breaking functionality

**Action:** Fixed soon, prioritized in backlog

---

### 🟢 Low
- Minor visual quirk
- Nice-to-have improvement
- Rarely noticed
- Polish/refinement

**Action:** Fixed when time allows

---

## 📸 Screenshots & Evidence

### How to Take Good Screenshots

**Windows:**
- `Win + Shift + S` - Snipping Tool
- Select area, automatically copied to clipboard

**Mac:**
- `Cmd + Shift + 4` - Select area to capture
- `Cmd + Shift + 5` - Screen capture tools

**Browser DevTools:**
- `F12` to open DevTools
- `Ctrl/Cmd + Shift + P` → Type "screenshot"
- Choose full page or just viewport

### What to Include

✅ **Good Screenshots:**
- Shows the entire issue clearly
- Includes relevant context
- Highlights the problem area
- Shows browser/device info if relevant

❌ **Avoid:**
- Blurry or tiny screenshots
- Missing the actual issue
- Too zoomed in/out
- Multiple unrelated issues in one image

### Recording Videos

For complex interactions or animations:
- **Windows:** Xbox Game Bar (`Win + G`)
- **Mac:** QuickTime Player → File → New Screen Recording
- **Browser:** Loom extension (loom.com)

**Upload to:**
- Drag & drop into GitHub issue comment
- Upload to GitHub directly (supports MP4, GIF)

---

## 📊 Project Board Workflow

Your review issues automatically appear on the [Project Board](https://github.com/orgs/incial/projects/2).

### Status Flow

```
Review → In Progress → Done → Final Done
```

**Review** 🟠
- Issue just submitted
- Waiting for developer review
- Being triaged and prioritized

**In Progress** 🟡
- Developer is actively working on it
- Fix is being implemented
- You may be asked for more details

**Done** 🟢
- Fix is complete and pushed to code
- Ready for re-testing
- **Action needed:** Test again and confirm fix

**Final Done** 🔵
- You confirmed the fix works
- Issue is completely resolved
- Closed and archived

### Your Role

1. **After submitting** - Wait for status to change to "In Progress"
2. **When status changes to "Done"** - Re-test the issue
3. **If fixed** - Comment: "✅ Confirmed fixed, tested on [browser/device]"
4. **If not fixed** - Comment: "❌ Still seeing issue" with updated screenshots

---

## 📝 Other Issue Types

### 🐛 Bug Report
For confirmed bugs (not during testing phase)
- More technical details required
- Reproduction steps mandatory
- Console errors helpful

### ✨ Feature Request
For completely new features
- Describe the problem it solves
- Include Figma designs if available
- Explain expected behavior

### 📋 Task
For development work (developers use this)
- Technical implementation details
- Linked to parent issues
- Has acceptance criteria

---

## 💡 Tips for Effective Testing

### Testing Checklist

**Visual Testing:**
- [ ] Check all pages listed in navigation
- [ ] Test hover states on buttons/links
- [ ] Verify animations play smoothly
- [ ] Check image quality and loading
- [ ] Test dark mode (if applicable)

**Interaction Testing:**
- [ ] Click all buttons and links
- [ ] Submit all forms (with valid and invalid data)
- [ ] Try navigation from every page
- [ ] Test search functionality
- [ ] Try keyboard navigation (Tab through page)

**Responsive Testing:**
- [ ] Resize browser from 375px to 2560px
- [ ] Test on actual mobile device
- [ ] Test on tablet
- [ ] Rotate device to landscape
- [ ] Check touch targets are large enough (48px minimum)

**Browser Testing:**
Test on at least:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Performance Testing:**
- [ ] Open DevTools Network tab
- [ ] Hard refresh (`Ctrl/Cmd + Shift + R`)
- [ ] Check total page load time
- [ ] Note any resources taking >2 seconds
- [ ] Test on slow connection (throttle to 3G)

### Writing Good Issues

**Good Title:**
```
✅ "Contact form submit button doesn't work on mobile Safari"
❌ "Button broken"
```

**Good Description:**
```
✅ 
**Issue:** Submit button doesn't respond to touch on iPhone 13, Safari 17
**Steps:** 
1. Open contact page on iPhone
2. Fill out form
3. Tap submit button
4. Nothing happens
**Expected:** Form should submit and show success message
**Screenshot:** [attached]

❌ "Button doesn't work, please fix"
```

### One Issue Per Report

✅ **Do This:**
- Issue #1: "Mobile menu doesn't close"
- Issue #2: "Contact form missing validation"

❌ **Avoid This:**
- Issue #1: "Mobile menu doesn't close AND contact form missing validation AND logo pixelated"

### Be Specific

✅ **Good:**
- "Navbar overlaps hero text on 768px width (iPad portrait)"

❌ **Vague:**
- "Navbar looks weird on tablet"

### Include Context

Developers need to know:
- **What** you saw
- **What** you expected
- **Where** (URL or page name)
- **When** (does it always happen?)
- **How** to reproduce it

---

## 🆘 Need Help?

### Can't Find Something?
- Check the README: [README.md](../README.md)
- Review Guide: [REVIEW.md](REVIEW.md)
- Ask in Discussions: https://github.com/incial/Incial-web/discussions

### Questions About Issues?
- Comment on the issue directly
- Tag developers: @AbinVarghexe @deonas
- Use "Question" review type for clarifications

### Technical Problems?
- Browser console errors → Copy/paste into issue
- Network errors → Screenshot Network tab
- Can't access site → Report immediately as Critical

---

## 📚 Quick Reference

### Issue Template URLs

- **Review/Feedback**: https://github.com/incial/Incial-web/issues/new?template=review.yml
- **Bug Report**: https://github.com/incial/Incial-web/issues/new?template=bug_report.yml
- **Feature Request**: https://github.com/incial/Incial-web/issues/new?template=feature_request.yml

### Keyboard Shortcuts

| Action | Windows | Mac |
|--------|---------|-----|
| Screenshot | `Win + Shift + S` | `Cmd + Shift + 4` |
| DevTools | `F12` or `Ctrl + Shift + I` | `Cmd + Option + I` |
| Hard Refresh | `Ctrl + Shift + R` | `Cmd + Shift + R` |
| View Source | `Ctrl + U` | `Cmd + Option + U` |

### Severity Quick Guide

| Severity | When to Use | Example |
|----------|-------------|---------|
| 🔴 Critical | Site broken, security issue | "Payment processing fails" |
| 🟠 High | Major feature broken | "Can't submit contact form" |
| 🟡 Medium | Noticeable, has workaround | "Button hover state missing" |
| 🟢 Low | Minor polish | "Letter spacing slightly off" |

---

## ✨ Thank You!

Your testing and feedback make Incial better. Every issue you report helps us deliver a better experience for our users.

**Happy Testing!** 🚀

---

*Last updated: February 15, 2026*
*Questions? Open a discussion or contact the development team.*
