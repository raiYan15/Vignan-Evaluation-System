# Vignan Evaluation System

![Vignan Evaluation System](Screenshots/Landing%20Page.jpeg)

**AI-powered internal assessment platform for faster, fairer, and scalable evaluation of descriptive answers.**

## Overview

Vignan Evaluation System is a full-stack academic evaluation platform designed to automate the scoring of descriptive student answers.
It combines a modern React + TypeScript frontend with a FastAPI backend and MongoDB storage to support secure user management,
single/batch evaluation, analytics, and searchable result history.

## Project gallery

### `Landing Page.jpeg` — Landing page hero

The main homepage banner with the project title, navigation, and call-to-action buttons.

![Landing page hero](Screenshots/Landing%20Page.jpeg)

### `Landing page section.jpeg` — Landing page feature section

The feature panel that highlights what the platform does and why it is useful.

![Landing page section](Screenshots/Landing%20page%20section.jpeg)

### `Landing page about section.jpeg` — About section

The about panel explaining the platform and its educational purpose.

![About section](Screenshots/Landing%20page%20about%20section.jpeg)

### `Landing page service section.jpeg` — Services section

The service-oriented section showing the platform capabilities and support areas.

![Services section](Screenshots/Landing%20page%20service%20section.jpeg)

### `Landing page Footer.jpeg` — Footer section

The closing page section with contact and navigation details.

![Footer section](Screenshots/Landing%20page%20Footer.jpeg)

### `Sign in.jpeg` — Sign in screen

The login screen for returning users to access their dashboard.

![Sign in screen](Screenshots/Sign%20in.jpeg)

### `Sign Up.jpeg` — Sign up screen

The account creation form for new users, including student and faculty registration.

![Sign up screen](Screenshots/Sign%20Up.jpeg)

### `Model workflow .jpeg` — Model workflow diagram

The AI pipeline showing input processing, OCR, evaluation, and final mark prediction.

![Model workflow](Screenshots/Model%20workflow%20.jpeg)

### `Workflow .jpeg` — System architecture workflow

The architecture map that explains how the client, API, services, data layer, and backend components connect.

![Workflow architecture](Screenshots/Workflow%20.jpeg)

### `WhatsApp Image 2026-04-24 at 9.55.04 PM (1).jpeg` — Promotional / branding asset

An additional branding image from the project assets folder that can be used for documentation or presentation.

![Promotional asset](Screenshots/WhatsApp%20Image%202026-04-24%20at%209.55.04%20PM%20%281%29.jpeg)

## Key highlights

- Intelligent answer evaluation for descriptive responses
- Single and batch assessment workflows
- Role-based access for students, faculty, and administrators
- Secure authentication and protected API routes
- Evaluation results, analytics, and history tracking
- Responsive UI with a clean campus-ready interface

## Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Backend:** FastAPI, Python, JWT-based auth, MongoDB  
**AI / ML:** NLP-based scoring pipeline and evaluation engine  
**Tooling:** Vitest, pytest, ESLint, Bun / npm

## Project structure

```text
Backend/   → FastAPI backend, services, repositories, tests
Frontend/  → React frontend, pages, components, hooks, and UI assets
ABSTRACT.md → Detailed project abstract and methodology
SYSTEM_ARCHITECTURE.md → Architecture overview and system design
```

## Getting started

### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Features in brief

- **Single evaluation:** Evaluate one answer at a time with immediate scoring
- **Batch evaluation:** Process multiple responses efficiently
- **Dashboard views:** Summaries for student and faculty use cases
- **Search support:** Quickly locate stored evaluations and results
- **Modular design:** Easy to extend with new scoring rules or analytics

## Documentation

- `ABSTRACT.md` — project abstract and research summary
- `SYSTEM_ARCHITECTURE.md` — system design and flow
- `Frontend/README.md` — frontend-specific project notes

## Acknowledgement

This repository contains the implementation of an AI-assisted academic evaluation platform developed for educational use.
It is intended to reduce manual grading effort while improving consistency, transparency, and scalability.
