# Expense Tracker – Personal Finance Web Application

This is a personal expense tracking web application developed to help users monitor and understand their spending in a simple, calm, and user-friendly way. The project focuses on clean design, practical functionality, and a privacy-first approach, with all data stored locally in the browser.

The application is fully offline-capable and does not rely on any backend or external services.

---

## Project Overview

The purpose of this project was to design and implement a complete frontend application using modern web technologies, while maintaining a strong focus on usability, accessibility, and maintainable code structure.

Key goals of the project:
- Build a real-world React application from scratch
- Apply TypeScript for type safety and scalability
- Design a responsive and intuitive user interface
- Implement state management and data persistence
- Ensure privacy by keeping all user data local

---

## Features

### Dashboard
- Overview of total balance, monthly expenses, and savings
- Category-wise and daily expense visualizations
- Month-over-month expense comparison
- Context-aware greeting based on time of day

### Expense Management
- Add new expenses with category, date, and payment method
- Optional notes and tags for better tracking
- Edit and delete existing expenses
- Chronological transaction history

### Analytics
- Category-based spending analysis
- Monthly comparison of expenses
- Average daily spending calculation
- Identification of highest spending days

### Budgets
- Monthly budget limits per category
- Visual indicators for budget usage
- Alerts when approaching or exceeding limits

### Goals
- Custom savings goals with target amount and deadline
- Progress tracking over time
- Milestone-based progress feedback

### Reports
- Monthly and category-wise summaries
- Data export in CSV format
- Printable report layout

### Settings
- Theme selection (Light, Dark, Pastel)
- Currency customization
- Category management
- Data export and reset options

### Authentication
- Local email and password authentication
- User data stored securely in browser storage
- No internet connection required

---

## Design Considerations

- Minimal and calm visual design
- Soft color palette with consistent spacing
- Responsive layout for desktop and mobile devices
- Clear visual hierarchy and readable typography
- Supportive, non-judgmental user messaging

---

## Technology Stack

- Frontend: React 18 with TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Charts and Visualization: Recharts
- Routing: React Router v6
- Build Tool: Vite
- Icons: Lucide React
- Data Storage: Browser localStorage

---

## Project Structure

```
expense-tracker/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js version 18 or above
- npm

### Installation and Setup

```bash
git clone <repository-url>
cd expense-tracker
npm install
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist` directory.

---

## Privacy and Data Handling

- All user data is stored locally in the browser
- No backend services or databases are used
- No data is transmitted to external servers
- The application works fully offline

---

## Key Learnings

- Building a complete React application with TypeScript
- Structuring scalable frontend projects
- Managing global state using Zustand
- Implementing responsive and accessible UI components
- Applying best practices for clean and maintainable code
- Designing user-centric interfaces with a focus on usability


