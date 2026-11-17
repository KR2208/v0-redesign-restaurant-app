import { GoogleGenAI, Type } from "@google/genai"
import { z } from "zod"

const MODEL = "gemini-3.5-flash-lite"

export class GeminiError extends Error {}

// What we actually hand Gemini for each candidate place - real data we
// already fetched from Places API, plus a real computed distance (never
// let the model estimate that itself).
export interface OutingCandidate {
  id: string
  name: string
  types: string[]
  rating: number
  distanceMeters: number
}

const PickSchema = z.object({
  placeId: z.string(),
  why: z.string(),
})

const OutingPlanSchema = z.object({
  summary: z.string(),
  thingsToDo: z.array(PickSchema),
  moreToEat: z.array(PickSchema),
})

export type OutingPlan = z.infer<typeof OutingPlanSchema>

function formatCandidate(c: OutingCandidate): string {
  return `- id=${c.id} name="${c.name}" types=${c.types.join("/")} rating=${c.rating} distance=${Math.round(c.distanceMeters)}m`
}

/**
 * Curates a short "make it an outing" plan: Gemini's only job is to rank
 * and narrate real candidates we already fetched from Places API, never
 * to invent a place. We ground it with an explicit, real list and then
 * - just as importantly - filter its response against that same list
 * afterward, in case it ever ignores the instruction.
 */
export async function generateOutingPlan(
  restaurantName: string,
  attractions: OutingCandidate[],
  nearbyRestaurants: OutingCandidate[]
): Promise<OutingPlan> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not set on the server")
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `You are curating a short "make it an outing" plan for someone eating at "${restaurantName}".

Below are the REAL, confirmed-to-exist nearby places. You must only refer to these by their exact id - never invent a place that isn't listed here, and never invent a distance different from what's given.

Things to do nearby:
${attractions.length > 0 ? attractions.map(formatCandidate).join("\n") : "(none found nearby)"}

Restaurants or cafes nearby:
${nearbyRestaurants.length > 0 ? nearbyRestaurants.map(formatCandidate).join("\n") : "(none found nearby)"}

Pick up to 3 of the best things to do and up to 3 of the best places to eat from the lists above - favor higher rated and closer options, but use judgment about what pairs well with the meal. Write one short overall sentence pairing the meal with the outing, and one short "why" line per pick, mentioning the real distance only using the numbers given above.`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          thingsToDo: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                placeId: { type: Type.STRING },
                why: { type: Type.STRING },
              },
              required: ["placeId", "why"],
            },
          },
          moreToEat: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                placeId: { type: Type.STRING },
                why: { type: Type.STRING },
              },
              required: ["placeId", "why"],
            },
          },
        },
        required: ["summary", "thingsToDo", "moreToEat"],
      },
    },
  })

  const text = response.text
  if (!text) {
    throw new GeminiError("Gemini returned an empty response")
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new GeminiError("Gemini response was not valid JSON")
  }

  const parsed = OutingPlanSchema.safeParse(json)
  if (!parsed.success) {
    console.error("Gemini response failed validation:", parsed.error.flatten())
    throw new GeminiError("Gemini returned an unexpected response shape")
  }

  // The real safeguard against hallucination: drop anything that isn't
  // actually one of the candidates we gave it, regardless of what the
  // prompt asked for.
  const validAttractionIds = new Set(attractions.map((a) => a.id))
  const validRestaurantIds = new Set(nearbyRestaurants.map((r) => r.id))

  return {
    summary: parsed.data.summary,
    thingsToDo: parsed.data.thingsToDo.filter((pick) => validAttractionIds.has(pick.placeId)),
    moreToEat: parsed.data.moreToEat.filter((pick) => validRestaurantIds.has(pick.placeId)),
  }
}
