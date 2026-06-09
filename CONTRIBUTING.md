# TheraQuest v2 — Contribution Guide

Thank you for your interest in TheraQuest! 🎉

## 🏃 Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/theraquest-v2.git`
3. **Follow** the [Quick Start guide](README.md#-quick-start) in the README
4. **Create a branch**: `git checkout -b feature/your-feature-name`

## 📐 Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints everywhere
- All agents must implement async functions
- Validate with Pydantic schemas

### Frontend (TypeScript/React)
- Functional components with hooks only
- Use `useGlobalState()` for XP / badge events
- Prefer CSS variables over hard-coded colors
- All animations via Framer Motion

## 🔀 Pull Request Process

1. Ensure your branch is up to date with `main`
2. Test both frontend and backend before submitting
3. Add a clear PR description of what changed and why
4. Reference any related issues

## 🐛 Reporting Bugs

Please open a [GitHub Issue](https://github.com/amen-creator/theraquest-v2/issues) with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS details

## 💡 Feature Requests

Open an issue with the `enhancement` label and describe:
- The problem you're solving
- Your proposed solution
- Any CBT/mental health research that supports it

---

*Built with ❤️ and the Google Antigravity AI Platform*
