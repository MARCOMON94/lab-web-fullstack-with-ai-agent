import { Chat } from "../components/Chat";
import { useAuth } from "../context/AuthContext";

export function ChatPage() {
  const { logout } = useAuth();

  return (
    <main className="page">
      <section className="card chat-page">
        <header className="chat-header">
          <div>
            <h1>Chat con agente IA</h1>
            <p>Agente LangGraph conectado al backend FastAPI.</p>
          </div>

          <button type="button" onClick={logout}>
            Salir
          </button>
        </header>

        <Chat />
      </section>
    </main>
  );
}