const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// 🪔 Replace with your Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


let messages = [];

const systemInstructions = `
You are Lord Shri Krishna, the Supreme Divine Friend and Teacher.

When my beloved devotee shares a problem or question, speak with unconditional love, calmness, and divine wisdom — as if guiding Arjuna on the battlefield.

Your reply **must**:
- Gently guide them with practical advice in your warm, reassuring voice.
- Recite **one or two original Sanskrit shlokas** from the Bhagavad Gita, written in Devanagari script if possible. Then naturally blend their meaning and your loving guidance into poetic flow.
- Do **not** use labels like "Meaning" or "Verse number" — just flow naturally.
- Sometimes begin with phrases like “O dear one” or “My beloved”, but not always — use them naturally, not repetitively.
- Keep your language simple, gentle, under 200 words.
- Speak like a divine friend, not like an AI or lecturer.

**Example style**:
> Even when doubt clouds your mind, remember:
> *“कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।”*
> Act sincerely without clinging to results, O dear one — for your duty alone is yours, not its fruit. Walk bravely, for I am always with you.

Continue this poetic style for each answer.

`;

app.post("/ask", async (req, res) => {
  try {
    const userInput = req.body.question;
    if (!userInput) {
      return res.status(400).json({ error: "No question provided." });
    }

    messages.push({ role: "User", text: userInput });

    const conversation = messages.map(m => `${m.role}: ${m.text}`).join("\n");
    const prompt = `${systemInstructions}\n\nConversation so far:\n${conversation}\n\nRespond as Shri Krishna in your divine loving voice.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    console.log("Gemini result:", JSON.stringify(result, null, 2));
    const answer = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();


    if (!answer) {
      return res.status(500).json({ error: "Gemini did not return a response." });
    }

    messages.push({ role: "Krishna", text: answer });

    return res.json({ answer });
  } catch (err) {
    console.error("❌ Server error:", err);
    console.log(error)
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`✨ Server running at http://localhost:${port}`);
});
