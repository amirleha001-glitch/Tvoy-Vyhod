export async function handler(event, context) {
  // Разрешаем запросы только методом POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Получаем сообщение от пользователя из тела запроса
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Сообщение не может быть пустым" }),
      };
    }

    // Берем API-ключ из переменных окружения Netlify
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 503,
        body: JSON.stringify({ error: "Ассистент временно недоступен: отсутствует API-ключ." }),
      };
    }

    // Инструкция для ИИ
    const systemInstruction = `Вы — премиальный ИИ-ассистент рекрутинговой компании «Твой Выход», представляющей рекрутинговую кампанию Яндекс Еды в Казахстане. 
Ваша задача — вежливо, профессионально и подробно консультировать потенциальных кандидатов по поводу условий и процесса работы курьером.

Стиль общения:
1. Придерживайтесь ультра-минималистичного, уважительного и профессионального стиля. Никакого сленга, фамильярности или навязчивых лозунгов. Отвечайте уверенно, тепло и по делу.
2. Основные условия для Казахстана:
   - Доход: до 15 000 ₸ в день. Выплаты еженедельные напрямую на карту.
   - График: свободный.
   - Оформление: быстрое, занимает около 15-30 минут. Требуется пройти легкий инструктаж в Хабе и забрать термосумку там-же.
   - Способ доставки: пеший, велосипед, самокат или авто.
3. Отвечайте на русском языке.
4. Всегда рекомендуйте нажать главную кнопку «Начать оформление» на странице.`;

    // Форматируем историю для Gemini API
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Добавляем системную инструкцию в начало запроса
    formattedContents.unshift({
      role: 'user',
      parts: [{ text: `СИСТЕМНАЯ ИНСТРУКЦИЯ (ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ): ${systemInstruction}` }]
    });

    // Делаем запрос к API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7
          }
        }),
      }
    );

    const data = await response.json();
    
    // Извлекаем ответ
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, не удалось сгенерировать ответ.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ text: reply }), // Возвращаем { text: ... }, как ожидает твой фронтенд
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Внутренняя ошибка сервера: " + error.message }),
    };
  }
}
