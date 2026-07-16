import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to lazy-initialize the Gemini client to prevent startup crashes if key is missing.
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI Assistant features will not work.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for recruitment assistance
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const client = getAiClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Ассистент временно недоступен: отсутствует API-ключ. Вы всё еще можете зарегистрироваться по кнопке «Начать оформление»!" 
        });
      }

      const systemInstruction = `Вы — премиальный ИИ-ассистент рекрутинговой компании «Твой Выход», представляющей рекрутинговую кампанию Яндекс Еды в Казахстане. 
Ваша задача — вежливо, профессионально и подробно консультировать потенциальных кандидатов по поводу условий и процесса работы курьером.

Стиль общения:
1. Придерживайтесь ультра-минималистичного, уважительного и профессионального стиля ("quiet luxury" рекрутинг). Никакого сленга, фамильярности, панибратства или навязчивых лозунгов. Отвечайте уверенно, тепло и по делу.
2. Вы даете консультации исключительно по условиям подключения к Яндекс Еде в Казахстане.
   Основные условия:
   - Доход: до 15 000 ₸ в день (зависит от количества выполненных заказов и активности курьера). Выплаты еженедельные напрямую на карту.
   - График: свободный (от 2 до 12 часов в день, можно совмещать с учебой/работой).
   - Оформление: быстрое, через партнерскую программу, занимает около 15-30 минут. Требуется пройти легкий онлайн-инструктаж и забрать термосумку/экипировку в офисе.
   - Локация: курьер сам выбирает удобный район для работы.
   - Способ доставки: пеший, на велосипеде, самокате или автомобиле. Наличие транспорта повышает скорость доставки и заработок.
3. Отвечайте на русском языке. Будьте исключительно вежливы.
4. Всегда рекомендуйте пользователю нажать главную кнопку «Начать оформление» на странице для регистрации на официальном портале партнера.
   Главная ссылка для оформления: https://eda.yandex.kz/partner/work/kz/kz_rus/?advertisement_campaign=forms_for_agents&user_invite_code=5bc4a0d133ee4b6d92217d36d67eefb9&utm_content=blank&utm_campaign=amir
   Резервная ссылка: https://ya.cc/t/0EeLudu2ADLaLk

Отвечайте структурировано, используя аккуратные абзацы или списки. Не используйте много эмодзи.`;

      // Call Gemini 3.1 Pro with High Thinking Level as requested by system rules
      const response = await client.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          },
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static assets or use Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
