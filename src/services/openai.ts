export async function analyzeImageWithDeepSeek(imageFile: File, apiKey: string, prompt?: string): Promise<string> {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    try {
        const reader = new FileReader();
        const imagePromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const base64Data = reader.result.split(',')[1];
                    resolve(base64Data);
                } else {
                    reject(new Error("Failed to read image file"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        const base64Image = await imagePromise;

        const defaultPrompt = 'You are an expert in analyzing order images. Extract the order details and return a JSON object with items array, where each item has name, quantity (number), and price (number). Output ONLY valid JSON.';
        const userPrompt = 'Analyze this image and extract the order details. Return a JSON object with items array, where each item has name, quantity (number), and price (number). If total is available, include total. Output ONLY valid JSON.';

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-vl-1.3-large',
                messages: [
                    {
                        role: 'system',
                        content: prompt || defaultPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: userPrompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${imageFile.type};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return cleanText;
    } catch (error) {
        console.error("Error calling DeepSeek:", error);
        throw error;
    }
}