import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState<Array<{ role: string; content: string; id: string }>>([]);
    const [input, setInput] = useState('');
    const chatContainer = useRef<HTMLDivElement>(null);
    
    const scroll = () => {
        const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current as HTMLDivElement;
        if (scrollHeight >= scrollTop + offsetHeight) {
            chatContainer.current?.scrollTo(0, scrollHeight + 200)
        }
    }

    useEffect(() => {
        scroll();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            role: 'user',
            content: input,
            id: Date.now().toString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            });

            if (!response.ok) throw new Error('Response not ok');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const assistantMessage = {
                role: 'assistant',
                content: '',
                id: (Date.now() + 1).toString()
            };

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                assistantMessage.content = data.fullResponse;
                                console.log('Received chunk:', data.content);
                                
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const assistantIndex = newMessages.findIndex(m => m.id === assistantMessage.id);
                                    if (assistantIndex === -1) {
                                        newMessages.push({ ...assistantMessage });
                                    } else {
                                        newMessages[assistantIndex] = { ...assistantMessage };
                                    }
                                    return newMessages;
                                });
                            } catch (e) {
                                console.error('Error parsing SSE data:', e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderResponse = () => {
        return (
            <div className="response">
                {messages.map((m, index) => (
                    <div key={m.id} className={`chat-line ${m.role === 'user' ? 'user-chat' : 'ai-chat'}`}>
                        <Image 
                            className='avatar' 
                            alt='avatar' 
                            src={m.role === 'user' ? '/images/shadow_avatar.png' : '/images/finance_bot_avatar.png'} 
                            width={100} 
                            height={100}
                        />
                        <div style={{width: '100%', marginLeft: '16px'}}>
                            <p className="message">{m.content}</p>
                            {index < messages.length - 1 && <div className="horizontal-line" />}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div ref={chatContainer} className="Chat" style={{ backgroundColor: '#13111C', transition: 'background-color 3s' }}>
            {renderResponse()}
            <form onSubmit={handleSubmit} className="mainForm">
                <input 
                    type="text" 
                    name='input-field' 
                    placeholder='Say anything' 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type='submit' className='mainButton'>
                    &#62;
                </button>
            </form>
        </div>
    )
}

export default Chat;