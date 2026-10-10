import Link from 'next/link';
import {legalIdentityReady,privacyEmail,operatorCountry,policyVersion} from '@/lib/legal';
import './legal.css';
import {OperatorName} from './operator-name';
export function LegalPage({title,children}:{title:string;children:React.ReactNode}){
 return <main className="legal-page"><article className="legal-card"><Link className="legal-brand" href="/">✦ MOONSTAR</Link><h1>{title}</h1><p className="legal-date">Updated {policyVersion}</p>{!legalIdentityReady&&<p className="legal-notice" role="status">Development draft · Operator identity and contact details must be completed before commercial launch.</p>}{children}<section><h2>Operator</h2><p><OperatorName/> · {operatorCountry||'Country pending confirmation'}</p><p>{privacyEmail?<a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>:'Contact address pending publication. Self-service account export is available under Account & privacy.'}</p></section><nav className="legal-links" aria-label="Legal navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/data-methodology">Data & methodology</Link><Link href="/account">Account & privacy</Link><Link href="/">Back to dashboard</Link></nav></article></main>;
}
