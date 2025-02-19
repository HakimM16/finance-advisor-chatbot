'use client';
import './styles.css';

import Image from 'next/image';
import Chat from './components/Chat';

export default function Home() {
  return (
    <main className='App'>
      <div className="container">
        <div className="header">
          <Image src='/images/logo.png' alt='logo' width={100} height={100} />
        </div>
        <Chat />
      </div>
    </main>
  )
}