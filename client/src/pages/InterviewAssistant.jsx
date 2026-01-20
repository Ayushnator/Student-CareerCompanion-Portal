import { useState, useEffect, useRef } from 'react';
import { sendMessage, getHistory, clearHistory } from '../api/ai';
import { useAuth } from '../contexts/AuthContext';

export default function InterviewAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await getHistory('interviewer');
      const history = data.data.history.filter(m => m.role !== 'system');
      setMessages(history);
      if (history.length > 0) {
        setIsInterviewActive(true);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setInitializing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startInterview = async () => {
    if (!role.trim()) return;
    setLoading(true);
    try {
      // Clear previous interview history to start fresh
      await clearHistory('interviewer');
      setMessages([]);
      
      // Send first message to trigger AI introduction
      const context = role;
      const data = await sendMessage("Hello, I am ready for the interview.", 'interviewer', context);
      
      const assistantMessage = { role: 'assistant', content: data.data.response };
      setMessages([assistantMessage]);
      setIsInterviewActive(true);
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(userMessage.content, 'interviewer');
      const assistantMessage = { role: 'assistant', content: data.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!window.confirm('End current interview? History will be cleared.')) return;
    try {
        await clearHistory('interviewer');
        setMessages([]);
        setIsInterviewActive(false);
        setRole('');
    } catch (error) {
        console.error(error);
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-gray-500">Loading Interview Assistant...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
            🎤 AI Mock Interviewer
          </h1>
          <p className="text-sm text-gray-500">Practice technical interviews for any role</p>
        </div>
        {isInterviewActive && (
            <button
                onClick={handleEndInterview}
                className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded transition-colors w-full sm:w-auto"
            >
                End Interview
            </button>
        )}
      </header>

      {/* Setup Screen */}
      {!isInterviewActive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Start New Interview</h2>
                  <p className="text-gray-600 mb-6">Enter the job role or topic you want to practice (e.g., "Frontend Developer", "Data Scientist", "Python Expert").</p>
                  
                  <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior React Developer"
                    className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  
                  <button 
                    onClick={startInterview}
                    disabled={loading || !role.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                      {loading ? 'Starting...' : 'Start Interview'}
                  </button>
              </div>
          </div>
      ) : (
        /* Chat Area */
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                        msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                    >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                </div>
                ))}
                {loading && (
                <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
                </form>
            </div>
        </>
      )}
    </div>
  );
}
