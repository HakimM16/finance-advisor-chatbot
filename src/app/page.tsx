'use client';
import './styles.css';
import styles from './styles.module.css'

import Image from 'next/image';
import Chat from './components/Chat';

export default function Home() {
  return (
    <main className='App'>
        <div className="header">
          <Image src='/images/finance_advisor_logo.png' alt='logo' width={200} height={200} className={styles.logo_image}/>
          <Image src='/images/slogan.png' alt='slogan' width={200} height={200} className={styles.slogan_image}/>
        </div>
      <div className="container">
        <Chat />
      </div>
    </main>
  )
}