import type {Metadata} from 'next';
import {Analytics} from '@vercel/analytics/next';
import './globals.css';
import './journal-theme.css';
export const metadata:Metadata={title:'MOONSTAR | Stock Journal',description:'MOONSTAR: your US and Thai stock journal prices, analyst targets, valuation, quarterly earnings, and company news.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}<Analytics /></body></html>}
