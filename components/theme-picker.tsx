'use client';

import {useEffect,useState} from 'react';

type Theme = 'light' | 'classic';

const choices: {id:Theme; name:string; description:string}[] = [
 {id:'light',name:'Light',description:'Clean white with a blue accent'},
 {id:'classic',name:'Classic',description:'Original navy and gold journal'},
];

export function ThemePicker(){
 const [theme,setTheme]=useState<Theme>('light');
 useEffect(()=>{queueMicrotask(()=>setTheme(document.documentElement.dataset.moonstarTheme==='classic'?'classic':'light'))},[]);
 function choose(next:Theme){
  document.documentElement.setAttribute('data-moonstar-theme',next);
  setTheme(next);
  try{localStorage.setItem('moonstar-theme',next)}catch{}
 }
 return <div className="settings-block theme-preference">
  <h3>Theme</h3>
  <p>Choose how MOONSTAR looks on this browser.</p>
  <div className="theme-options" role="group" aria-label="Theme">
   {choices.map(choice=><button key={choice.id} type="button" className={`theme-option theme-option--${choice.id}`} aria-pressed={theme===choice.id} onClick={()=>choose(choice.id)}>
    <span className="theme-preview" aria-hidden="true"><span className="theme-preview-header"/><span className="theme-preview-heading"/><span className="theme-preview-cards"><i/><i/><i/></span></span>
    <span className="theme-option-copy"><strong>{choice.name}</strong><small>{choice.description}</small></span>
    <span className="theme-option-check" aria-hidden="true">{theme===choice.id?'✓':''}</span>
   </button>)}
  </div>
 </div>
}
