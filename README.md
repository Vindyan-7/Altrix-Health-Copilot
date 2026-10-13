# Altrix Health Copilot

### AI-Powered Personal Health Assistant

**Understand your health information. Organize your medical records. Make more informed conversations with your doctor possible.**

[**Live Demo**](https://altrix-health-copilot-v.vercel.app/) · [**GitHub Repository**](https://github.com/Vindyan-7/Altrix-Health-Copilot)

---

## About the Project

Altrix Health Copilot is an AI-powered personal health platform designed to make medical information easier to access, organize, and understand.

Medical reports, prescriptions, diagnostic results, and discharge summaries can be difficult to interpret and manage. Altrix brings personal health information together in a unified digital workspace, combining guided health education with medical record management and a user-friendly dashboard.

The project focuses on **accessibility, responsible AI, privacy-conscious design, and safer health-information experiences**.

Altrix is intended to support health education and help users understand medical terminology. It does not replace a qualified healthcare professional or provide a clinical diagnosis.

## The Problem

People often struggle to:

- Understand medical terminology in laboratory reports and prescriptions.
- Keep medical documents organized across different visits and healthcare providers.
- Review health information over time.
- Find understandable explanations of general health topics.
- Identify when a health concern requires professional medical attention.

## Our Solution

Altrix Health Copilot aims to address these challenges through a single, accessible platform that combines guided health conversations, medical document management, report review, and a personal health timeline.

## Key Features

### 1. Personal Health Dashboard
- Centralized workspace for health information.
- Overview cards and recent health records.
- Quick access to core health-management features.
- Responsive interface for different screen sizes.

### 2. Guided Health Copilot
- Conversational interface for general health education.
- Support for guided health-information scenarios.
- Loading animations and progressively displayed responses.
- Safety-conscious handling of urgent health concerns.
- Boundaries around diagnosis and medication-dosage requests.

### 3. Medical Records Management
- Medical document upload interface.
- Support for PDF, JPEG, and PNG files in the implemented upload workflow.
- Private storage architecture designed around authenticated access.
- Record-status indicators to distinguish pending processing from completed review.

### 4. Report Review
- Dedicated interface for reviewing medical reports.
- Structured presentation of health-record information.
- Designed to support future integration with OCR and document extraction.

### 5. Health Timeline
- Dedicated interface for organizing health information chronologically.
- Designed to help users navigate records and health events over time.

### 6. Account and Profile
- Authentication interface for signing in and registering.
- Personal profile and preferred-language settings.
- Authenticated workspace navigation.

### 7. Privacy and Responsible AI
- Private-document storage design using Supabase.
- Authentication-aware access patterns.
- No intentional presentation of unverified OCR results as confirmed medical facts.
- Health education rather than clinical diagnosis or treatment.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend framework | Astro |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Authentication and backend services | Supabase |
| AI integration configuration | Gemini API |
| Testing | Vitest |
| Type checking | TypeScript |
| Build | Astro |
| Deployment | Vercel |

## Application Pages

| Route | Purpose |
|---|---|
| `/` | Public landing page |
| `/auth` | Sign-in and registration |
| `/dashboard` | Personal health dashboard |
| `/copilot` | Guided Health Copilot |
| `/records` | Medical records |
| `/review` | Report review |
| `/timeline` | Health timeline |

Access to private pages and individual features depends on authentication, environment configuration, and backend setup.

## Architecture Overview

```text
User
  |
  v
Altrix Health Copilot Web Application
  |
  +-- Public Landing Page
  |
  +-- Authentication and Profile
  |
  +-- Personal Health Dashboard
  |     |
  |     +-- Medical Records
  |     +-- Report Review
  |     +-- Health Timeline
  |
  +-- Guided Health Copilot
  |     |
  |     +-- Health Education
  |     +-- Safety Handling
  |
  +-- Supabase Integration
  |     |
  |     +-- Authentication
  |     +-- Private Document Storage
  |     +-- Health Record Metadata
  |
  +-- AI Provider Integration
        |
        +-- Configurable AI Services
```

*The architecture illustrates the intended system organization. The availability of each backend and AI integration depends on its configuration and implementation status.*

## Current Implementation Status

Altrix is an actively developed prototype. The following distinctions are important when evaluating the current implementation.

| Component | Status |
|---|---|
| Public landing page and core UI | Implemented |
| Authentication and profile interfaces | Implemented; backend configuration required |
| Dashboard, records, review, and timeline interfaces | Implemented |
| Guided Health Copilot interface | Implemented |
| Document upload workflow | Implemented in code; requires configured Supabase storage and policies |
| Complete OCR and medical-data extraction pipeline | Not yet integrated |
| Automatic extraction of report values | Not yet available as a completed end-to-end feature |
| Production AI responses | Depend on provider configuration and successful integration |
| Hospital discovery and appointment booking | Future/prototype scope |

**Important:** A document appearing in the records area does not mean that its medical contents have been extracted or clinically verified. Pending documents must remain clearly identified as pending review.

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- A Supabase project for authentication and document-storage functionality
- AI provider credentials if enabling the corresponding live AI integration

### 1. Clone the repository

```bash
git clone https://github.com/Vindyan-7/Altrix-Health-Copilot.git
cd Altrix-Health-Copilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file using the environment-variable names expected by the application.

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
```

Use the correct values from your own provider dashboards. Never commit API keys, passwords, service-role keys, or other secrets to GitHub.

Variables prefixed with `PUBLIC_` must contain only values intended to be exposed to the browser. Keep private credentials server-side.

### 4. Configure Supabase

Review and manually execute the applicable SQL scripts in `supabase/sql/` using the Supabase SQL Editor.

Relevant setup scripts include:

- `02_rls_and_storage_policies.sql` — document-storage bucket and access policies.
- `04_add_full_name_to_profiles.sql` — profile full-name support and related database setup.

Review the scripts and confirm that their assumptions match your Supabase project before execution.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL printed by Astro in your terminal.

### 6. Run quality checks

```bash
npm test
npm run typecheck
npm run build
```

These commands run the project's tests, TypeScript checks, and production build, respectively, when the corresponding scripts are configured in `package.json`.

## Privacy and Security

Health information is sensitive. Altrix is designed with privacy-conscious document handling and access controls in mind.

- Use synthetic or anonymized information when evaluating the prototype.
- Keep API credentials and private environment variables out of source control.
- Configure Supabase Row Level Security and storage policies before using private records.
- Verify authenticated access and document ownership before deploying to real users.
- Do not treat AI-generated explanations or extracted document values as clinically verified information.

The current prototype should not be considered a certified medical device or a clinically validated diagnostic system. Production use with real patient information requires further security, privacy, clinical-safety, and regulatory review.

## Future Scope

Planned areas of development include:

- OCR-based medical document extraction.
- Structured extraction and review of laboratory values and prescriptions.
- Improved health-history organization.
- Expanded English and Telugu experiences.
- Context-aware health education with stronger source grounding.
- Hospital discovery and appointment-booking integrations.
- Additional privacy, auditability, and security controls.

These are development goals and should not be interpreted as completed capabilities.

## Contributing

Contributions, feedback, and ideas are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes and add relevant tests.
4. Run the project's quality checks.
5. Open a pull request describing the change.

Please do not include real patient information, private credentials, or confidential medical documents in issues, commits, or pull requests.

## Disclaimer

Altrix Health Copilot is a health-information and educational prototype. It does not replace a doctor, pharmacist, emergency service, or other qualified healthcare professional. It must not be relied upon to diagnose conditions, prescribe medication, or determine treatment. For urgent symptoms or medical emergencies, seek appropriate professional or emergency assistance.

## Project Information

**Project:** Altrix Health Copilot  
**Organization:** Altrix Labs  
**Category:** HealthTech · AI · Personal Health Information Management  
**Live Demo:** https://altrix-health-copilot-v.vercel.app/  
**Repository:** https://github.com/Vindyan-7/Altrix-Health-Copilot

---

*Built to make personal health information more understandable, organized, and accessible.*
