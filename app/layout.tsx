import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Market After Hours | US Stock Journal',description:'Your US stock journal: prices, analyst targets, valuation, quarterly earnings, and company news.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
