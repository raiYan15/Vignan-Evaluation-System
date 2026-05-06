# Vignan Evaluation System

![Vignan Evaluation System](Frontend/Images/image.png)

**AI-powered internal assessment platform for faster, fairer, and scalable evaluation of descriptive answers.**

## Overview

Vignan Evaluation System is a full-stack academic evaluation platform designed to automate the scoring of descriptive student answers.
It combines a modern React + TypeScript frontend with a FastAPI backend and MongoDB storage to support secure user management,
single/batch evaluation, analytics, and searchable result history.

## Project gallery

### `image.png` — Landing / splash screen

The main hero section that introduces Vignan Evaluation System with a strong call to action and the evaluator feature card.

![Landing screen](Frontend/Images/image.png)

### `image (1).png` — Sign in screen

The login page with a simple sign-in form and welcome panel for returning users.

![Sign in screen](Frontend/Images/image%20%281%29.png)

### `image (2).png` — Sign up screen

The registration page for creating student or faculty accounts.

![Sign up screen](Frontend/Images/image%20%282%29.png)

### `image (5).png` — Campus showcase screen

The branding and showcase layout featuring the university identity and project presentation.

![Campus showcase](Frontend/Images/image%20%285%29.png)

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
