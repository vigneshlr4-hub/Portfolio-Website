# 💼 PortfolioBuilder — Advanced Edition (Phase 5)

A modern **Portfolio Builder Web App** built using **HTML, CSS, and JavaScript**.  
It allows users to create, preview, and export professional portfolio websites — all from a single dashboard interface.

---

## 🚀 Features

### 🔐 Authentication
- Full **Sign Up / Login** flow (frontend-only, powered by `localStorage`)
- Auto-login on page reload
- Logout and data clearing options

### 🧱 Dashboard
- Clean **dashboard layout** with navigation sidebar and panels:
  - **Builder:** Add personal info, avatar, bio, projects, and skills
  - **Templates:** Choose from multiple portfolio designs
  - **Preview:** See a live preview of your selected template
  - **Settings:** Manage or clear local data

### 🎨 Portfolio Builder
- Add and manage **personal info**, **projects**, and **skills**
- Upload project images and reorder or delete projects
- Instant live preview updates as you type
- Supports **three portfolio templates:**
  - **Modern** — clean, professional style
  - **Creative** — artistic gradient-based design
  - **Photography** — image-focused layout

### 💾 Data & Export
- All data stored in `localStorage` (auto-saves)
- **Export HTML** — download your complete static portfolio
- **Open Full Preview** — opens a standalone version in a new tab

### ⚙️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Storage:** Browser LocalStorage
- **Styling:** Modern gradients, responsive design
- **Icons:** [Font Awesome](https://fontawesome.com/)

---

## 🧩 Folder Structure

PortfolioBuilder/
│
├── index.html # Main HTML file (Login + Dashboard + Templates)
├── styles.css # Styling and layout for the app
├── app.js # Core logic for authentication, builder, and preview
└── README.md # Documentation

---

## 🧠 How It Works

1. **Login / Sign Up**  
   - User info is stored locally in the browser.
2. **Dashboard Access**  
   - Add your bio, projects, and skills from the Builder tab.
3. **Choose a Template**  
   - Switch between Modern, Creative, or Photography templates.
4. **Live Preview**  
   - Instantly see changes in the preview panel.
5. **Export / Preview**  
   - Download your portfolio as HTML or open it in a new tab.

---

## 🧰 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/PortfolioBuilder.git
   cd PortfolioBuilder
