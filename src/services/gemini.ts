import { GoogleGenerativeAI } from "@google/generative-ai";

// Ideally, this should be in an environment variable
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeImage(imageFile: File, apiKey: string): Promise<string> {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const reader = new FileReader();
        const imagePromise = new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const base64Data = reader.result.split(',')[1];
                    resolve({
                        inlineData: {
                            data: base64Data,
                            mimeType: imageFile.type,
                        },
                    });
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        const imagePart = await imagePromise;

        const prompt = "Analyze this image and extract the order details. Return a JSON object with 'items' array, where each item has 'name', 'quantity' (number), and 'price' (number). If total is available, include 'total'. Output ONLY valid JSON.";

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return cleanText;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw error;
    }
}

export async function analyzeDemand(data: any, query: string, apiKey: string): Promise<string> {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const prompt = `
      You are an expert sales analyst. 
      Here is the sales data: ${JSON.stringify(data)}.
      User Query: ${query}
      
      Please provide a detailed analysis, identifying trends, opportunities, and potential risks. 
      Format the output with markdown.
      Be concise and actionable.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini for analysis:", error);
        throw error;
    }
}
