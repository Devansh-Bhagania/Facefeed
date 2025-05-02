
'use server';
/**
 * @fileOverview Estimates the age and gender of faces detected in an image.
 *
 * - estimateAgeGender - A function that estimates the age and gender of faces in an image.
 * - EstimateAgeGenderInput - The input type for the estimateAgeGender function.
 * - EstimateAgeGenderOutput - The return type for the estimateAgeGender function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import type { Face } from '@/services/face-api'; // Keep type definition

const EstimateAgeGenderInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing faces, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EstimateAgeGenderInput = z.infer<typeof EstimateAgeGenderInputSchema>;

const EstimateAgeGenderOutputSchema = z.object({
  faces: z.array(
    z.object({
      box: z.object({
        x: z.number().describe("The X coordinate of the top-left corner of the bounding box."),
        y: z.number().describe("The Y coordinate of the top-left corner of the bounding box."),
        width: z.number().describe("The width of the bounding box."),
        height: z.number().describe("The height of the bounding box."),
      }).describe("The bounding box of the detected face."),
      age: z.number().describe('The estimated age of the person in the face.'),
      gender: z.string().describe('The estimated gender of the person in the face.'),
    })
  ).describe("An array containing information about each detected face."),
});
export type EstimateAgeGenderOutput = z.infer<typeof EstimateAgeGenderOutputSchema>;

export async function estimateAgeGender(input: EstimateAgeGenderInput): Promise<EstimateAgeGenderOutput> {
  return estimateAgeGenderFlow(input);
}

// Updated prompt to instruct the AI to perform detection AND estimation
const estimateAgeGenderPrompt = ai.definePrompt({
  name: 'estimateAgeGenderPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo containing faces, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: EstimateAgeGenderOutputSchema, // Use the full output schema directly
  },
  prompt: `You are an AI expert in analyzing faces within images. You are given
an image. First, detect all faces present in the image. For each detected face, provide its bounding box (x, y, width, height coordinates relative to the top-left corner of the image) and estimate the person's age and gender.

Return the results as a JSON object matching the specified output schema. If no faces are detected, return an empty array for the 'faces' field.

Image: {{media url=photoDataUri}}
`,
});

const estimateAgeGenderFlow = ai.defineFlow<
  typeof EstimateAgeGenderInputSchema,
  typeof EstimateAgeGenderOutputSchema
>(
  {
    name: 'estimateAgeGenderFlow',
    inputSchema: EstimateAgeGenderInputSchema,
    outputSchema: EstimateAgeGenderOutputSchema,
  },
  async input => {
    // Directly call the prompt with the image. The model will handle detection and estimation.
    const { output } = await estimateAgeGenderPrompt(input);

    // Ensure output is not null and conforms to the schema, return empty array if null/undefined
    return output ?? { faces: [] };
  }
);
