export async function handler(event, context) {
  // Разрешаем только POST-запросы
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    console.log("Получен запрос на бэкенд. Тело запроса:", event.body);

    if (!event.body) {
      throw new Error("Тело запроса пустое (empty body)");
    }

    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Массив сообщений (messages) пуст или невалиден" }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ОШИБКА: Переменная окружения GEMINI_API_KEY не найдена в системе Netlify!");
      return {
        statusCode: 503,
        body: JSON.stringify({ error: "Ассистент временно недоступен: отсутствует API-ключ." }),
      };
    }

    const systemInstruction = `Вы — премиальный ИИ-ассистент рекрутинговой компании «Твой Выход», представляющей рекрутинговую кампанию Яндекс Еды в Казахстане. 
Ваша задача — вежливо, профессионально и подробно консультировать потенциальных кандидатов по поводу условий и процесса работы курьером.

Стиль общения:
1. Придерживайтесь ультра-минималистичного, уважительного и профессионального стиля. Никакого сленга, фамильярности или навязчивых лозунгов. Отвечайте уверенно, тепло и по делу.
2. Основные условия для Казахстана:
   - Доход: до 15 000 ₸ в день. Выплаты еженедельные напрямую на карту.
   - График: свободный (от 2 до 12 часов в день, можно совмещать).
   - Оформление: быстрое, занимает около 15-30 минут. Требуется пройти легкий онлайн-инструктаж и забрать термосумку в офисе.
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    console.log("Отправляем запрос к Google Gemini API...");
    
    const response = await fetch(apiUrl, {
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
    });

    console.log("Получен статус ответа от Gemini:", response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API вернул ошибку:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Ошибка Gemini API" }),
      };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, не удалось сгенерировать ответ.";
    console.log("Успешно сгенерирован ответ длинной", reply.length, "символов.");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*", // На всякий случай разрешаем CORS
      },
      body: JSON.stringify({ text: reply }),
    };

  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА ВНУТРИ ФУНКЦИИ:", error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ error: "Внутренняя ошибка сервера: " + error.message }),
    };
  }
}
