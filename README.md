# ReDish

A React Native mobile app to document and share your favorite restaurant orders with friends.

---

## SDLC & Documentation

This project follows a lightweight but structured software development process to keep quality high as a solo project.

### 1. Requirements

All functional and non-functional requirements are captured in a Software Requirements Specification before implementation begins.

- [planning/srs.md](planning/srs.md) — Full SRS including functional requirements, security constraints, performance targets, and a verification table.

Key highlights:
- **Auth:** Clerk (SOC 2 compliant JWT management)
- **Privacy:** Friend-gated order visibility (REQ-SEC-001)
- **Social:** Friends' recent orders feed (REQ-FUNC-004)
- **Cost:** Infrastructure capped at $5/mo for first 500 users

### 2. Database Design

The data model is designed and versioned before schema implementation.

- [planning/DatabaseDesign.mermaid](planning/DatabaseDesign.mermaid) — ER diagram covering Users, Locations, Favorites, and the Friend/Subscriber relationship.

### 3. Prototypes

UI layouts are sketched before development to align on UX direction.

- [planning/prototypes/](planning/prototypes/) — Screen mockups for Login, Home, Search, and Friends views.

### 4. Development

Work is tracked via GitHub Issues and Pull Requests. Each feature is developed on a dedicated branch and merged via PR with a description of changes.

### 5. Verification

Each requirement has a defined verification method (Demonstration, Test, or Analysis) tracked in the SRS verification table.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React Native (Expo)               |
| Auth     | Clerk                             |
| Database | MongoDB Atlas                     |
| Maps     | Google Places API                 |
| Hosting  | Render (or equivalent free tier)  |

---

## Getting Started

```bash
yarn install
yarn run start
```
