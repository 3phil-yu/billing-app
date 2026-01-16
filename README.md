# Intelligent Billing App

A modern, AI-powered billing and customer management application built with React, TypeScript, and Vite.

## Features

- **📊 Sales Dashboard**: Real-time overview of your sales, orders, and customer growth.
- **🧾 Smart Billing**: 
  - **OCR Integration**: Upload order images and let Gemini AI automatically extract items and prices.
  - **Manual Entry**: Quick and easy manual order creation.
  - **Receipt Printing**: Print thermal-style receipts for confirmed orders.
- **👥 Customer Management**: CRM-lite features to track customer spending and history.
- **🧠 Intelligent Analysis**: Ask questions about your business data and get AI-powered insights.
- **⚙️ Configurable**: Manage your API keys and data preferences easily.
- **💾 Local Persistence**: All data is saved locally in your browser, so you never lose your work.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository (if applicable) or download the source.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

## Configuration (Gemini API Key)

To use the AI features (OCR for billing and Intelligent Analysis), you need a Google Gemini API Key.

1. **Get an API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Create a new API key.
2. **Configure usage in the App**:
   - Open the app in your browser.
   - Click on **Settings** in the sidebar.
   - Paste your key into the **Google Gemini API Key** field.
   - Click **Save**.

## Usage Guide

### Creating an Order
1. Go to the **Billing** page.
2. **Option A (AI)**: Click the upload box to select an order image. The app will extract details automatically.
3. **Option B (Manual)**: Click "Add Item" to manually enter product details.
4. Review the items and click **Confirm Order**.
5. You can then **Print Receipt** or start a new order.

### Analyzing Sales
1. Ensure your Gemini API Key is configured.
2. Go to the **Analysis** page.
3. Type a question like "Which customers spent the most?" or "Predict sales for next week".
4. View the AI-generated insights.

## Troubleshooting

- **OCR not working?** Check if your API Key is valid and has "Generative Language API" enabled.
- **Data missing?** Data is stored in your browser's LocalStorage. Clearing your browser cache will remove all app data.
