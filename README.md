# API-Curated Government Grant Finder

## Purpose

This website serves as a directory of small business and nonprofit grants, primarily sourced from the Grants.gov API, with future potential to include data from state economic development portals. Its goal is to help entrepreneurs and nonprofits easily find and identify relevant funding opportunities. The site is designed to be a sticky content resource, optimized for search engine ranking and AI scraper/search parsing.

## Data Sources

*   **Primary:** [Grants.gov API](https://www.grants.gov/developers) (currently using their staging environment for development).
*   **Future/Placeholder:** State economic development portals (research conducted for California, further integration pending).

## Running the Project Locally

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended, e.g., 18.x or 20.x)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

### Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url> # Replace <repository_url> with the actual URL
    cd grant-finder
    ```

2.  **Install Dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using Yarn:
    ```bash
    yarn install
    ```

3.  **Run the Development Server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using Yarn:
    ```bash
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4.  **Build for Production:**
    Using npm:
    ```bash
    npm run build
    ```
    Or using Yarn:
    ```bash
    yarn build
    ```
    This command creates an optimized production build in the `.next` directory.

5.  **Start Production Server:**
    To run the production build locally:
    Using npm:
    ```bash
    npm run start
    ```
    Or using Yarn:
    ```bash
    yarn start
    ```

## Project Structure

A brief overview of the key directories:

*   `grant-finder/app/`: Contains the core application logic and UI, using Next.js App Router.
    *   `app/components/`: Reusable React components (e.g., GrantCard, SearchBar).
    *   `app/services/`: Modules for interacting with external APIs (e.g., `grantsGovService.ts`).
    *   `app/grants/`: Pages related to grant listings and details.
        *   `app/grants/[id]/`: Dynamic route for individual grant detail pages.
*   `grant-finder/public/`: Static assets like images.
*   `grant-finder/types/`: TypeScript type definitions (e.g., `index.ts` for `Grant` interface).
*   `grant-finder/README.md`: This file.
*   `grant-finder/next.config.mjs`: Next.js configuration.
*   `grant-finder/package.json`: Project dependencies and scripts.
*   `grant-finder/tsconfig.json`: TypeScript configuration.

## API Usage Notes

*   The application primarily consumes data from the Grants.gov API.
*   Currently, the Grants.gov **staging API** (`https://api.staging.grants.gov`) is used for development to avoid impacting production systems.
*   The `search2` and `fetchOpportunity` endpoints from Grants.gov are used and do not require an API key for basic access.

## SEO and AI Parsing

The site has been structured with SEO and AI parsing in mind:
*   Semantic HTML.
*   Dynamic and static meta tags for titles, descriptions, and OpenGraph.
*   JSON-LD structured data for grant details (`GovernmentGrant` schema).
*   Server-rendered content via Next.js App Router.
