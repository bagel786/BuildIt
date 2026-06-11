import { useState, useRef, useEffect } from 'react';
import { chatWithMentor } from '../services/claudeService';
import { fileToDataUrl, resizeImageToBase64 } from '../utils/imageUtils';

export function ProjectChat({ project, language, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! I'm your BuildIt mentor for "${project.title}" 🔧 Ask me anything, or snap a photo of your progress and I'll guide you through the next step!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, base64 }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const base64 = await resizeImageToBase64(dataUrl);
    setPendingImage({ dataUrl, base64 });
    e.target.value = '';
  };

  const send = async () => {
    if (!input.trim() && !pendingImage) return;
    setError(null);

    const userMsg = {
      role: 'user',
      content: input.trim() || 'What do you see? What should I do next?',
      image: pendingImage?.base64 || null,
      imagePreview: pendingImage?.dataUrl || null,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    try {
      const reply = await chatWithMentor(newHistory, project, userMsg.image, language);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface md:items-center md:justify-center">
      {/* Backdrop for desktop */}
      <div className="hidden md:block absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Chat panel */}
      <div className="relative md:w-[480px] md:h-[680px] md:rounded-2xl flex flex-col h-full bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-md py-sm flex items-center gap-sm flex-shrink-0">
          <button onClick={onClose} className="text-on-primary hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-headline-md text-[16px] text-on-primary font-bold truncate">{project.title}</p>
            <p className="font-label-caps text-label-caps text-on-primary/70 uppercase">AI Mentor</p>
          </div>
          <span
            className="material-symbols-outlined text-on-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-md py-sm space-y-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-sm ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-on-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              )}
              <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-xs`}>
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="your photo"
                    className="rounded-xl max-h-40 object-cover border border-outline-variant"
                  />
                )}
                {msg.content && (
                  <div
                    className={`px-sm py-xs rounded-2xl font-body-md text-body-md leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-sm'
                        : 'bg-surface-container text-on-surface rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="bg-surface-container px-sm py-xs rounded-2xl rounded-tl-sm flex gap-xs items-center">
                <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <p className="text-center font-body-md text-[14px] text-error">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-md pb-xs flex items-center gap-sm flex-shrink-0">
            <div className="relative">
              <img src={pendingImage.dataUrl} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-outline-variant" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            </div>
            <p className="font-body-md text-[14px] text-on-surface-variant">Photo ready to send</p>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-outline-variant px-md py-sm flex gap-sm items-end flex-shrink-0 bg-surface-container-lowest">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
            aria-label="Attach photo"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImagePick}
            className="hidden"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question or describe your problem…"
            rows={1}
            className="flex-1 bg-surface-container rounded-2xl px-sm py-xs font-body-md text-body-md text-on-surface resize-none outline-none border border-outline-variant focus:border-primary transition-colors max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={send}
            disabled={loading || (!input.trim() && !pendingImage)}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary-container transition-colors flex-shrink-0"
            aria-label="Send"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
