export type RequestStatus = 'Pending' | 'Approved' | 'Declined' | 'Cancelled';
export type Pause = { start: number; end?: number; kind: 'Break' | 'Off duty'; reason: string };
export type Shift = { id: string; date: string; start: number; end?: number; pauses: Pause[]; note: string; sample?: boolean };
export type Leave = { id: string; type: string; start: string; end: string; duration: 'Full day' | 'Half day'; reason: string; handover: string; status: RequestStatus; created: number; decision?: string };
export type OffDuty = { id: string; date: string; from: string; to: string; reason: string; handover: string; status: RequestStatus; created: number; decision?: string };
export type Ingredient = { id: string; name: string; category: string; unit: string; stock: number; minimum: number; location: string; supplier: string; cost: number };
export type Movement = { id: string; ingredientId: string; ingredient: string; unit: string; type: 'Received' | 'Used' | 'Wasted' | 'Stock count'; quantity: number; before: number; after: number; reason: string; batch: string; expiry: string; supplier: string; cost: number; created: number };
export type Replenishment = { id: string; ingredientId: string; ingredient: string; quantity: number; unit: string; priority: string; reason: string; status: RequestStatus; created: number; decision?: string };
export type StaffState = { version: 2; shifts: Shift[]; leave: Leave[]; offDuty: OffDuty[]; ingredients: Ingredient[]; movements: Movement[]; replenishments: Replenishment[] };
export const STAFF_KEY = 'parichayam-staff-operations-v2';
export const employee = { name: 'Meera Shah', initials: 'MS', role: 'Barista & café team', id: 'PC-003', shift: '09:00 – 17:00', station: 'Coffee bar' };
export const leaveTypes = ['Annual leave', 'Sick leave', 'Personal leave', 'Unpaid leave'];
export const leaveAllowances: Record<string, number> = { 'Annual leave': 18, 'Sick leave': 8, 'Personal leave': 6 };
export function localDate(now = Date.now()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function addDays(date: string, days: number) { return new Date(Date.parse(date + 'T12:00:00Z') + days * 86400000).toISOString().slice(0, 10); }
export function at(date: string, time: string) { return Date.parse(date + 'T' + time + ':00+05:30'); }
export function timeLabel(value?: number) { return value === undefined ? '—' : new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(value); }
export function dayLabel(date: string) { return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(at(date, '12:00')); }
export function durationLabel(ms: number) { const minutes = Math.max(0, Math.floor(ms / 60000)); return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`; }
export function netTime(shift: Shift, now = Date.now()) { const end = shift.end ?? now; return Math.max(0, end - shift.start - shift.pauses.reduce((sum, p) => sum + Math.max(0, (p.end ?? end) - p.start), 0)); }
export function leaveDays(row: Pick<Leave, 'start' | 'end' | 'duration'>) { return row.duration === 'Half day' ? .5 : Math.round((at(row.end, '12:00') - at(row.start, '12:00')) / 86400000) + 1; }
export function activeShift(state: StaffState) { return state.shifts.find(s => !s.end); }
export function livePause(shift?: Shift) { return shift?.pauses.find(p => p.end === undefined); }
const id = () => crypto.randomUUID();
function required(value: string, name: string, max = 500) { if (!value.trim() || value.trim().length > max) throw new Error(`${name} is required and must be at most ${max} characters.`); return value.trim(); }
function number(value: number, name: string, allowZero = false) { if (!Number.isFinite(value) || value < (allowZero ? 0 : .001) || value > 1000000) throw new Error(`Enter a valid ${name.toLowerCase()}.`); return Math.round(value * 1000) / 1000; }
function validDate(date: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(at(date, '12:00')) || localDate(at(date, '12:00')) !== date) throw new Error('Choose a valid date.'); }
const overlaps = (a: string, b: string, c: string, d: string) => a <= d && c <= b;
const reserved = (status: RequestStatus) => status === 'Pending' || status === 'Approved';
export function seedStaff(now = Date.now()): StaffState {
  const today = localDate(now);
  const shifts: Shift[] = [1,2,3,4,5].map((offset, index) => { const date = addDays(today, -offset); const start = at(date, index === 2 ? '09:12' : '08:58'); return { id: 'sample-shift-' + offset, date, start, end: at(date, '17:04'), pauses: [{ start: at(date, '13:00'), end: at(date, '13:30'), kind: 'Break', reason: 'Lunch' }], note: 'Sample attendance record', sample: true }; });
  return { version: 2, shifts, leave: [], offDuty: [], movements: [], replenishments: [], ingredients: [
    { id: 'beans', name: 'House blend coffee beans', category: 'Coffee & tea', unit: 'kg', stock: 3.2, minimum: 5, location: 'Dry store · A1', supplier: 'Coastal Roasters', cost: 1100 },
    { id: 'milk', name: 'Whole milk', category: 'Dairy', unit: 'litres', stock: 8, minimum: 12, location: 'Chiller · C1', supplier: 'Morning Dairy', cost: 65 },
    { id: 'cheese', name: 'Mozzarella', category: 'Dairy', unit: 'kg', stock: 6, minimum: 3, location: 'Chiller · C2', supplier: 'Morning Dairy', cost: 520 },
    { id: 'buns', name: 'Burger buns', category: 'Bakery', unit: 'pieces', stock: 18, minimum: 25, location: 'Bread rack · B1', supplier: 'Daily Bake', cost: 15 },
    { id: 'flour', name: 'Pizza flour', category: 'Dry goods', unit: 'kg', stock: 22, minimum: 8, location: 'Dry store · A2', supplier: 'Kitchen Provisions', cost: 60 },
    { id: 'chicken', name: 'Chicken breast', category: 'Protein', unit: 'kg', stock: 12, minimum: 5, location: 'Freezer · F1', supplier: 'Fresh Cuts', cost: 280 },
    { id: 'matcha', name: 'Ceremonial matcha', category: 'Coffee & tea', unit: 'kg', stock: .8, minimum: 1, location: 'Dry store · A1', supplier: 'Tea House', cost: 2200 },
    { id: 'butter', name: 'Unsalted butter', category: 'Dairy', unit: 'kg', stock: 4, minimum: 2, location: 'Chiller · C2', supplier: 'Morning Dairy', cost: 480 },
  ] };
}
export function clockAction(state: StaffState, action: 'in' | 'break' | 'off' | 'resume' | 'out', reason = '', now = Date.now()): StaffState {
  const current = activeShift(state);
  if (action === 'in') {
    if (current) throw new Error('You already have an open shift.');
    const date = localDate(now);
    if (state.shifts.some(s => s.date === date)) throw new Error('Today’s shift has already been recorded.');
    if (state.leave.some(r => r.status === 'Approved' && r.duration === 'Full day' && r.start <= date && r.end >= date)) throw new Error('You have approved leave today. Ask the owner to review it before checking in.');
    return { ...state, shifts: [{ id: id(), date, start: now, pauses: [], note: '' }, ...state.shifts] };
  }
  if (!current) throw new Error('Check in before changing your shift status.');
  const pause = livePause(current);
  let updated = { ...current, pauses: current.pauses.map(p => ({ ...p })) };
  if (action === 'break' || action === 'off') {
    if (pause) throw new Error('Return to duty before starting another break.');
    updated.pauses.push({ start: now, kind: action === 'break' ? 'Break' : 'Off duty', reason: required(reason, 'Reason', 240) });
  } else if (action === 'resume') {
    if (!pause) throw new Error('You are already on duty.');
    updated.pauses = updated.pauses.map(p => p.end === undefined ? { ...p, end: now } : p);
  } else {
    updated = { ...updated, end: now, note: reason.trim(), pauses: updated.pauses.map(p => p.end === undefined ? { ...p, end: now } : p) };
  }
  return { ...state, shifts: state.shifts.map(s => s.id === current.id ? updated : s) };
}
export function submitLeave(state: StaffState, input: Omit<Leave, 'id'|'status'|'created'|'decision'>, now = Date.now()): StaffState {
  validDate(input.start); validDate(input.end);
  if (!leaveTypes.includes(input.type)) throw new Error('Choose a leave type.');
  if (!['Full day','Half day'].includes(input.duration)) throw new Error('Choose a valid duration.');
  if (input.start < localDate(now) || input.end < input.start) throw new Error('Choose a future date range with the end on or after the start.');
  if (input.start.slice(0,4) !== input.end.slice(0,4)) throw new Error('Submit separate requests for different calendar years.');
  if (input.duration === 'Half day' && input.start !== input.end) throw new Error('Half-day leave must start and end on the same day.');
  if (leaveDays(input) > 30) throw new Error('Submit up to 30 calendar days per request.');
  if (state.leave.some(r => reserved(r.status) && overlaps(r.start,r.end,input.start,input.end))) throw new Error('You already have a leave request covering these dates.');
  if (state.offDuty.some(r => reserved(r.status) && r.date >= input.start && r.date <= input.end)) throw new Error('An off-duty request already covers this date. Cancel it first.');
  const allowance = leaveAllowances[input.type];
  const used = state.leave.filter(r => reserved(r.status) && r.type === input.type && r.start.slice(0,4) === input.start.slice(0,4)).reduce((sum,r) => sum + leaveDays(r), 0);
  if (allowance && used + leaveDays(input) > allowance) throw new Error('This request exceeds the available demo leave allowance.');
  return { ...state, leave: [{ ...input, reason: required(input.reason,'Reason'), handover: required(input.handover,'Handover plan'), id:id(), status:'Pending', created:now }, ...state.leave] };
}
export function submitOffDuty(state: StaffState, input: Omit<OffDuty,'id'|'status'|'created'|'decision'>, now = Date.now()): StaffState {
  validDate(input.date);
  if (![input.from,input.to].every(t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) throw new Error('Choose valid times.');
  if (at(input.date,input.from) <= now || input.to <= input.from) throw new Error('Choose a future interval ending after it starts.');
  if (state.offDuty.some(r => reserved(r.status) && r.date === input.date && r.from < input.to && r.to > input.from)) throw new Error('This overlaps an existing off-duty request.');
  if (state.leave.some(r => reserved(r.status) && input.date >= r.start && input.date <= r.end)) throw new Error('You already have leave requested for this date.');
  return { ...state, offDuty: [{ ...input, reason: required(input.reason,'Reason'), handover: required(input.handover,'Handover plan'), id:id(), created:now, status:'Pending' }, ...state.offDuty] };
}
export type MovementInput = Pick<Movement,'ingredientId'|'type'|'quantity'|'reason'|'batch'|'expiry'|'supplier'|'cost'>;
export function recordMovement(state: StaffState, input: MovementInput, now = Date.now()): StaffState {
  const item = state.ingredients.find(i => i.id === input.ingredientId);
  if (!item) throw new Error('Choose an ingredient.');
  if (!['Received','Used','Wasted','Stock count'].includes(input.type)) throw new Error('Choose a stock movement.');
  const quantity = number(input.quantity, 'Quantity', input.type === 'Stock count');
  if (item.unit === 'pieces' && !Number.isInteger(quantity)) throw new Error('Enter a whole number of pieces.');
  const after = Math.round((input.type === 'Stock count' ? quantity : item.stock + (input.type === 'Received' ? quantity : -quantity)) * 1000) / 1000;
  if (after < 0) throw new Error(`Only ${item.stock} ${item.unit} are available. Stock cannot be negative.`);
  if (input.type === 'Received') { required(input.supplier,'Supplier',100); required(input.batch,'Batch / invoice',100); number(input.cost,'Unit cost',true); }
  if (input.expiry) { validDate(input.expiry); if (input.expiry < localDate(now)) throw new Error('Received stock cannot have an expiry date in the past.'); }
  const movement: Movement = { ...input, quantity, reason:required(input.reason,'Movement note'), id:id(), ingredient:item.name, unit:item.unit, before:item.stock, after, created:now };
  return { ...state, ingredients:state.ingredients.map(i => i.id === item.id ? { ...i, stock:after, ...(input.type === 'Received' ? { supplier:input.supplier.trim(), cost:input.cost } : {}) } : i), movements:[movement,...state.movements] };
}
export function addIngredient(state: StaffState, input: Omit<Ingredient,'id'>): StaffState {
  const name = required(input.name,'Ingredient name',80);
  if (state.ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) throw new Error('This ingredient already exists. Record a stock movement instead.');
  if (!['kg','litres','pieces'].includes(input.unit)) throw new Error('Choose a supported unit.');
  const stock = number(input.stock,'Opening stock',true);
  if (input.unit === 'pieces' && !Number.isInteger(stock)) throw new Error('Opening stock must be whole pieces.');
  return { ...state, ingredients:[...state.ingredients,{ ...input, id:id(), name, stock, minimum:number(input.minimum,'Minimum stock',true), cost:number(input.cost,'Unit cost',true), category:required(input.category,'Category',80), location:required(input.location,'Storage location',100), supplier:required(input.supplier,'Supplier',100) }] };
}
export function requestStock(state: StaffState, ingredientId: string, quantity: number, priority: string, reason: string, now = Date.now()): StaffState {
  const item = state.ingredients.find(i => i.id === ingredientId);
  if (!item) throw new Error('Choose an ingredient.');
  number(quantity,'Requested quantity');
  if (item.unit === 'pieces' && !Number.isInteger(quantity)) throw new Error('Request a whole number of pieces.');
  if (state.replenishments.some(r => r.ingredientId === ingredientId && r.status === 'Pending')) throw new Error('This ingredient already has a pending request.');
  return { ...state, replenishments:[{id:id(),ingredientId,ingredient:item.name,unit:item.unit,quantity,priority,reason:required(reason,'Reason'),status:'Pending',created:now},...state.replenishments] };
}
export function decideRequest(state: StaffState, kind: 'leave'|'offDuty'|'replenishments', requestId: string, status: 'Approved'|'Declined'|'Cancelled', decision = ''): StaffState {
  const row = state[kind].find(r => r.id === requestId);
  if (!row || row.status !== 'Pending') throw new Error('This request is no longer pending.');
  return { ...state, [kind]: state[kind].map(r => r.id === requestId ? { ...r, status, decision:decision.trim() } : r) };
}
