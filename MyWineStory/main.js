const API_KEY_GOOGLE = '';
const API_KEY_OPENAI = '';


// メイン処理
async function analyzeWineLabel() {
  const status = document.getElementById("status");
  const result = document.getElementById("result");
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];

  if (!file) {
    status.textContent = "画像を選択してください。";
    return;
  }

  status.textContent = "画像を読み込み中...";

  // 画像をBase64に変換
  const base64Image = await toBase64(file);

  // 1. OCR実行
  const ocrText = await extractTextFromImage(base64Image);

  status.textContent = "OpenAIで銘柄解析中...";

  // 2. GPTでワイン情報解析
  const brandInfo = await extractWineInfoWithOpenAI(ocrText);

  // 結果表示
  status.textContent = "解析完了！";
  result.textContent = brandInfo;

  // 3. Firestoreに保存
  try {
    await db.collection("wine_labels").add({
      timestamp: new Date(),
      imageText: ocrText,
      analysisResult: brandInfo
    });
    console.log("保存成功");
  } catch (error) {
    console.error("保存エラー:", error);
  }
}

// Base64変換関数
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// OCR処理（Google Vision）
async function extractTextFromImage(base64Image) {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY_GOOGLE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "TEXT_DETECTION" }]
        }
      ]
    })
  });
  const data = await response.json();
  return data.responses[0].fullTextAnnotation?.text || "テキストが見つかりませんでした。";
}

// GPT-4 Turboでワイン情報を解析
async function extractWineInfoWithOpenAI(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY_OPENAI}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはワインのラベル情報から詳細を抽出し、ソムリエとして正確かつ親しみやすく解説する専門家です。"
        },
        {
          role: "user",
          content: `
以下のワインラベルの文字情報から、以下を含めて日本語で詳しく解説してください：
（ただし、ワインの銘柄と生産国・地域だけは、アルファベット表記と日本語表記で書いてください）

・ワインの銘柄  (例：ファンティーニ トレッビアーノ ダブルッツォ (FANTINI TREBBIANO D'ABRUZZO)のように)
・種類（例：赤／白、ブドウ品種など）  
・生産国・地域  
・呼称（例：DOC, AOCなど）  
・年（ヴィンテージ）  
・容量・アルコール度数  
・輸入業者  
・注意書きなどの追加情報  
・銘柄・生産者・地域に関する豆知識や雑学を2〜3個紹介してください

対象のOCR文字列：
${text}
`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "銘柄解析に失敗しました。";
}

async function loadHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "<p>履歴を読み込み中...</p>";

  try {
    const snapshot = await db.collection("wine_labels")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    if (snapshot.empty) {
      historyDiv.innerHTML = "<p>履歴がまだありません。</p>";
      return;
    }

    historyDiv.innerHTML = ""; // リセット

snapshot.forEach(doc => {
  const data = doc.data();
  const id = doc.id;
  const time = new Date(data.timestamp.toDate()).toLocaleString();
  const lines = (data.analysisResult || "").split("\n");

  // 銘柄の行だけ抽出（"### ワインの銘柄" の次の行が実データ）
  let titleLine = "銘柄不明";
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("銘柄")) {
      const nextLine = lines[i + 1] || "";
      titleLine = nextLine.replace(/^[-•]\s*/, "").trim(); // 「- 」や「• 」を除去
      break;
    }
  }

  const extraLines = lines.join("\n"); // すべてのテキストを全文に出す

  const card = document.createElement("div");
  card.className = "wine-card";

  // 折りたたみ全文
  const fullText = document.createElement("pre");
  fullText.className = "full-text";
  fullText.textContent = extraLines;
  fullText.style.display = "none";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-btn";
  toggleBtn.textContent = "▼もっと見る";
  toggleBtn.addEventListener("click", () => {
    const isVisible = fullText.style.display === "block";
    fullText.style.display = isVisible ? "none" : "block";
    toggleBtn.textContent = isVisible ? "▼もっと見る" : "▲閉じる";
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "削除";
  deleteBtn.addEventListener("click", async () => {
    if (confirm("この履歴を削除しますか？")) {
      await db.collection("wine_labels").doc(id).delete();
      loadHistory();
    }
  });

  card.innerHTML = `
    <h3>${titleLine}</h3>
    <time>${time}</time>
  `;

  card.appendChild(toggleBtn);
  card.appendChild(deleteBtn);
  card.appendChild(fullText);
  historyDiv.appendChild(card);
});







  } catch (error) {
    console.error("履歴読み込みエラー:", error);
    historyDiv.innerHTML = "<p>履歴の読み込みに失敗しました。</p>";
  }
}

//ページ読み込み時に履歴を表示
window.addEventListener("DOMContentLoaded", loadHistory);
