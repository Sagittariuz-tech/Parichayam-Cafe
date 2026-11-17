import source from '@/data/dish-editorial.json';

interface DishEditorial {
  description: string;
  suggestions: string[];
}

const editorial: Record<string, DishEditorial> = source;

export function dishEditorial(name: string) {
  return editorial[name];
}
