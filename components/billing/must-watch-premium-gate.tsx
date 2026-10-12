import Link from 'next/link';
import {ArrowRight,LockKeyhole,RefreshCw,Stars} from 'lucide-react';

type Props={access:'checking'|'unpaid'|'unknown';signedIn:boolean;language:'en'|'th';onCheckMembership:()=>void};

const screens=[
 {en:'Top 10 · Biggest gainers today',th:'10 อันดับ · หุ้นขึ้นสูงสุดวันนี้'},
 {en:'Top 10 · Biggest gainers over 1 year',th:'10 อันดับ · ผลตอบแทนราคาสูงสุดย้อนหลัง 1 ปี'},
 {en:'Growth / Forward P/E · market cap ≥ $1B',th:'เติบโต / Forward P/E · มูลค่าตลาด ≥ $1B'},
 {en:'Growth / Forward P/E · all company sizes',th:'เติบโต / Forward P/E · ทุกขนาดบริษัท'},
];

export function MustWatchPremiumGate({access,signedIn,language,onCheckMembership}:Props){
 const th=language==='th';
 const checking=access==='checking';
 const title=checking
  ?(th?'กำลังตรวจสอบสมาชิก':'Checking membership')
  :access==='unknown'
   ?(th?'ตรวจสอบสมาชิกไม่สำเร็จ':'Membership status unavailable')
   :(th?'Must Watch สำหรับสมาชิก Premium':'Must Watch is for Premium members');
 return <section className="must-watch panel must-watch-paywall" id="must-watch" aria-labelledby="must-watch-title">
  <div className="must-watch-paywall-art" aria-hidden="true"><div className="paywall-orbit paywall-orbit-one"/><div className="paywall-orbit paywall-orbit-two"/><span className="paywall-star paywall-star-one">✦</span><span className="paywall-star paywall-star-two">✧</span></div>
  <div className="must-watch-paywall-content">
   <p className="eyebrow">TOPPICKSTOCK <span>·</span> PREMIUM RESEARCH</p>
   <div className="must-watch-paywall-title"><span className="premium-mark"><Stars size={19}/></span><h1 id="must-watch-title">{title}</h1></div>
   <p className="must-watch-paywall-description">{checking
    ?(th?'รอสักครู่ ระบบกำลังตรวจสอบสถานะสมาชิกของบัญชีนี้':'Please wait while we verify this account’s membership.')
    :access==='unknown'
     ?(th?'ตอนนี้ยืนยันสิทธิ์สมาชิกไม่ได้ รายการหุ้นยังถูกล็อกไว้':'We could not verify membership right now, so the rankings remain locked.')
     :(th?'ปลดล็อก 4 อันดับหุ้นทั่วตลาด: หุ้นขึ้นวันนี้, ผลตอบแทน 1 ปี และหุ้นเติบโตเทียบมูลค่าสำหรับบริษัทใหญ่หรือทุกขนาด':'Unlock four market-wide rankings: today’s gainers, one-year price returns, and growth-to-value screens for large companies or any size.')}</p>
   <div className="premium-screen-list" aria-label={th?'หน้าจอที่ต้องใช้สมาชิก Premium':'Screens included with Premium'}>
    {screens.map((screen,index)=><Link className="premium-screen-row" href="/pricing#plans" key={screen.en}><span className="premium-screen-index">0{index+1}</span><span>{th?screen.th:screen.en}</span><LockKeyhole size={15} aria-hidden="true"/></Link>)}
   </div>
   <p className="premium-method-note">{th?'อันดับเติบโตต้องมียอดขายโตอย่างน้อย 10% ต่อปี และ P/E กับ Forward P/E เป็นบวกไม่เกิน 25 เท่า จากนั้นเรียงยอดขายเติบโต ÷ Forward P/E':'Growth screens require at least 10% YoY sales growth and positive P/E and Forward P/E at or below 25, then rank sales growth ÷ Forward P/E.'}</p>
   <div className="must-watch-paywall-actions">
    {access==='unknown'
     ?<button className="premium-primary" type="button" onClick={onCheckMembership}>{th?'ลองตรวจสอบอีกครั้ง':'Try membership check again'} <RefreshCw size={16}/></button>
     :<Link className="premium-primary" href={checking?'/pricing#plans':'/pricing#plans'}>{th?'ดูแพ็กเกจ Premium':'View Premium membership'} <ArrowRight size={16}/></Link>}
    {!signedIn&&<Link className="premium-secondary" href="/login">{th?'เข้าสู่ระบบ':'Log in'}</Link>}
   </div>
   <p className="premium-terms-note">{th?'ราคาต่ออายุและเงื่อนไขจะแสดงก่อนชำระเงิน · ยกเลิกได้จากหน้าสมาชิก':'Renewal price and terms are shown before payment · Manage or cancel in Settings'}</p>
  </div>
  <figure className="premium-sample-preview" role="group" aria-label={th?'ภาพจำลองหน้า Must Watch แสดง 6 อันดับและเปอร์เซ็นต์ตัวอย่างที่ไม่ใช่ผลตอบแทนจริง โดยซ่อนอันดับและราคาจริง':'Illustrative Must Watch preview showing six sample ranks and percentages, not actual returns; real rankings and prices are hidden'}>
   <div className="sample-window-bar"><span className="sample-brand-mark">T</span><span>TOPPICKSTOCK <i>/</i> MUST WATCH</span><span className="sample-preview-tag">{th?'ตัวเลขจำลอง':'ILLUSTRATIVE VALUES'}</span></div>
   <div className="sample-tab-row"><span className="sample-tab-active">{th?'วันนี้':'TODAY'}</span><span>1Y</span><span>{th?'เติบโต / มูลค่า':'GROWTH / VALUE'}</span></div>
   <div className="sample-board-heading"><div><small>{th?'อันดับตลาดสหรัฐฯ':'US MARKET RANKING'}</small><strong>{th?'หุ้นขึ้นสูงสุดวันนี้':'Top 10 · Biggest gainers today'}</strong></div><span className="sample-top-count">TOP 10</span></div>
   <p className="sample-disclaimer">{th?'เปอร์เซ็นต์ตัวอย่าง · ไม่ใช่ผลตอบแทนจริง':'Sample percentages · Not actual returns'}</p>
   <div className="sample-rank-grid" aria-hidden="true">{['+2,570.67%','+499.51%','+50.45%','+47.29%','+41.47%','+35.29%'].map((change,index)=><article className="sample-rank-card" key={index}><div className="sample-rank-card-top"><span className="sample-rank-number">{String(index+1).padStart(2,'0')}</span><span className="sample-company-mark"/><span className="sample-company-lines"><i/><i/></span><LockKeyhole size={12}/></div><strong className="sample-card-return">{change}</strong><div className="sample-card-change"><i/><i/></div><div className="sample-card-prices"><span/><b>→</b><span/></div></article>)}</div>
   <Link className="sample-lock-caption" href="/pricing#plans" aria-label={th?'ดูแพ็กเกจ Premium เพื่อปลดล็อกอันดับ':'View Premium plans to unlock rankings'}><LockKeyhole size={16}/><span>{th?'ปลดล็อกอันดับทั้ง 10 และรายละเอียดหุ้นด้วย Premium':'Unlock all 10 ranks and stock details with Premium'}</span></Link>
   <figcaption>{th?'เปอร์เซ็นต์เป็นตัวอย่างจำลอง ไม่ใช่ผลตอบแทนจริง · ไม่มีราคาและอันดับหุ้นจริง':'Illustrative percentages only, not actual returns · no live prices or actual stock rankings shown'}</figcaption>
  </figure>
 </section>;
}
