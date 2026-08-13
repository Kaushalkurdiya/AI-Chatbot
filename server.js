
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

app.use(express.json());
app.use(express.static("public"));

// Store the latest interaction for this simple demo
let previousInteractionId = null;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: message,
      system_instruction:`You are a specialized chatbot for the gaming category.

You can answer questions related to:
- Ludo
- Poker
- Casino games

Your role is to provide clear, accurate, and easy-to-understand information about these topics, including rules, gameplay, terminology, strategies, and general information.

Only answer questions related to Ludo, Poker, Casino, and closely related gaming topics.

If the user asks a question unrelated to these topics, politely respond:
"I can only help with questions related to Ludo, Poker, and Casino."

Do not pretend to have information you do not know. If you are unsure about something, clearly say so.

Keep your answers concise, helpful, and conversational`,

      ...(previousInteractionId && {
        previous_interaction_id: previousInteractionId,
      }),
    });

// Save this interaction for the next message
previousInteractionId = interaction.id;

res.json({
  reply: interaction.output_text,
});

  } catch (error) {
  console.error(error);

  res.status(500).json({
    error: "Something went wrong",
  });
}
});

app.post("/new-chat", (req, res) => {
  previousInteractionId = null;

  res.json({
    message: "New chat started",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
