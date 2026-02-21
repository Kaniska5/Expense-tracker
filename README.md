# Expense Tracker

A privacy-focused personal finance web application built using React 18 and TypeScript.  
The application enables users to track expenses, manage budgets, monitor savings goals, and analyze spending patterns through an intuitive and responsive interface.

All data is stored locally in the browser using localStorage. No backend services or external APIs are used.

---

## Key Features

- Add, edit, and delete categorized expenses
- Dashboard with real-time balance and monthly insights
- Category-based analytics and visual charts
- Budget limits with usage tracking and alerts
- Savings goals with progress monitoring
- Protected routes with local authentication
- Fully offline-capable

---

## Tech Stack

- React 18
- TypeScript
- Zustand (State Management)
- React Router v6
- Recharts
- Tailwind CSS
- Vite
- localStorage (Client-side persistence)

---

## Architecture Highlights

- Modular and scalable folder structure
- Centralized global state using Zustand
- Strict TypeScript interfaces for data consistency
- Protected routing for authenticated access
- Separation of business logic and UI components
- Persistent state synchronization with localStorage

---

## Getting Started
git clone <repository-url>
cd expense-tracker
npm install
npm run dev


Runs on: http://localhost:5173

---

## What This Project Demonstrates

- Building a complete real-world React + TypeScript application
- Designing scalable frontend architecture
- Managing global state effectively
- Implementing data persistence without a backend
- Structuring maintainable and production-ready code