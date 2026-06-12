# 🦎 Chameleon | AI-Powered On-Chain Forensic Terminal for Mantle

Chameleon is an advanced, high-fidelity AI-powered cognitive terminal and forensic monitoring engine designed specifically for the **Mantle Network L2 ecosystem**. It intercepts real-time blockchain telemetry, decodes complex wallet actions into behavioral DNA archetypes, monitors system-wide liquidity anomalies, and reports findings directly on-chain.

By pairing ultra-fast **JSON-RPC block telemetry**, **D3.js mathematical capital modeling**, and state-of-the-art **AI reasoning models** (powered by Groq & Gemini), Chameleon exposes the hidden patterns of sophisticated market actors—such as high-frequency MEV sandwich bots, liquidity snipers, dormant whales, and multichain capital pool allocators—before the chart reacts.

---

## 🗺️ System Architecture

Chameleon is architected as a full-stack, real-time on-chain data processor and automated oracle. 

```
                                  +-----------------------+
                                  |  Mantle Network RPC   |
                                  | (Native Blocks/ERC20) |
                                  +-----------+-----------+
                                              |
                                              v [Live Block Sync]
                                  +-----------------------+
                                  | Chameleon Data Engine |
                                  |  (Z-Score Analytics)  |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     | [Market & Wallet State]                         | [Ecosystem Capital Flows]
                     v                                                 v
         +-----------------------+                         +-----------------------+
         |   Groq / Qwen / AI    |                         |  D3.js Visualization  |
         | Cognitive Synthesis  |                         |  (Sankey & Network)   |
         +-----------+-----------+                         +-----------------------+
                     |
                     v [Forensic AI Report & Content Hash]
         +-----------------------+
         |  Chameleon Operator   |
         |    (Ethers Signer)    |
         +-----------+-----------+
                     |
                     v [Gas-Optimized Transaction]
         +-------------------------------------------------------------+
         |  ChameleonAI Reporter Smart Contract (0xE495...fD0 on L2)   |
         +-------------------------------------------------------------+
```

### 1. The Block Ingestion Pipeline
* **Telemetry Synchronizer:** Directly monitors Mantle L2 via Ethers.js JSON-RPC connections (`https://rpc.mantle.xyz`). It captures transaction block heights, gas limits, pool-sweeping activities, and bridge transfers.
* **Intelligent Sort & Filter:** The telemetry pipeline applies standard deviation filtering (Z-scores) to distinguish everyday retail transactions from institutional capital flow, multi-sig bridges, and LP pool ingress signatures.

### 2. The Cognitive Analysis Model (AI Core)
* **Groq API & Qwen-32B Engine:** Integrates high-performance low-latency reasoning to evaluate market structure, wallet behavior records, and recent smart money movements on-chain.
* **Deterministic Report Generation:** The AI models output extremely structured, concise JSON reports containing sentiments, conviction metrics, and behavior commentary.

### 3. The On-Chain Reporter System
* **Automated Oracles:** High-conviction intelligence is submitted back to the blockchain. Chameleon operates an agent wallet containing the `AI_OPERATOR_ROLE` that writes cryptographically computed forensics profiles directly into the immutable state of the `ChameleonAI` contract.
* **Data Anchoring:** To prevent high gas costs, large report payloads are cataloged by content hashes (computed via Keccak-256) and verified on-chain, while short-form categorical statuses (like archetype, severity, and conviction score) are written to direct fields for smart contracts to consume programmatically.

---

## 🏛️ Deployed Smart Contract

The core reporting engine interacts on-chain with the **ChameleonAI** smart contract on the **Mantle Network Mainnet**.

