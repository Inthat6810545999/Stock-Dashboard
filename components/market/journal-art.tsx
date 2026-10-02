/** Decorative print elements; deliberately separate from financial data and controls. */
export function CompassMark({className=''}:{className?:string}){
 return <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth=".7"/><circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth=".5" strokeDasharray="1 4"/><path d="M40 1 47 29 68 12 51 33 79 40 51 47 68 68 47 51 40 79 33 51 12 68 29 47 1 40 29 33 12 12 33 29Z" fill="currentColor"/><path d="M40 7V73M7 40H73M17 17 63 63M63 17 17 63" stroke="#8ba6c7" strokeWidth=".8"/><circle cx="40" cy="40" r="3" fill="#f1e5cf"/></svg>
}
