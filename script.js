const socket = io();

const statusBox = document.getElementById("status");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");

function addMessage(text, type) {
  const p = document.createElement("p");
  p.className = `message ${type}`;
  p.textContent = text;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startChat() {
  chatBox.innerHTML = "";
  statusBox.textContent = "Đang tìm người lạ...";
  socket.emit("start");
}

function sendMessage() {
  const msg = messageInput.value.trim();

  if (!msg) return;

  socket.emit("message", msg);
  addMessage("Bạn: " + msg, "you");

  messageInput.value = "";
}

function nextChat() {
  chatBox.innerHTML = "";
  statusBox.textContent = "Đang tìm người mới...";
  socket.emit("next");
}

function stopChat() {
  socket.emit("stop");
}

socket.on("waiting", () => {
  statusBox.textContent = "Đang tìm người lạ...";
  addMessage("Đang chờ người khác kết nối...", "system");
});

socket.on("matched", () => {
  statusBox.textContent = "Đã kết nối với người lạ";
  addMessage("Bạn đang chat với một người lạ.", "system");
});

socket.on("message", (msg) => {
  addMessage("Người lạ: " + msg, "stranger");
});

socket.on("stranger_left", () => {
  statusBox.textContent = "Người lạ đã rời đi";
  addMessage("Người lạ đã ngắt kết nối.", "system");
});

socket.on("stopped", () => {
  statusBox.textContent = "Đã dừng chat";
  chatBox.innerHTML = "";
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
