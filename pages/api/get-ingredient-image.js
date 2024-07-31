export default async function handler(req, res) {
  const { ingredient } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY; // Add this to your .env file

  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
        ingredient
      )}&apiKey=${apiKey}&number=1`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = `https://spoonacular.com/cdn/ingredients_250x250/${data.results[0].image}`;
      res.status(200).json({ imageUrl });
    } else {
      res.status(404).json({ error: "No image found" });
    }
  } catch (error) {
    console.error("Error fetching ingredient image:", error);
    res.status(500).json({ error: "Error fetching image" });
  }
}
