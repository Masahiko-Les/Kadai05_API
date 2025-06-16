const apiKeyGCV = "";//←Google Cloud Visionのキーを入力
const apiKeyOCRSpace = "";//←OCR.spaceのキーを入力
let base64Image = "";

document.getElementById('imageInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    base64Image = reader.result.split(',')[1];
    document.getElementById('preview').src = reader.result;
  };
  reader.readAsDataURL(file);
});

async function runAllOCR() {
  runTesseract();
  runGCV();
  runOCRSpace();
}

function runTesseract() {
  const start = performance.now();
  document.getElementById("out-tess").textContent = "解析中...";
  Tesseract.recognize(document.getElementById("preview").src, 'eng+jpn')
    .then(({ data: { text } }) => {
      const end = performance.now();
      document.getElementById("meta-tess").textContent = `処理時間: ${(end - start) / 1000}s`;
      document.getElementById("out-tess").textContent = text;
    })
    .catch(err => {
      document.getElementById("out-tess").textContent = "エラー：" + err.message;
    });
}

async function runGCV() {
  const start = performance.now();
  document.getElementById("out-gcv").textContent = "解析中...";
  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKeyGCV}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }
      ]
    })
  });
  const data = await res.json();
  const end = performance.now();
  document.getElementById("meta-gcv").textContent = `処理時間: ${(end - start) / 1000}s`;
  const text = data.responses?.[0]?.fullTextAnnotation?.text || "(文字なし)";
  document.getElementById("out-gcv").textContent = text;
}

async function runOCRSpace() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return;
  const start = performance.now();
  document.getElementById("out-ocrspace").textContent = "解析中...";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", "jpn");
  formData.append("isOverlayRequired", false);
  formData.append("apikey", apiKeyOCRSpace);

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  const end = performance.now();
  document.getElementById("meta-ocrspace").textContent = `処理時間: ${(end - start) / 1000}s`;
  const text = data.ParsedResults?.[0]?.ParsedText || "(文字なし)";
  document.getElementById("out-ocrspace").textContent = text;
}
