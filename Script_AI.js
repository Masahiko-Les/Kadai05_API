const apiKey = ""; // ← OpenAIのAPIキーを入力

const pricing = {
  "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
  "gpt-4": { prompt: 0.03, completion: 0.06 },
  "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
  "gpt-4o": { prompt: 0.005, completion: 0.015 }
};

async function callOpenAI(prompt, model, infoElementId) {
  const start = performance.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    }),
  });
  const data = await res.json();
  const end = performance.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  const usage = data.usage || {};
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;

  const price = pricing[model];
  const cost = ((promptTokens * price.prompt + completionTokens * price.completion) / 1000).toFixed(5);

  document.getElementById(infoElementId).textContent =
    `応答時間: ${seconds}s | トークン: ${totalTokens} | コスト: $${cost}`;

  return data.choices?.[0]?.message?.content || "(応答なし)";
}

async function sendToModels() {
  const prompt = document.getElementById("prompt").value;

  document.getElementById("out35").textContent = "読み込み中...";
  document.getElementById("out4").textContent = "読み込み中...";
  document.getElementById("out4t").textContent = "読み込み中...";
  document.getElementById("out4o").textContent = "読み込み中...";

  document.getElementById("info35").textContent = "";
  document.getElementById("info4").textContent = "";
  document.getElementById("info4t").textContent = "";
  document.getElementById("info4o").textContent = "";

  const [out35, out4, out4t, out4o] = await Promise.all([
    callOpenAI(prompt, "gpt-3.5-turbo", "info35"),
    callOpenAI(prompt, "gpt-4", "info4"),
    callOpenAI(prompt, "gpt-4-turbo", "info4t"),
    callOpenAI(prompt, "gpt-4o", "info4o")
  ]);

  document.getElementById("out35").textContent = out35;
  document.getElementById("out4").textContent = out4;
  document.getElementById("out4t").textContent = out4t;
  document.getElementById("out4o").textContent = out4o;
}
