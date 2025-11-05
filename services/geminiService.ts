import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const GENERATION_CONFIG = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg',
};

const MODEL_NAME = 'imagen-4.0-generate-001';

const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: MODEL_NAME,
            prompt: prompt,
            config: GENERATION_CONFIG,
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        // Try to parse a more specific error message from the response if possible
        if (error instanceof Error && error.message.includes('{')) {
             try {
                const errorObj = JSON.parse(error.message.substring(error.message.indexOf('{')));
                if (errorObj.error && errorObj.error.message) {
                     throw new Error(`Failed to generate image: ${errorObj.error.message}`);
                }
             } catch (e) {
                 // Ignore parsing error, fall through to generic message
             }
        }
        throw new Error(`Failed to generate image for prompt: "${prompt}"`);
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateColoringBookAssets = async (
    theme: string, 
    name: string, 
    pageCount: number,
    onProgress: (message: string, percentage: number) => void
): Promise<{ coverImage: string, pages: string[] }> => {
    const totalImageSteps = 1 + pageCount;
    const coverPrompt = `A beautiful coloring book cover page. It should say "${theme}" and "For ${name}". Style: simple vector art, thick bold black outlines, no color, no shading, clean lines, white background, kid-friendly.`;
    
    const pagePrompts = Array.from({ length: pageCount }, (_, i) => 
        `Coloring book page for a child. Theme: ${theme}. Scene ${i + 1}. Style: simple vector art, thick bold black outlines, no color, no shading, clean lines, white background, kid-friendly.`
    );

    onProgress('Creating the cover page...', (1 / totalImageSteps) * 100);
    const coverImage = await generateImage(coverPrompt);
    await delay(1000); // Add a 1-second delay to avoid hitting rate limits

    const pages: string[] = [];
    for (let i = 0; i < pagePrompts.length; i++) {
        const currentStep = i + 2; // Cover was step 1
        onProgress(`Drawing page ${i + 1} of ${pageCount}...`, (currentStep / totalImageSteps) * 100);
        const pageImage = await generateImage(pagePrompts[i]);
        pages.push(pageImage);
        if (i < pagePrompts.length - 1) { // Don't delay after the very last page
            await delay(1000); // Add a 1-second delay between page generations
        }
    }

    return { coverImage, pages };
};
