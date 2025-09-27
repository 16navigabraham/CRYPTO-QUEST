# CryptoQuest

**Master Web3 Development, One Quest at a Time.**

CryptoQuest is a gamified learning platform designed to make mastering complex blockchain concepts fun and interactive. Users can take quizzes across various difficulty levels, earn points, and claim on-chain rewards for their knowledge.

## Key Features

- **Gamified Quizzes:** Interactive quizzes on topics like Blockchain, DeFi, Solidity, and more.
- **Progressive Difficulty:** Five levels of challenge, from **Beginner** to **Master**, that grow with your skills.
- **On-Chain Rewards:** Successfully pass quizzes to earn points and claim real ERC20 token rewards on the Base network.
- **AI-Powered Learning:**
  - Get AI-generated **hints** for tough questions.
  - Listen to questions with **text-to-speech** functionality.
- **User Authentication:** Simple and secure login using email, powered by [Privy](https://privy.io/).
- **Integrated Wallet:** View token balances, see USD value with live price feeds, and send tokens directly from the app.
- **Leaderboard:** Compete with other developers and see who ranks highest on the leaderboard.
- **Customizable Profiles:** Set a username and upload a profile picture stored on IPFS.
- **Whitelist System:** Contract-level whitelist functionality to control who can claim rewards.
- **Responsive Design:** A clean, modern UI that works seamlessly on desktop and mobile, built with ShadCN UI and Tailwind CSS.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Authentication:** [Privy](https://www.privy.io/)
- **AI / Generative:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Blockchain Interaction:** [Viem](https://viem.sh/)
- **Smart Contract:** [Solidity](https://soliditylang.org/) on the [Base](https://www.base.org/) network
- **Decentralized Storage:** [IPFS](https://ipfs.tech/) via [Pinata](https://www.pinata.cloud/) for user avatars
- **API Backend:** Hosted service for user data and scoring (e.g., on Render).

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Environment Variables

Create a `.env` file in the root of the project and add the following environment variables:

```bash
# Privy App ID (from privy.io)
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"

# Pinata JWT for IPFS uploads
PINATA_JWT_KEY="your-pinata-jwt-key"

# Google AI API Key for Genkit
GEMINI_API_KEY="your-gemini-api-key"

# The public URL of your deployed application (for SEO/embeds)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd <project-directory>
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Genkit Flows (for AI services)

To run the Genkit AI flows locally for development and testing, use the following command in a separate terminal:

```bash
npm run genkit:watch
```
