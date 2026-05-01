const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-4o-mini";
const STORAGE_KEY = "openrouter_api_key";

const catalog = [
  { name: "Lenovo IdeaPad Slim 3", category: "laptop", price: 52999, tags: ["student", "office"] },
  { name: "HP 15 Ryzen 5", category: "laptop", price: 58999, tags: ["multitasking", "value"] },
  { name: "Acer Aspire 7", category: "laptop", price: 64999, tags: ["performance", "coding"] },
  { name: "Samsung Galaxy M35", category: "phone", price: 18999, tags: ["battery", "amoled"] },
  { name: "OnePlus Nord CE4", category: "phone", price: 24999, tags: ["camera", "fast-charge"] },
  { name: "iQOO Neo 9 Pro", category: "phone", price: 35999, tags: ["gaming", "performance"] },
  { name: "Boat Airdopes 141", category: "earbuds", price: 1299, tags: ["budget", "casual"] },
  { name: "OnePlus Buds 3", category: "earbuds", price: 5499, tags: ["balanced", "anc"] },
  { name: "Sony WF-C700N", category: "earbuds", price: 8499, tags: ["audio", "anc"] },
  { name: "Puma Flyer Runner", category: "shoes", price: 2999, tags: ["running", "lightweight"] },
  { name: "Adidas Duramo SL", category: "shoes", price: 4299, tags: ["comfort", "daily"] },
  { name: "Nike Revolution 7", category: "shoes", price: 4999, tags: ["style", "versatile"] }
];

const state = {
  step: "welcome",
  category: "",
  budget: 0
};

const logEl = document.getElementById("chat-log");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");
const keyEl = document.getElementById("openrouter-key");
const saveKeyBtn = document.getElementById("save-key-btn");
const runDemoBtn = document.getElementById("run-demo-btn");
const resetChatBtn = document.getElementById("reset-chat-btn");

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = text;
  logEl.appendChild(msg);
  logEl.scrollTop = logEl.scrollHeight;
}

function resetConversation(showIntro = true) {
  logEl.innerHTML = "";
  state.step = "welcome";
  state.category = "";
  state.budget = 0;
  if (showIntro) {
    addMessage("bot", "Hi! I am your AI Shopping Assistant.");
    addMessage("bot", "Type anything to begin.");
  }
}

function loadSavedKey() {
  const key = localStorage.getItem(STORAGE_KEY);
  if (key) {
    keyEl.value = key;
  }
}

function saveKey() {
  const value = keyEl.value.trim();
  if (!value) {
    localStorage.removeItem(STORAGE_KEY);
    addMessage("bot", "OpenRouter key removed. Assistant will use built-in recommendations.");
    return;
  }
  localStorage.setItem(STORAGE_KEY, value);
  addMessage("bot", "OpenRouter key saved. AI-enhanced recommendations enabled.");
}

function parseBudget(input) {
  const digits = input.replace(/[^\d]/g, "");
  return Number(digits);
}

function recommendProducts(category, budget) {
  const normalizedCategory = category.toLowerCase().trim();
  const candidates = catalog
    .filter((item) => item.category === normalizedCategory)
    .sort((a, b) => a.price - b.price);

  const underBudget = candidates.filter((item) => item.price <= budget);
  const picked = underBudget.length >= 3 ? underBudget.slice(0, 3) : candidates.slice(0, 3);

  if (!picked.length) {
    return [];
  }

  return picked.map((item, idx) => ({
    rank: idx + 1,
    ...item,
    reason:
      item.price <= budget
        ? `Fits your budget and is good for ${item.tags.join(", ")}.`
        : `Slightly above budget, but strong value for ${item.tags.join(", ")}.`
  }));
}

async function enrichWithOpenRouter(baseText, category, budget) {
  const apiKey = localStorage.getItem(STORAGE_KEY);
  if (!apiKey) {
    return baseText;
  }

  const prompt = `You are a shopping assistant.
Category: ${category}
Budget: ${budget}
Base recommendations:
${baseText}

Rewrite this as polished final suggestions in <= 120 words.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "AI Shopping Assistant Lab"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error("OpenRouter request failed.");
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return text || baseText;
}

function formatRecommendations(items) {
  return items
    .map(
      (item) =>
        `${item.rank}. ${item.name} - INR ${item.price}\nWhy: ${item.reason}`
    )
    .join("\n\n");
}

async function handleUserInput(rawInput) {
  const input = rawInput.trim();
  if (!input) return;

  addMessage("user", input);

  if (state.step === "welcome") {
    state.step = "category";
    addMessage(
      "bot",
      "Great. Which category are you shopping for?\nTry: laptop, phone, earbuds, shoes"
    );
    return;
  }

  if (state.step === "category") {
    state.category = input.toLowerCase();
    state.step = "budget";
    addMessage("bot", `Got it: ${state.category}. What's your budget in INR?`);
    return;
  }

  if (state.step === "budget") {
    const budget = parseBudget(input);
    if (!budget || budget < 500) {
      addMessage("bot", "Please enter a valid budget (example: 3000 or INR 3000).");
      return;
    }
    state.budget = budget;
    state.step = "recommendation";

    const recommendations = recommendProducts(state.category, state.budget);
    if (!recommendations.length) {
      addMessage(
        "bot",
        "I could not find products for that category. Try one of: laptop, phone, earbuds, shoes."
      );
      state.step = "category";
      return;
    }

    const baseText = formatRecommendations(recommendations);
    addMessage("bot", "Generating top 3 recommendations...");

    try {
      const finalText = await enrichWithOpenRouter(baseText, state.category, state.budget);
      addMessage("bot", finalText);
    } catch (error) {
      addMessage("bot", `${baseText}\n\n(OpenRouter enhancement failed, showing built-in results.)`);
    }

    state.step = "end";
    addMessage("bot", "Done. Type anything to start a new recommendation.");
    return;
  }

  if (state.step === "end") {
    state.step = "category";
    state.category = "";
    state.budget = 0;
    addMessage("bot", "Let's go again. Which category are you shopping for?");
  }
}

saveKeyBtn.addEventListener("click", saveKey);
formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = inputEl.value;
  inputEl.value = "";
  await handleUserInput(value);
});

runDemoBtn.addEventListener("click", async () => {
  resetConversation(false);
  addMessage("bot", "Demo mode started (no API required).");
  await handleUserInput("start");
  await handleUserInput("earbuds");
  await handleUserInput("3000");
});

resetChatBtn.addEventListener("click", () => {
  resetConversation(true);
});

loadSavedKey();
resetConversation(true);
