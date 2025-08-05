# 🏛️ Government Grant Finder

![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)

> A project by **Devon** - [Portfolio](https://devonhills.dev) | [LinkedIn](https://linkedin.com/in/devonjhills)

## 📖 Overview

The Government Grant Finder is a full-stack web application I built to demonstrate my skills in modern front-end development, API integration, and building performant user interfaces. This project consumes the official Grants.gov API to provide a clean, fast, and responsive platform for discovering federal funding opportunities.

The primary goal was to engineer a superior user experience compared to existing government portals, focusing on speed, advanced filtering capabilities, and a mobile-first design. This project showcases my ability to work with modern web technologies like Next.js 14, TypeScript, and Tailwind CSS to deliver a production-quality application.

## ✨ Core Features & Technical Highlights

This section details the technical solutions I implemented to build the application's core features.

### 🔍 Advanced Search & Filtering
*   **Problem:** The official Grants.gov search can be slow and cumbersome.
*   **My Solution:** I implemented a real-time search experience by creating an internal API route (`/api/grants/search`) that acts as a proxy to the Grants.gov API. This allowed me to:
    *   **Implement Debounced Search:** To prevent excessive API calls and provide a smoother user experience as the user types.
    *   **Build Complex Filtering Logic:** I designed and implemented the logic for filtering grants by status, funding amount ranges, and posting dates on the server-side to ensure performance.
    *   **Create a Dynamic UI:** The interface, built with React and `shadcn/ui`, updates instantly without page reloads, providing a modern user experience.

### ⚡ Performance & Optimization
*   **Problem:** How to deliver data-heavy search results quickly and efficiently?
*   **My Solution:** I leveraged the power of **Next.js 14** with a focus on a server-first approach:
    *   **React Server Components (RSCs):** The initial data fetching and rendering happens on the server, sending a fully-formed HTML page to the client for a fast First Contentful Paint (FCP).
    *   **Static Generation for the App Shell:** The application shell is statically generated for optimal performance, while dynamic data is fetched on demand.
    *   **Minimal Client-Side JavaScript:** Interactive elements (`'use client'`) are hydrated on the client-side only where necessary, minimizing the JavaScript bundle size and improving load times.

### 🏗️ Modern Architecture & Scalability
*   **Problem:** How to structure the application for maintainability and future growth?
*   **My Solution:** I designed a clean, modular architecture focused on separation of concerns:
    *   **API Abstraction:** All external API logic is encapsulated within a dedicated `grantsGovService.ts` service. This makes the application easier to test and allows for swapping out the data source in the future without refactoring the UI.
    *   **Component-Based Design:** I utilized `shadcn/ui` and Radix UI primitives to build a reusable and accessible component library, ensuring a consistent and professional look and feel.
    *   **End-to-End Type Safety:** **TypeScript** is used throughout the project—from API data contracts to component props—to catch errors during development and improve code quality and maintainability.

## 🛠️ Tech Stack

I chose this stack to build a modern, performant, and developer-friendly application.

| Category | Technology | Why I chose it |
|---|---|---|
| **Framework** | **[Next.js 14](https://nextjs.org/)** | For its App Router, React Server Components, and built-in performance optimizations, which are ideal for a data-driven application. |
| **Language** | **[TypeScript](https://www.typescriptlang.org/)** | To ensure type safety, reduce runtime errors, and improve the overall developer experience and code maintainability. |
| **UI Library** | **[React 18](https://reactjs.org/)** | The industry standard for building dynamic and interactive user interfaces with a vast ecosystem. |
| **Styling** | **[Tailwind CSS](https://tailwindcss.com/)** | For rapid, utility-first styling and building a responsive, mobile-first design system from the ground up. |
| **Component Library**| **[shadcn/ui](https://ui.shadcn.com/)** & **[Radix UI](https://www.radix-ui.com/)** | For a set of beautifully designed, accessible, and unstyled components that are easy to customize and extend. |
| **API Integration** | **Internal API Routes** | To securely manage communication with the external Grants.gov API and prevent direct client-side exposure. |
| **Security** | **[sanitize-html](https://www.npmjs.com/package/sanitize-html)** | To prevent XSS attacks by sanitizing any HTML content returned from the external API before rendering it in the browser. |
| **Linting & Formatting** | **ESLint** & **Prettier** | To maintain consistent code quality and style across the project, making it easier to read and maintain. |

## 🚧 Challenges & Solutions

*   **Challenge 1: Handling Inconsistent API Responses**
    *   **Problem:** The Grants.gov API sometimes returns data in unexpected formats or with missing fields, which could crash the application.
    *   **Solution:** I implemented a robust data validation and transformation layer within the `grantsGovService.ts`. I defined strict TypeScript interfaces for the expected data (`Grant` type) and wrote functions to safely parse and map the incoming API data, providing default values for missing fields. This ensures the front-end components always receive a predictable data structure.

*   **Challenge 2: Securing API Communication**
    *   **Problem:** Directly calling an external API from the client can expose potential vulnerabilities and make it difficult to manage rate limiting.
    *   **Solution:** I used the **API Proxy Pattern**. All requests to the Grants.gov API are routed through my Next.js backend (`/api/grants/*`). This approach provides a layer of security, allows for server-side caching in the future, and prevents hitting API rate limits from individual clients.

## 🚀 Getting Started

### Prerequisites
- Node.js v18.0 or higher
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/government-grant-finder.git
    cd government-grant-finder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run start
```

## 📈 Future Enhancements

This project serves as a strong foundation. Here are a few features I'm considering for future iterations:
*   **User Accounts & Saved Searches:** Allow users to create accounts to save their favorite grants or search queries.
*   **Automated Testing:** Implement unit and integration tests with Jest and React Testing Library to ensure long-term reliability.
*   **Database Integration:** Add a database like PostgreSQL or a serverless option like Supabase to store user data and cache API responses for even better performance.
