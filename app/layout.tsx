import type {Metadata} from 'next';
import {PrivacyControls} from '@/components/legal/privacy-controls';
import {LanguageRuntime} from '@/components/language-runtime';
import './globals.css';
import './journal-theme.css';
export const metadata:Metadata={title:'MOONSTAR | Stock Journal',description:'MOONSTAR: your US and Thai stock journal prices, analyst targets, valuation, quarterly earnings, and company news.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}<LanguageRuntime/><PrivacyControls /></body></html>}
