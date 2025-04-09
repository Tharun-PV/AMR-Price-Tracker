import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { image } = req.body;
  if (!image || !image.startsWith("data:image/png;base64,")) {
    res.status(400).json({ error: "Invalid image data" });
    return;
  }

  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `${uuidv4()}.png`;
  const filePath = path.join(process.cwd(), "public", "images", filename);

  try {
    await fs.mkdir(path.join(process.cwd(), "public", "images"), { recursive: true });
    await fs.writeFile(filePath, buffer);
    // Use ngrok URL for development
    const baseUrl = process.env.NODE_ENV === "development"
      ? "https://fa8c-2405-201-e05d-d02f-999f-47ba-47b-561b.ngrok-free.app/" // Update with your ngrok URL
      : `${req.headers.origin}`;
    const imageUrl = `${baseUrl}/images/${filename}`;
    console.log("Successfully saved image at:", imageUrl); // Debug log
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ error: "Failed to save image" });
  }
}