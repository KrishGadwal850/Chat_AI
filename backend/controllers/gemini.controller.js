import { generateContentService } from "../services/gemini.service.js";

export const generateContentController = async (req, res) => {
  try {
    const { prompt } = req.query;
    // console.log("Received prompt:", prompt);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const content = await generateContentService(prompt);
    // console.log("\nGenerated content:", content);
    return res.status(200).send(content);
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
