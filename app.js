/*
  AI Shopping Assistant loader
  1) In Flowise, open your chatflow and click "Share".
  2) Copy the embed script URL and chatflow ID.
  3) Replace the values below.
*/

const FLOWISE_EMBED_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
const FLOWISE_CHATFLOW_ID = "PASTE_YOUR_CHATFLOW_ID_HERE";
const FLOWISE_API_HOST = "https://PASTE-YOUR-FLOWISE-HOST/api/v1/prediction";

const target = document.getElementById("flowise-widget-target");

function showSetupMessage(message) {
  target.innerHTML = `
    <div style="color:#d7e7ff;padding:12px;font-size:0.95rem;line-height:1.5;">
      <strong>Setup needed:</strong> ${message}
    </div>
  `;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function bootFlowise() {
  if (!FLOWISE_CHATFLOW_ID.includes("PASTE_") && !FLOWISE_API_HOST.includes("PASTE-")) {
    try {
      await loadScript(FLOWISE_EMBED_SCRIPT_URL);

      if (window.Chatbot && typeof window.Chatbot.init === "function") {
        window.Chatbot.init({
          chatflowid: FLOWISE_CHATFLOW_ID,
          apiHost: FLOWISE_API_HOST,
          theme: {
            button: {
              backgroundColor: "#1da1f2",
              right: 20,
              bottom: 20,
              size: 54,
              dragAndDrop: false,
              iconColor: "white",
            },
            chatWindow: {
              welcomeMessage: "Hi! I can suggest products based on your category and budget.",
              backgroundColor: "#0d1a30",
              height: 620,
              width: 390,
              fontSize: 14,
              starterPrompts: ["I need a laptop under 70000", "Suggest earbuds under 3000"],
              clearChatOnReload: false,
              botMessage: { backgroundColor: "#1d2f4e", textColor: "#eef5ff" },
              userMessage: { backgroundColor: "#00a8ff", textColor: "#fff" },
            },
          },
          target: "#flowise-widget-target",
        });
      } else {
        showSetupMessage("Flowise script loaded, but widget API was not found.");
      }
    } catch (error) {
      console.error(error);
      showSetupMessage("Unable to load Flowise script. Check your script URL and internet.");
    }
  } else {
    showSetupMessage(
      "Open app.js and replace FLOWISE_CHATFLOW_ID + FLOWISE_API_HOST with your real values."
    );
  }
}

bootFlowise();
