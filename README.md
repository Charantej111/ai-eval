# AI Poster Generator Evaluation Platform

A premium, state-of-the-art SaaS evaluation platform designed for blind A/B testing and performance benchmarking of AI-generated business posters. Built with **React 18**, **TypeScript**, **Vite**, **TailwindCSS**, and **Supabase (Postgres)**.

This platform empowers product managers, designers, and marketing experts to perform rigorous comparisons between state-of-the-art text-to-image models.

---

## ✨ Design & Visual Excellence (Recent Upgrades)

The platform features a modern, premium design aesthetic tailored to high-end SaaS dashboards:
- **Premium Glassmorphism:** All core panels, metrics widgets, log directories, and charts in the Admin Dashboard feature frosted-glass styling (`backdrop-filter: blur(...)`) with custom translucent borders and realistic drop shadows.
- **Animated Soft Gradient Background:** A dynamic, slow-flowing background gradient (animating between slate blue, soft violet, and warm amber tones) that brings the dashboard to life.
- **3D Glassmorphic Podium:** An interactive 3D ranking podium centerpiece showcasing the top 3 models. Logo badges use a multi-layered glass panel effect with inverted-white contrast styling for dark-gradient backgrounds.
- **Enhanced Typography & Contrast:** Standard fonts replaced with **Poppins** (for headlines) and **Nunito / Inter** (for body copy), boosting legibility and look-and-feel.
- **Custom Confetti System:** A polished particle-sprinkle confetti effect triggered dynamically upon completion of the participant portal evaluations.
- **Dynamic Image Gallery Framing:** Renders posters in portrait (`aspect-[768/1376]`) or square layouts with outline mat-board framing, eliminating empty space or broken aspect-ratio containers.

---

## 🚀 Key Modules & Features

### 1. Participant Evaluation Portal
- **Demographics Onboarding:** Captures cohort metadata (name, email, age, gender, profession) before starting.
- **Blind A/B/C Testing:** Displays generated posters side-by-side or in custom grids with randomized placements.
- **Rigorous Seven-Metric Benchmark:** Rates posters across critical business and visual axes:
  - *Prompt Adherence* (Alignment with original business prompt)
  - *Cultural Accuracy* (Visual representations suitable for regional contexts)
  - *Language Correctness* (Absence of typo artifacts)
  - *Text Readability* (Contrast and typography legibility)
  - *Visual Appeal* (Overall composition)
  - *Business Usability* (Commercial readiness for marketing campaigns)
  - *Overall Preference* (Subjective expert preference score)

### 2. High-Performance Admin Analytics Dashboard
- **Model Display Name Standardization:**
  - **Model A:** `OpenAI — GPT Image 1` (Short: `GPT Image 1`)
  - **Model B:** `Google — Gemini 2.5 Flash Image` (Short: `Gemini 2.5`)
  - **Model C:** `Google — Gemini 3.1 Flash Image Preview` (Short: `Gemini 3.1 Flash Image`)
- **Performance Breakdown List:** Real-time summary of overall average score, strongest metric, and weakest metric per model.
- **Analytics Charts:**
  - *Performance by Prompt:* Recharts bar chart tracking average model scores across all 6 evaluated prompts.
  - *Criteria Radar:* Recharts radar chart mapping model scores across all seven quality dimensions.
- **Regional Language Matrix:** Breakdowns by regional languages (Telugu, Tamil, Hindi, Marathi, Malayalam).
- **Metric Matrix Grid:** Full comparative database matrix mapping exact dimensions against each model.
- **Evaluation Prompts Gallery:** Dedicated section displaying the exact system prompts, titles, and regional variants used during evaluations.
- **Rating Logs Auditor:** Full search, filter, and audit control panel for responses.
- **Cohort Directory:** Directory monitoring participant completion statuses.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 & TypeScript (Vite-powered environment)
- **Styling & Animations:** TailwindCSS, Custom HSL themes (`src/theme.css`), and Framer Motion
- **Data Visualization:** Recharts (Responsive radar & bar charts)
- **Database / Backend:** Supabase (PostgreSQL with real-time replication client)
- **Icons:** Lucide React

---

## 📁 Repository Structure

```text
├── src/
│   ├── components/            # Reusable UI components
│   │   └── ImageWithFallback.tsx  # Dynamic poster renderer with loading states
│   ├── data/
│   │   └── prompts.ts         # Predefined prompts, metrics definitions, and model list
│   ├── lib/
│   │   └── supabase.ts        # Supabase client connection setup
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx # Core analytics views, tables, charts, and log filter panels
│   │   ├── AdminLoginPage.tsx     # Admin login screen with secure password validation
│   │   ├── EvaluatePage.tsx       # Participant rating interface with dynamic framing
│   │   ├── InstructionsPage.tsx   # Pre-evaluation walkthrough for participant training
│   │   ├── LandingPage.tsx        # Entry page with participant portal login & Admin Dashboard link
│   │   ├── RegisterPage.tsx       # Demographic onboarding registry
│   │   └── ThankYouPage.tsx       # Dynamic completion screen with confetti sprinkles
│   ├── App.tsx                # Main router and page coordinator
│   ├── theme.css              # Custom HSL variables, animated gradient background, and glassmorphic styles
│   └── main.tsx               # Client entry point
├── public/
│   └── images/                # Static brand assets and SVG model logos
├── vite.config.ts             # Vite server & bundler configuration
└── package.json               # Package dependencies & scripts
```

---

## 📊 Database Schema

The backend uses a Supabase Postgres instance structured around two main tables:

### 1. `participants` Table
Stores demographics and tracking metrics for unique evaluation cohorts:
- `id` (UUID, Primary Key)
- `name` (text)
- `email` (text)
- `age` (integer)
- `gender` (text)
- `profession` (text)
- `created_at` (timestamptz)

### 2. `responses` Table
Stores individual metrics ratings logged by participants:
- `id` (bigint, Primary Key)
- `participant_id` (UUID, Foreign Key → `participants.id`)
- `prompt_number` (integer)
- `displayed_position` (integer)
- `actual_model` (text)
- `metric_name` (text)
- `rating` (integer)
- `created_at` (timestamptz)

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_PASSWORD=joshtalks
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or the displayed Vite port) in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled static assets will output to the `dist/` directory.

---

## 🔐 Credentials
- **Admin Password:** `joshtalks` (editable via `VITE_ADMIN_PASSWORD` in `.env.local`)
