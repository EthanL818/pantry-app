import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("Request received at /api/generate-recipe");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { ingredients, additionalInput } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Invalid ingredients list" });
  }

  const ingredientList = ingredients
    .map(({ name, quantity }) => `${quantity} of ${name}`)
    .join(", ");

  const prompt = `Generate a simple recipe designed for students with little to no cooking knowledge using some or all of these ingredients: ${ingredientList}. 
  You may assume they have simple ingredients such as oil, seasoning like salt and pepper, etc. Additionally, focus on creating cohesive, 
  understandable recipes. DO NOT try and incorporate ingredients if they do not belong. Finally, the following is additional input to help guide the recipe generation: ${additionalInput}
  Format the response as follows:
Recipe Name:
Ingredients:
- ingredient 1
- ingredient 2
Additional Ingredients (optional):
- additional ingredient 1
- additional ingredient 2
...
Instructions:
1. Step 1
2. Step 2
...
Rough Nutritional Content:
- Calories:
- Protein:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const recipe = completion.choices[0].message.content.trim();
    res.status(200).json({ recipe });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
}
