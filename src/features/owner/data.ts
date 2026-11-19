import { dishes, dishLabel, categoryLabel } from '@/features/menu/menu';
export type Order = { id: string; day: number; hour: number; item: number; quantity: number; amount: number; customer: string; channel: string; payment: string; status: string; table: number };
export type RecordRow = { id: string; [key: string]: string };
export type Workspace = { orders: Order[]; menu: RecordRow[]; inventory: RecordRow[]; expenses: RecordRow[]; staff: RecordRow[]; offers: RecordRow[]; reservations: RecordRow[]; feedback: RecordRow[]; website: RecordRow[] };
export const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const periods = { Daily: 1, Weekly: 7, Monthly: 30, Yearly: 365 };
export type Period = keyof typeof periods;
export function seedWorkspace(): Workspace {
  const menu = dishes.map(d => ({ id: String(d.id), name: dishLabel(d.name), category: categoryLabel(d.category), price: d.price.replace(/^from/, ''), available: 'Available' }));
  const popular = [254, 33, 9, 1, 2, 250, 100, 35, 14, 20];
  const orders: Order[] = [];
  for (let day = 0; day < 730; day++) {
    const total = 18 + (day * 13 % 23) + (day % 7 > 4 ? 18 : 0);
    for (let i = 0; i < total; i++) {
      const item = popular[(i * 7 + day) % popular.length];
      const dish = menu.find(d => Number(d.id) === item)!;
      const quantity = 1 + ((day + i) % 3 === 0 ? 1 : 0);
      const status = day === 0 && i > total - 7 ? 'Pending' : (i + day) % 29 === 0 ? 'Refunded' : (i + day) % 17 === 0 ? 'Cancelled' : 'Completed';
      orders.push({ id: `PC${String(day * 100 + i + 1).padStart(6, '0')}`, day, hour: 9 + ((i * 3 + day) % 13), item, quantity, amount: Number(dish.price) * quantity, customer: `Guest ${day < 14 && i % 7 === 0 ? 481 + day * 100 + i : 1 + (day * 7 + i * 11) % 480}`, channel: ['Dine-in', 'Dine-in', 'Takeaway', 'Online'][i % 4], payment: ['UPI', 'UPI', 'Cash', 'Card', 'Online'][i % 5], status, table: 1 + i % 15 });
    }
  }
  return { menu, orders,
    inventory: [ ['Coffee beans','kg','3','5','1100'], ['Whole milk','litres','8','12','65'], ['Mozzarella','kg','6','3','520'], ['Burger buns','pieces','18','25','15'], ['Pizza flour','kg','22','8','60'], ['Chicken','kg','12','5','280'], ['Matcha powder','kg','2','1','2200'] ].map((x,i)=>({id:'stock'+i,name:x[0],unit:x[1],stock:x[2],minimum:x[3],cost:x[4]})),
    expenses: [['Ingredients','18400','Variable'],['Team wages','12000','Fixed'],['Rent','8000','Fixed'],['Utilities','2400','Variable'],['Packaging','1800','Variable']].map((x,i)=>({id:'exp'+i,name:x[0],amount:x[1],type:x[2]})),
    staff: [['Ananya Rao','Café manager','09:00–17:00','Present'],['Arjun Nair','Head chef','10:00–18:00','Present'],['Meera Shah','Barista','08:00–16:00','Present'],['Kabir Das','Waiter','14:00–22:00','Off duty']].map((x,i)=>({id:'staff'+i,name:x[0],role:x[1],shift:x[2],attendance:x[3]})),
    offers: [{id:'offer1',name:'A little coffee break',code:'COFFEE15',discount:'15',status:'Active'},{id:'offer2',name:'Weekend at our table',code:'WEEKEND10',discount:'10',status:'Paused'}],
    reservations: [{id:'booking1',name:'Riya Sharma',people:'4',table:'3',time:'19:00',status:'Confirmed'},{id:'booking2',name:'Aditya Menon',people:'2',table:'7',time:'19:30',status:'Confirmed'},{id:'booking3',name:'Sara Khan',people:'4',table:'12',time:'20:00',status:'Pending'}],
    feedback: [{id:'review1',name:'Riya S.',rating:'5',dish:'Cappuccino',review:'The coffee and the little details made our morning. Coming back soon!',status:'New'},{id:'review2',name:'Aditya M.',rating:'4',dish:'Harbour Pizza',review:'Beautiful flavours. A little longer wait than expected on Saturday.',status:'New'},{id:'review3',name:'Sara K.',rating:'5',dish:'Chicken Crunchy Burger',review:'Crispy, generous and absolutely worth the visit.',status:'Reviewed'},{id:'review4',name:'Vikram P.',rating:'2',dish:'Cheese Sandwich',review:'Our sandwich arrived cold. Please check serving times.',status:'Needs follow-up'}],
    website: [{id:'site',name:'Parichayam Café',banner:'Good food. Better company.',featured:'Harbour Pizza, Silky Cappuccino',hours:'09:00–22:00',contact:'+91 90000 00000'}] };
}
export function periodOrders(orders: Order[], period: Period, previous = false) {
  const days = periods[period]; return orders.filter(o => o.day >= (previous ? days : 0) && o.day < days * (previous ? 2 : 1));
}
export function summarize(orders: Order[]) {
  const completed = orders.filter(o=>o.status==='Completed');
  const revenue = completed.reduce((sum,o)=>sum+o.amount,0);
  return { revenue, completed: completed.length, pending: orders.filter(o=>o.status==='Pending').length, cancelled: orders.filter(o=>o.status==='Cancelled').length, refunded: orders.filter(o=>o.status==='Refunded').length, average: completed.length ? revenue/completed.length : 0 };
}
export function csvDownload(filename: string, rows: (string|number)[][]) {
  const csv = rows.map(row=>row.map(value=>{ let s=String(value); if (/^[\s]*[=+@-]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; }).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