* **Contract Address:** `0xE495f3dD4d7DC3A7D980421569b4775458F4CfD0`
* **Network Name:** Mantle Network Mainnet (Chain ID: `5000`)
* **RPC Endpoint:** `https://rpc.mantle.xyz`
* **Explorer URL:** [Mantle Explorer](https://explorer.mantle.xyz/address/0xE495f3dD4d7DC3A7D980421569b4775458F4CfD0)

### Smart Contract ABI Functions & Integration
The compiler maps all forensic outcomes using standard Ethereum-compatible method signatures in the operator layer:

```solidity
// 1. Logs trading signals identified across target nodes
function storeSignal(
    address wallet, 
    string calldata signalType, 
    uint8 confidence, 
    string calldata explanation, 
    bytes32 contentHash
) external;

// 2. Classifies and updates a wallet's behavioral archetype
function storeWalletDNA(
    address wallet, 
    string calldata archetype, 
    uint8 convictionScore, 
    string calldata favoriteSectors, 
    bytes32 contentHash
) external;

// 3. Flags wide ecosystem trends and capital sizing details
function storeNarrative(
    string calldata narrative, 
    uint8 confidence, 
    uint256 capitalFlowSize, 
    bytes32 contentHash
) external;

// 4. Stores general network vitality, gas, and liquidity parameters
function storeHealthScore(
    uint8 overallScore, 
    uint8 liquidity, 
    uint8 whaleConfidence, 
    uint8 risk, 
    string calldata summary, 
    bytes32 contentHash
) external;

// 5. Registers severe pool rebalancings or MEV bot footprints
function storeAnomaly(
    address wallet, 
    string calldata anomalyType, 
    uint8 severity, 
    string calldata description, 
    bytes32 contentHash
) external;
```

#### Verification Events
```solidity
// Dispatched on-chain if oracles fail to retrieve stable coin quotes during transaction indexing
event PriceFetchFailed(uint256 timestamp);
```

---

## ✨ Features Highlight

### 🔍 Intelligent Anomaly Radar
Monitors raw gas spikes, rapid transaction loops, and pool limit sweeps. Addresses are ranked continuously with anomaly triggers visible directly on the Live Terminal.

### 🧬 Cognitive Wallet DNA Compiling
Categorizes Mantle addresses based on holding actions and contract activities into known crypto personas:
* **Ape Sniper (Core):** Fresh liquidity sweeps within seconds of pool creation.
* **mETH Whale / Treasury Staker:** Massive assets locked deep in multi-sig staking and liquidity hub allocations.
* **MEV Sandwich Bot:** Concentrated high-frequency frontrunner loops using heavy gas parameters.

### 🌊 High-Fidelity D3 Capital Flow Map
Uncovers where Mantle's deep liquidity is flowing. Utilizes interactive Sankey charts and canvas node mapping to visualize direct bridges between Ethereum mainnet hubs and prominent Mantle DEX structures (such as Agni Finance & Merchant Moe).

---

## 🛠️ Local Development & Setup Instructions

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **Mantle RPC Credentials:** (Defaults to Mantle's public node but customizable)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/chameleon.git
cd chameleon
```

### 2. Configure Environment Variables
Create a `.env.local` file (or copy from the `.env.example` file) and provide the physical API keys required to unlock the AI and indexers:

```bash
# Groq keys for AI logic (using openai provider routing)
GROQ_API_KEY="your_groq_api_key_here"

# Etherscan/MantleScan explorer tracking keys (Optional but bypasses rate limits)
MANTLESCAN_API_KEY="your_mantlescan_key_here"
ETHERSCAN_API_KEY="your_etherscan_key_here"

# Public node RPC (customizable)
MANTLE_RPC_URL="https://rpc.mantle.xyz"

# Smart Contract Addresses
CHAMELEON_CONTRACT_ADDRESS="0xE495f3dD4d7DC3A7D980421569b4775458F4CfD0"

# Operator Private Key (Required for writing reports on-chain)
CHAMELEON_OPERATOR_PRIVATE_KEY="your_operator_wallet_private_key"

# Vercel / Live Local App URL redirection matching
APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Direct Start Dev Server
Spin up the hot-reload Dev server configured to expose the applet port:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the terminal UI.

### 5. Production Build
Verify standard production bundling scripts execute cleanly:
```bash
npm run build
npm run start
```

---

## 📂 Repository Directory Layout

* `src/app/` — Next.js 15 routing folder structure (Pages: landing, dashboard radar, DNA analyzer, replay engine, stats).
* `src/app/api/` — Server-side proxy endpoints protecting Groq keys and querying multichain public JSON-RPC providers.
* `src/components/` — High-fidelity responsive components including D3-powered capital modeling layouts (`MantleCapitalFlowMap.tsx`).
* `src/lib/chameleon/` — Standard Ethereum operator instance class routines (`operator.ts`), anomaly evaluators and ledger calculators.
* `src/types.ts` — Rigid TypeScript interfaces indexing signals, blocks, sentiment, and smart money stages.

---

## 📄 License & Status

This project is licensed under the Apache 2.0 License. See the `LICENSE` (or `src/types.ts` headers) for more details.

**Operational Status:** 🟢 Functional and configured for Mantle Mainnet Block tracking. All systems running.
