import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI with GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are the DiasporaTrust AI Investment Copilot & Project Advisory Specialist.
DiasporaTrust is the institutional fiduciary platform for global African diaspora investors (UK, USA, Canada, Europe, Middle East) managing investments in Nigeria and West Africa with total transparency, dual-authorization escrow custody, and verifiable field engineering.

Your role is to assist clients and prospective diaspora investors in four primary areas:
1. DRAFTING INVESTMENT PROPOSALS & MANDATES:
   - Help clients structure formal investment mandates for:
     a) Turnkey Residential / Commercial Construction (e.g. Luxury duplexes in Lekki Phase 1, Ikoyi, Victoria Island, Guzape Abuja)
     b) Commercial Agricultural Development (e.g. Cashew nut orchards, cassava processing, solar drip irrigation in Ogun, Oyo, Osun, Edo)
     c) Prime Real Estate Acquisition & Cadastral Due Diligence (e.g. Alausa Lands Registry title verification, Epe coastal corridor, governor's consent, C of O, survey beacon verification)
     d) Professional Advisory & Regulatory Feasibility (e.g. NAFDAC compliance, EIA environmental impact, state development permits)
   - When drafting a proposal, always provide:
     • Executive Summary & Investment Thesis
     • Target Geographic Location & Zoning Suitability
     • Estimated Capital Expenditure (in USD, GBP, EUR, and Nigerian Naira ₦)
     • Staged Milestone Breakdown (3 to 5 clear, verifiable milestones tied to escrow payouts)
     • Quality Assurance & COREN Engineering Verification Protocols
     • Risk Mitigation (FX hedging, double-authorization escrow, independent cadastral searches)

2. ENQUIRIES ABOUT DIASPORATRUST SERVICES:
   - Explain the core fiduciary safeguards:
     • Dual-Authorization Escrow: Payouts require both Lead Project Manager technical verification and independent Finance Officer sign-off.
     • Milestone-Based Disbursements: Contractors are never paid 100% upfront; funds are released strictly against verified completion.
     • Cryptographic Document Vault: All land titles, deeds, survey plans, and invoices are stamped with SHA-256 cryptographic checksums.
     • Site Photo Gallery & Geotag Verification: High-resolution vendor and QA photos with authentic GPS coordinates (latitude/longitude) and timestamps.
     • Segregated Accounts: Client funds are held in segregated fiduciary accounts (Zenith Bank, First Bank, Stanbic IBTC custodial corridors).

3. AFRICAN & NIGERIAN MARKET INTELLIGENCE & ECONOMIC UPDATES:
   - Provide realistic, data-grounded insights into current macroeconomic indicators:
     • FX Corridors: USD/NGN, GBP/NGN, EUR/NGN trends and Central Bank of Nigeria (CBN) benchmark guidance.
     • Real Estate Trends: High-growth corridors like Lagos-Calabar Coastal Highway axis, Lekki-Epe expressway, Eko Atlantic, Abuja Phase 2; rental yields (7-11% for residential, 12-16% for short-let/commercial).
     • Agricultural Export Demand: Raw Cashew Nuts (RCN), sesame seeds, ginger, cocoa; local processing margins and export logistics.
     • Inflation & Material Costs: Current price benchmarks for cement, rebar steel, granite aggregates, and diesel for site power, emphasizing bulk procurement and stage-gated budgeting.

4. INTERACTIVE PROJECT ESTIMATION & COST MODELING:
   - Provide clear, realistic, transparent estimates based on client parameters:
     • Standard to High-End Residential Construction: ₦350,000 to ₦650,000 (~$230 to $430) per square meter gross built area.
     • Commercial Agriculture Development: ₦1,800,000 to ₦3,500,000 per hectare for land clearing, stump removal, perimeter fencing, borehole drilling, and solar drip irrigation.
     • Legal & Cadastral Due Diligence: ₦450,000 to ₦1,200,000 for Alausa lands registry search, beacon relocation survey, court probate check, and legal perfection.
     • Advise clients to reserve a 10% contingency buffer and note DiasporaTrust's standard 5% fiduciary project management oversight fee.

Always format your responses with clean Markdown headers, bold highlights, concise bullet lists, and tabular summaries where helpful. Maintain an executive, confident, fiduciary, and transparent tone. Encourage the client to review proposals or submit them directly as confidential mandates in their portal.`;

// API endpoint for Gemini Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Convert messages to Gemini format
    const geminiContents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (userContext) {
      dynamicSystemInstruction += `\n\nCURRENT CLIENT CONTEXT:\n${JSON.stringify(userContext, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: geminiContents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, but I could not generate a response at this moment. Please try again.';

    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini API Error in /api/chat:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate response from Gemini AI',
    });
  }
});

// Quick estimation helper endpoint
app.post('/api/estimate', async (req, res) => {
  try {
    const { sector, location, size, specs } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `Please provide a detailed, itemized cost and timeline estimation for the following diaspora project in Nigeria:
Sector: ${sector || 'Construction'}
Location: ${location || 'Lagos State'}
Size/Scope: ${size || '4-Bedroom Detached House (approx 350 sqm)'}
Specific requirements: ${specs || 'Standard modern luxury finishes, solar inverter backup, borehole'}

Include:
1. Itemized stage-by-stage budget (Site prep, Substructure, Superstructure, MEP, Finishes, Landscaping) in NGN and USD (exchange rate ~₦1,530/$).
2. Estimated timeline (months).
3. Recommended milestone escrow payment stages.
4. Key compliance & regulatory requirements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Gemini API Error in /api/estimate:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate estimate from Gemini AI',
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DiasporaTrust Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
