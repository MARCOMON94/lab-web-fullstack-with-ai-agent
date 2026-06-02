import { useState } from "react";
import { getToken } from "../api/auth";

const API_URL = import.meta.env.VITE_API_URL;

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId] = useState("demo-session");

  async function handleSubmit(event) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: text,
    };

    const assistantMessage = {
      role: "assistant",
      content: "",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("No se pudo conectar con el backend.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;

        const chunk = decoder.decode(value || new Uint8Array(), {
          stream: !done,
        });

        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "");

          if (data === "[DONE]") {
            finished = true;
            break;
          }

          const cleanData = data.replaceAll("\\n", "\n");

          setMessages((currentMessages) => {
            const updatedMessages = [...currentMessages];
            const lastIndex = updatedMessages.length - 1;

            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              content: updatedMessages[lastIndex].content + cleanData,
            };

            return updatedMessages;
          });
        }
      }
    } catch {
      setError("Error de conexión con el backend.");

      setMessages((currentMessages) => {
        const updatedMessages = [...currentMessages];
        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          role: "assistant",
          content: "No se pudo obtener respuesta del agente.",
        };

        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat">
      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">Escribe un mensaje para empezar.</p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "user" ? "message-user" : "message-assistant"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          placeholder="Escribe tu mensaje..."
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}