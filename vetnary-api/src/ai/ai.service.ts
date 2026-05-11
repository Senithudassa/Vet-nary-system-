import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SkinScanResult {
  condition: string;
  confidence: number;
  recommendation: string;
  affectedArea: BoundingBox;
  imageDimensions: {
    width: number;
    height: number;
  };
}

export interface ChatResponse {
  reply: string;
}

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenAI;
  private readonly MODEL = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is not set. ' +
          'Please add it to your .env file.',
      );
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  /**
   * Analyzes a pet's skin image and returns a diagnosis with the detected
   * disease region bounding box and the image dimensions.
   *
   * @param imageBuffer  Raw file buffer received from the multipart upload.
   * @param mimeType     MIME type of the uploaded file (e.g. "image/jpeg").
   */
  async analyzeSkin(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<SkinScanResult> {
    const base64Image = imageBuffer.toString('base64');
    const prompt = `You are an expert veterinary dermatologist. Analyze this image of a pet's skin condition.

You MUST return ONLY a raw JSON object with absolutely no markdown formatting, code fences, or explanatory text.

Schema:
{
  "condition": "string – name of the identified skin condition",
  "confidence": number – confidence percentage between 0 and 100,
  "recommendation": "string – brief clinical recommendation",
  "affectedArea": {
    "x": number – left edge of the diseased region as a fraction of image width (0.0–1.0),
    "y": number – top edge of the diseased region as a fraction of image height (0.0–1.0),
    "width": number – width of the diseased region as a fraction of image width (0.0–1.0),
    "height": number – height of the diseased region as a fraction of image height (0.0–1.0)
  },
  "imageDimensions": {
    "width": number – full pixel width of the provided image,
    "height": number – full pixel height of the provided image
  }
}

Return ONLY the JSON object with no additional text.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: this.MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Image,
                  mimeType,
                },
              },
            ],
          },
        ],
      });

      const responseText = result.text ?? '';

      // Strip any accidental markdown code fences
      const cleaned = responseText
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned) as SkinScanResult;
    } catch (error) {
      throw new InternalServerErrorException(
        `Skin analysis failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Veterinary-focused chat agent. Politely refuses off-topic queries.
   */
  async chat(userMessage: string): Promise<ChatResponse> {
    const systemPrompt = `You are VetBot, a knowledgeable and compassionate AI assistant specialising exclusively in veterinary medicine and pet health. You provide accurate, helpful information about:
- Animal diseases, conditions, and symptoms
- Treatments, medications, and dosages used in veterinary practice
- Nutrition and dietary advice for pets
- Preventive care, vaccinations, and parasite control
- Post-operative and recovery care
- When and why to visit a veterinarian

Important rules:
1. You ONLY discuss topics related to veterinary medicine, animal health, and pet care.
2. If a user asks about anything outside of veterinary topics (e.g., human medicine, cooking, finance, coding), politely decline and redirect them to a veterinary question.
3. Always recommend consulting a licensed veterinarian for any serious concerns.
4. Keep responses concise, clear, and empathetic.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: this.MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
          },
        ],
      });

      const reply = result.text ?? 'I was unable to generate a response.';
      return { reply: reply.trim() };
    } catch (error) {
      throw new InternalServerErrorException(
        `Chat failed: ${(error as Error).message}`,
      );
    }
  }
}
