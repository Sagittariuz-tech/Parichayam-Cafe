import { useEffect, useRef, type ReactNode } from 'react';
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string,ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h3"/></>,
    moon: <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>,
    stock: <><path d="m3 7 9-4 9 4v11l-9 4-9-4Zm0 0 9 5 9-5M12 12v10M7 5l10 5"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    check: <path d="m5 12 4 4 10-10"/>,
    alert: <><path d="m12 3 10 18H2Z"/><path d="M12 9v5m0 3v1"/></>,
    plus: <path d="M12 4v16M4 12h16"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.check}</svg>;
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) { return <span className={'staff-badge ' + tone}>{children}</span>; }
export function Empty({ title, children }: { title: string; children: ReactNode }) { return <div className="staff-empty"><Icon name="calendar" size={30}/><h3>{title}</h3><p>{children}</p></div>; }
export function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="staff-panel"><div className="staff-panel-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>{children}</section>;
}
export function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="staff-modal" data-lenis-prevent onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const r=e.currentTarget.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose(); } }} aria-labelledby="staff-modal-title"><header><div><p className="staff-eyebrow">YOUR STAFF WORKSPACE</p><h2 id="staff-modal-title">{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="staff-icon-button" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></header>{children}</dialog>;
}
export function exportCSV(name: string, rows: (string|number)[][]) {
  const csv = [['DEMO STAFF RECORDS — saved in this browser'],...rows].map(row => row.map(v => { let s=String(v); if (/^[\s]*[=+@-]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; }).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=name+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
