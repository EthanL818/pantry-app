import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_API_KEY,
});

export default async function handler(req, res) {
  const { ingredient } = req.query;

  try {
    const result = await unsplash.search.getPhotos({
      query: ingredient,
      page: 1,
      perPage: 1,
      orientation: "squarish",
    });

    if (result.response.results.length > 0) {
      res.status(200).json({ imageUrl: result.response.results[0].urls.small });
    } else {
      res.status(404).json({ error: "No image found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching image" });
  }
}
