# Contributing to Bird API

Thank you for your interest in contributing to Bird API! This is an open source project, and we welcome contributions from the community.

## Ways to Contribute

- **Report bugs** — found an issue? Let us know
- **Suggest features** — have an idea for improvement?
- **Improve documentation** — fix typos, clarify instructions, add examples
- **Submit code** — fix bugs, add features, optimize performance
- **Share workflows** — contribute n8n, Zapier, or Make workflow templates

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub
# Then clone your fork locally
git clone https://github.com/your-username/bird-api.git
cd bird-api
```

### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Or a bugfix branch
git checkout -b bugfix/my-bugfix
```

### 3. Make Changes

- Follow the existing code style
- Keep changes focused and atomic (one feature/fix per PR)
- Add tests if applicable
- Update documentation

### 4. Test Your Changes

```bash
# Install dependencies
npm install

# Start the server
npm start

# Test an endpoint
curl "http://localhost:3000/health"
```

### 5. Commit and Push

```bash
# Write clear, descriptive commit messages
git add .
git commit -m "Add feature: support for custom headers"

# Push to your fork
git push origin feature/my-feature
```

### 6. Open a Pull Request

1. Go to [github.com/your-username/bird-api](https://github.com)
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill out the PR description:
   - **What does this PR do?** (brief summary)
   - **Why?** (motivation or problem it solves)
   - **How to test?** (steps for reviewers to verify)
   - **Related issues?** (link to GitHub issues if applicable)

5. Submit and wait for review!

---

## Code Style

### JavaScript / Node.js

- Use `const` and `let` (no `var`)
- Use semicolons
- 2-space indentation
- Use descriptive variable names
- Add comments for complex logic

**Example:**
```javascript
// Good
const apiKey = req.headers['x-api-key'];
if (!apiKey) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Avoid
var key = req.headers['x-api-key']
if (!key) res.status(401).json({error: 'Unauthorized'})
```

### Comments

- Use comments for the "why", not the "what"
- Keep comments up-to-date with code

```javascript
// Good
// Rate limit error from X's API — retry after 15 minutes
if (response.status === 429) {
  // ...
}

// Avoid
// Set status to 429 if rate limited
if (response.status === 429) {
  // ...
}
```

---

## Types of Contributions

### Bug Reports

**Before reporting:**
- Check existing issues to avoid duplicates
- Verify the issue with the latest version
- Collect error messages and logs

**When reporting:**
1. Open an issue on GitHub
2. Use a clear title: "Bug: X endpoint returns 500 on empty query"
3. Describe:
   - What you expected
   - What actually happened
   - Steps to reproduce
   - Your environment (OS, Node version, deployment method)

**Example:**
```
**Bug:** /search endpoint crashes on empty query string

**Expected:** Return 400 error with helpful message

**Actual:** Returns 500 Internal Server Error

**Steps to reproduce:**
1. Call GET /search (no ?q parameter)
2. See error

**Environment:**
- Node.js 18.0.0
- Linux
- Railway deployment
```

### Feature Requests

1. Open an issue with title: "Feature: X"
2. Describe the use case and why it's needed
3. Suggest implementation (if you have ideas)

**Example:**
```
**Feature:** Support webhook headers in responses

**Use case:** n8n workflows need to include custom headers in webhook responses

**Suggested implementation:**
Add optional ?headers={...} parameter to POST endpoints
```

### Documentation Improvements

- Typos and grammar fixes
- Clarifying existing explanations
- Adding examples
- Adding troubleshooting sections

Just submit a PR with your changes!

### Code Contributions

#### Small Changes (typos, minor fixes)

1. Fork → create branch → make changes → PR
2. No issue needed if the change is obvious

#### Medium Changes (new endpoint, new feature)

1. **Open an issue first** — discuss your idea with maintainers
2. Wait for feedback before starting work
3. Fork → create branch → make changes → PR

#### Large Changes (major refactor, architecture change)

1. **Open an issue and propose a design document**
2. Get feedback from maintainers
3. Implement once approved
4. PR should reference the issue

---

## Testing

### Manual Testing

Test your changes locally:

```bash
# Start the server
npm start

# In another terminal, test endpoints
curl "http://localhost:3000/health"

curl "http://localhost:3000/search?q=test&n=5" \
  -H "x-api-key: test-secret"

# Test error cases
curl "http://localhost:3000/search" # Missing ?q parameter
```

### Edge Cases to Test

- **Missing parameters**: `GET /search` (no ?q)
- **Invalid parameters**: `GET /search?q=test&n=abc`
- **Long inputs**: Very long search query
- **Special characters**: Quotes, escape sequences
- **Rate limiting**: Rapid sequential requests
- **Authentication**: Wrong/missing API key

---

## PR Review Process

When you submit a PR:

1. **Automated checks run** (lint, tests if any)
2. **Maintainers review** your changes
3. **You address feedback** (if any)
4. **PR is merged!** ✨

### What Reviewers Look For

- ✅ Code works and is tested
- ✅ Follows project style
- ✅ Doesn't break existing functionality
- ✅ Documentation is updated
- ✅ Commit messages are clear
- ✅ PR description explains the "why"

### Addressing Feedback

- Respond to comments
- Make requested changes
- Push new commits (don't rewrite history)
- Mark conversations as resolved once addressed

---

## Documentation

### README.md

- Main project overview
- Quick start
- API reference
- Link to detailed docs

### SETUP.md

- Detailed setup instructions
- Deployment for different platforms
- Troubleshooting

### USAGE.md

- Workflow patterns
- Examples for n8n, Zapier, Make
- Best practices
- Rate limiting

### CONTENT_SOURCING.md

- Search operators reference
- Content sourcing recipes
- Workflow patterns

### Code Comments

- Explain complex logic
- Document function parameters if not obvious
- Add links to related issues or docs

---

## Commit Messages

Write clear, descriptive commit messages:

```
# Good
Add support for custom API timeout configuration
Fix rate limit retry logic in search endpoint
Update SETUP.md with Railway deployment guide

# Avoid
Fix stuff
Update code
WIP
```

**Format:**
```
[Short summary, 50 chars or less]

[Optional longer explanation]
[Explain what and why, not how]

[Optional: Related issues]
Fixes #123
Related to #456
```

---

## Versioning

Bird API uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., endpoint renamed)
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes

Example: `1.2.3`

When bumping version:
1. Update `package.json`
2. Create a git tag: `git tag v1.2.3`
3. Push tags: `git push origin v1.2.3`

---

## License

By contributing to Bird API, you agree that your contributions will be licensed under the MIT License. You retain copyright to your work.

---

## Code of Conduct

We're committed to a welcoming, inclusive community.

- Be respectful and kind
- No harassment or discrimination
- Assume good intent
- Focus on the code, not the person
- Report violations privately to maintainers

---

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open an Issue
- **Feature requests**: Open an Issue with label `enhancement`
- **Direct communication**: Comment on relevant issues/PRs

---

## Thank You!

Thank you for contributing to Bird API. Every contribution—no matter how small—makes the project better. 🙏

Happy coding! 🚀
