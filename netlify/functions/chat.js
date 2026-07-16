exports.handler = async function (event, context) {
  // Разрешаем только POST запросы
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Массив сообщений обязателен." }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 503,
        body: JSON.stringify({ error: "Ассистент временно недоступен: отсутствует API-ключ." }),
      };
    }

    // Твои премиальные настройки системного промта
    const systemInstruction = `Вы — премиальный ИИ-ассистент рекрутинговой компании «Твой Выход», представляющей рекрутинговую кампанию Яндекс Еды в Казахстане. 
Ваша задача — вежливо, профессионально и подробно консультировать потенциальных кандидатов по поводу условий и процесса работы курьером.

Стиль общения:
1. Придерживайтесь ультра-минималистичного, уважительного и профессионального стиля ("quiet luxury" рекрутинг). Никакого сленга, фамильярности, панибратства или навязчивых лозунгов. Отвечайте уверенно, тепло и по делу.
2. Вы даете консультации исключительно по условиям подключения к Яндекс Еде в Казахстане.
   Основные условия:
   - Доход: до 15 000 ₸ в день. Выплаты еженедельные напрямую на карту.
   - График: свободный (от 2 до 12 часов в день, можно совмещать с учебой/работой).
   - Оформление: быстрое, через партнерскую программу, занимает около 15-30 минут. Требуется пройти легкий онлайн-инструктаж и забрать термосумку/экипировку в офисе.
   - Локация: курьер сам выбирает удобный район для работы.
   - Способ доставки: пеший, на велосипеде, самокате или автомобиле.
3. Отвечайте на русском языке. Будьте исключительно вежливы.
4. Всегда рекомендуйте пользователю нажать главную кнопку «Начать оформление» на странице для регистрации на официальном портале партнера.
   Главная ссылка для оформления: https://eda.yandex.kz/partner/work/kz/kz_rus/?advertisement_campaign=forms_for_agents&user_invite_code=5bc4a0d133ee4b6d92217d36d67eefb9&utm_content=blank&utm_campaign=amir
   Резервная ссылка: https://ya.cc/t/0EeLudu2ADLaLk

Отвечайте структурировано, используя аккуратные абзацы или списки. Не используйте много эмодзи.`;

    // Форматируем историю диалога для Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Добавляем системную инструкцию в начало запроса к Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7
          }
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, не удалось сгенерировать ответ.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ text: reply }), // Отправляем обратно ключ "text", который ждет App.tsx
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Внутренняя ошибка сервера: " + error.message }),
    };
  }
};
