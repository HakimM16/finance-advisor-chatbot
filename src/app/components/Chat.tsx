import { useChat } from 'ai/react';
import Image from 'next/image';
import { use, useEffect, useRef, useState } from 'react';

const Chat = () => {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/openai',
    });
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

    const renderResponse = () => {
        return (
            <div className="response">
                {messages.map((m, index) => (
                    <div key={m.id} className={`chat-line ${m.role === 'user' ? 'user-chat' : 'ai-chat'}`}>
                        <Image className='avatar' alt='avatar' src={m.role === 'user' ? '/images/user-avatar.png' : '/images/lcb-avatar.png'} width={100} height={100}/>
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
        <div ref={chatContainer} className="Chat">
            {renderResponse()}
            <form onSubmit={handleSubmit} className="mainForm">
                <input type="text" name='input-field' placeholder='Say anything' onChange={handleInputChange} value={input}/>
                <button type='submit' className='mainButton' />
            </form>
        </div>
    )
}

export default Chat;