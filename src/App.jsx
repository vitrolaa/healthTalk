import { useState, useEffect, useRef } from 'react';
import './index.css';
import { sendMessageToGemini, initializeConversation, clearConversation } from './gemini-api';
import { downloadConversationAsJSON } from './conversation-storage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Olá! Sou o Dr. Mente, seu assistente de saúde mental. Como posso ajudá-lo hoje?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize Gemini conversation on mount
  useEffect(() => {
    initializeConversation();
  }, []);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('healthtalk_session');
    if (session) {
      setIsLoggedIn(true);
      setCurrentPage('menu');
    }
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Simple validation (in production, this would be real authentication)
    if (email && password) {
      localStorage.setItem('healthtalk_session', JSON.stringify({ email }));
      setIsLoggedIn(true);
      setCurrentPage('menu');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('healthtalk_session');
    setIsLoggedIn(false);
    setCurrentPage('login');
    clearConversation();
    setMessages([
      {
        role: 'ai',
        text: 'Olá! Sou o Dr. Mente, seu assistente de saúde mental. Como posso ajudá-lo hoje?'
      }
    ]);
  };

  // Handle chat message submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await sendMessageToGemini(userMessage);

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      // Add error message]
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exit from chat (save conversation and clear)
  const handleExitChat = () => {
    // Only save if there are messages beyond the initial greeting
    if (messages.length > 1) {
      downloadConversationAsJSON(messages);
    }

    // Clear the chat and reset to initial state
    setMessages([
      {
        role: 'ai',
        text: 'Olá! Sou o Dr. Mente, seu assistente de saúde mental. Como posso ajudá-lo hoje?'
      }
    ]);

    // Clear the Gemini conversation history
    clearConversation();

    // Navigate back to menu
    navigateTo('menu');
  };

  // Navigation functions
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {/* Login Page */}
      {currentPage === 'login' && (
        <div id="login-page" className="page active">
          <div className="login-container">
            <div className="logo-container">
              <img src="/logo.png" alt="HealthTalk Logo" className="logo" />
              <h1 className="app-title">HealthTalk</h1>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" required />
              </div>

              <div className="input-group">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" name="password" placeholder="••••••••" required />
              </div>

              <button type="submit" className="btn btn-primary">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Menu Page */}
      {currentPage === 'menu' && (
        <div id="menu-page" className="page active">
          <div className="menu-container">
            <div className="menu-left">
              <div className="logo-container">
                <img src="/logo.png" alt="HealthTalk Logo" className="logo" />
                <h1 className="app-title">HealthTalk</h1>
              </div>
            </div>

            <div className="menu-right">
              <nav className="main-menu">
                <button className="menu-btn" onClick={() => navigateTo('chat')}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Vamos conversar?
                </button>

                <button className="menu-btn" onClick={() => navigateTo('tips')}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18h6M10 22h4M15 2a5 5 0 0 1 0 10H9a5 5 0 0 1 0-10h6zM12 2v10"></path>
                  </svg>
                  Dicas
                </button>

                <button className="menu-btn" onClick={() => navigateTo('about')}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4M12 8h.01"></path>
                  </svg>
                  Sobre
                </button>

                <button className="menu-btn" onClick={handleLogout}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
                  </svg>
                  Sair
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Chat Page */}
      {currentPage === 'chat' && (
        <div id="chat-page" className="page active">
          <div className="chat-container">
            <div className="chat-sidebar">
              <div className="logo-container">
                <img src="/logo.png" alt="HealthTalk Logo" className="logo-small" />
                <h2 className="app-title-small">HealthTalk</h2>
              </div>
              <button className="btn btn-secondary back-btn" onClick={handleExitChat}>Sair</button>
            </div>

            <div className="chat-main">
              <div className="chat-header">
                <h2>Dr. Mente</h2>
                <p className="chat-subtitle">Seu assistente de saúde mental</p>
              </div>

              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role === 'ai' ? 'ai-message' : 'user-message'}`}>
                    <div className="message-content">
                      <strong>{message.role === 'ai' ? 'Dr. Mente' : 'Você'}</strong>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai-message">
                    <div className="message-content">
                      <strong>Dr. Mente</strong>
                      <p><span className="loading"></span> Pensando...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="chat-input-container">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  autoComplete="off"
                  disabled={isLoading}
                />
                <button type="submit" className="btn btn-send" disabled={isLoading}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tips Page */}
      {currentPage === 'tips' && (
        <div id="tips-page" className="page active">
          <div className="tips-container">
            <div className="tips-header">
              <h1>Dicas de bem-estar</h1>
              <button className="btn btn-secondary back-btn" onClick={() => navigateTo('menu')}>Sair</button>
            </div>

            <div className="tips-content">
              <div className="tips-logo">
                <img src="/logo.png" alt="HealthTalk Logo" className="logo" />
                <h2 className="app-title">HealthTalk</h2>
              </div>

              <ul className="tips-list">
                <li>Beba água antes de qualquer tarefa: hidratação clareia a mente.</li>
                <li>Faça uma pausa de 3 minutos a cada 1 hora para respirar fundo.</li>
                <li>Organize seu espaço: bagunça externa vira bagunça mental.</li>
                <li>Diminua estímulos: abaixe o brilho da tela à noite.</li>
                <li>Se cobre menos: produtividade ≠ valor pessoal.</li>
                <li>Respire 4-1-6: inspire 4s, segure 1s, solte 6s.</li>
                <li>Faça 1 respiração profunda toda vez que trocar de aplicativo.</li>
                <li>Encontre um ritmo: respirações lentas regulam o sistema nervoso.</li>
                <li>Prenda o ar por 2 segundos após inspirar para reduzir tensão.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* About Page */}
      {currentPage === 'about' && (
        <div id="about-page" className="page active">
          <div className="about-container">
            <div className="about-header">
              <h1>Sobre o HealthTalk</h1>
              <button className="btn btn-secondary back-btn" onClick={() => navigateTo('menu')}>Sair</button>
            </div>

            <div className="about-content">
              <div className="about-logo">
                <img src="/logo.png" alt="HealthTalk Logo" className="logo-large" />
                <h2 className="app-title">HealthTalk</h2>
              </div>

              <div className="about-text">
                <h3>Sua Saúde Mental Importa</h3>
                <p>
                  O HealthTalk é um aplicativo dedicado ao cuidado da sua saúde mental.
                  Converse com o Dr. Mente, nosso assistente alimentado por inteligência
                  artificial, que está aqui para ouvir, apoiar e oferecer orientações.
                </p>
                <p>
                  Além do chat, oferecemos dicas práticas de bem-estar que você pode
                  incorporar no seu dia a dia para melhorar sua qualidade de vida e
                  saúde mental.
                </p>
                <p className="about-note">
                  <strong>Importante:</strong> O Dr. Mente é um assistente virtual e não
                  substitui o acompanhamento de profissionais de saúde mental. Em caso de
                  emergência, procure ajuda profissional imediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
