import source from '../data/menu.json';

export const orderUrl = 'https://qubillo.com/qr-menu/1956e5b7-2ed0-49db-aca0-453b35c82cf7';

export const dietaryLabels = { V: 'Vegetarian', N: 'Non-vegetarian', E: 'Contains egg' };
export type Diet = keyof typeof dietaryLabels | '';

interface MenuItem {
  id: number;
  name: string;
  diet: Diet;
  price: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  items: MenuItem[];
}

export interface Dish extends MenuItem {
  categoryId: number;
  category: string;
}

export const categories = source as Category[];
export const dishes: Dish[] = categories.flatMap(category => category.items.map(item => ({
  ...item,
  categoryId: category.id,
  category: category.name,
})));

const categoryNames = new Map([
  ['hot coffees', 'Hot Coffees'],
  ['Choco Based Hot Drinks', 'Hot Chocolate'],
  ['COFFEE FLAVOURS', 'Coffee Flavours'],
  ["Maggie's", 'Maggi Noodles'],
  ['MEXICAN STATERS', 'Mexican Starters'],
]);

const spelling = new Map([
  ['CHACO LAVA WITH ICE CREAM', 'Choco Lava with Ice Cream'],
  ['VENNILA ICE CREAM', 'Vanilla Ice Cream'],
  ['mixed berry thickshek', 'Mixed Berry Thick Shake'],
  ['SCHEZWAN EGG FIREDRICE', 'Schezwan Egg Fried Rice'],
  ['veg friedrice', 'Veg Fried Rice'],
  ['PANNER WITH STEAMED VEGGIES', 'Paneer with Steamed Veggies'],
  ['TAKE AWAY', 'Takeaway'],
  ['takeawy', 'Takeaway'],
  ['DIET COKE', 'Diet Coke'],
  ['Rr chicken', 'RR Chicken'],
  ['PANNER 65', 'Paneer 65'],
]);

export function categoryLabel(name: string) {
  return categoryNames.get(name) ?? name;
}

export function dishLabel(name: string) {
  return spelling.get(name) ?? name.replace(/\s+/g, ' ')
    .replace(/(^|\s)(\p{L})([\p{L}-]*)/gu, (_, space: string, initial: string, rest: string) =>
      space + initial.toUpperCase() + rest.toLowerCase()
    )
    .replace(/\bKfc\b/g, 'KFC')
    .replace(/\bBbq\b/g, 'BBQ')
    .replace(/\bNon-veg\b/gi, 'Non-Veg');
}

export function priceLabel(price: string) {
  return price.startsWith('from') ? 'From ₹' + price.slice(4) : '₹' + price;
}

export function photoPath(id: number) {
  return '/media/' + id + '.webp';
}

export function normalizeSearch(value: string) {
  return value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const searchIndex = dishes.map(dish => ({
  dish,
  text: normalizeSearch([dish.name, dishLabel(dish.name), dish.category, categoryLabel(dish.category), dish.description].join(' ')),
}));

export function filterDishes(category: number, diet: Diet, search: string) {
  const terms = normalizeSearch(search).split(' ').filter(Boolean);
  return searchIndex.filter(({ dish, text }) =>
    (!category || dish.categoryId === category) &&
    (!diet || dish.diet === diet) &&
    terms.every(term => text.includes(term))
  ).map(({ dish }) => dish);
}

export const featuredDishes = [
  'Parichayam Harbour Pizza', 'Silky Cappuccino', 'Strawberry Matcha', 'Chicken Crunchy Burger',
  'Tropical Sunrise Mojito', 'Brownie with Ice Cream',
].flatMap(name => dishes.filter(dish => dish.name === name));

export const quickCategories = [
  'Parichayam Specials', 'Pizza', 'hot coffees', 'Burgers', 'Iced Matcha Bloom',
  'Pasta', 'Rice Bowls', 'Desserts', 'Sandwiches', 'Chinese Starters',
].flatMap(name => categories.filter(category => category.name === name));
