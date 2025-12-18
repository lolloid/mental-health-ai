document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chat");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const hero = document.getElementById("hero");
  const historyDiv = document.getElementById("history");

  let chats = JSON.parse(localStorage.getItem("chats") || "[]");
  let activeChat = null;

  /* =====================
     HERO
  ===================== */
  function updateHero() {
    hero.style.display =
      !activeChat || activeChat.messages.length === 0 ? "block" : "none";
  }

  /* =====================
     RENDER CHAT
  ===================== */
  function renderChat() {
    chat.innerHTML = "";
    if (!activeChat) return;

    activeChat.messages.forEach(m => {
      const div = document.createElement("div");
      div.className = `message ${m.role}`;
      div.innerText = m.text;
      chat.appendChild(div);
    });

    chat.scrollTop = chat.scrollHeight;
  }

  /* =====================
     TYPING INDICATOR
  ===================== */
  function showTyping() {
    if (document.getElementById("typing-indicator")) return;

    const typing = document.createElement("div");
    typing.id = "typing-indicator";
    typing.className = "typing";
    typing.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("typing-indicator");
    if (t) t.remove();
  }

  /* =====================
     STREAMING EFFECT
  ===================== */
  async function streamText(fullText, target) {
    let buffer = "";
    for (let i = 0; i < fullText.length; i++) {
      buffer += fullText[i];
      target.innerText = buffer;
      chat.scrollTop = chat.scrollHeight;
      await new Promise(r => setTimeout(r, 18));
    }
  }

  /* =====================
     HISTORY
  ===================== */
  function renderHistory() {
    historyDiv.innerHTML = "";

    chats.forEach(chatItem => {
      const row = document.createElement("div");
      row.className =
        "history-item" + (chatItem === activeChat ? " active" : "");

      const titleBtn = document.createElement("button");
      titleBtn.className = "history-btn";
      titleBtn.textContent = chatItem.title;
      titleBtn.onclick = () => {
        activeChat = chatItem;
        renderChat();
        updateHero();
        renderHistory();
      };

      const renameBtn = document.createElement("button");
      renameBtn.className = "history-action";
      renameBtn.innerText = "✏️";
      renameBtn.onclick = e => {
        e.stopPropagation();
        const name = prompt("Rename chat:", chatItem.title);
        if (name) {
          chatItem.title = name;
          save();
          renderHistory();
        }
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "history-action delete";
      deleteBtn.innerText = "🗑️";
      deleteBtn.onclick = e => {
        e.stopPropagation();
        if (!confirm("Hapus chat ini?")) return;
        chats = chats.filter(c => c !== chatItem);
        activeChat = chats[chats.length - 1] || null;
        save();
        renderChat();
        updateHero();
        renderHistory();
      };

      row.append(titleBtn, renameBtn, deleteBtn);
      historyDiv.appendChild(row);
    });
  }

  function save() {
    localStorage.setItem("chats", JSON.stringify(chats));
  }

  function ensureChat() {
    if (!activeChat) {
      activeChat = { id: Date.now(), title: "Chat Baru", messages: [] };
      chats.push(activeChat);
      save();
    }
  }

  /* =====================
     SEND MESSAGE
  ===================== */
  async function sendMessage(text = null) {
    const msg = text ?? input.value.trim();
    if (!msg) return;

    ensureChat();

    if (activeChat.messages.length === 0) {
      activeChat.title = msg.slice(0, 32);
    }

    activeChat.messages.push({ role: "user", text: msg });
    input.value = "";
    renderChat();
    updateHero();
    save();

    showTyping();

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      removeTyping();

      const bubble = document.createElement("div");
      bubble.className = "message bot";
      bubble.innerText = "";
      chat.appendChild(bubble);

      const botMsg = { role: "bot", text: "" };
      activeChat.messages.push(botMsg);

      await streamText(data.reply || "...", bubble);
      botMsg.text = bubble.innerText;

      save();
    } catch {
      removeTyping();
      activeChat.messages.push({
        role: "bot",
        text: "Maaf, ada gangguan teknis."
      });
      renderChat();
    }
  }

  /* =====================
     EVENTS
  ===================== */
  sendBtn.onclick = () => sendMessage();
  window.sendMessage = () => sendMessage();
  window.sendQuick = t => sendMessage(t);

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  newChatBtn.onclick = () => {
    activeChat = { id: Date.now(), title: "Chat Baru", messages: [] };
    chats.push(activeChat);
    save();
    renderChat();
    updateHero();
    renderHistory();
  };

  /* =====================
     INIT
  ===================== */
  if (chats.length > 0) {
    activeChat = chats[chats.length - 1];
  }

  renderChat();
  renderHistory();
  updateHero();
  /* =====================
   SIDEBAR TOGGLE (ADD-ON)
===================== */
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

if (sidebar && sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

});
