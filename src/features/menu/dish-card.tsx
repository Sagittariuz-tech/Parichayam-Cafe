import Image from 'next/image';
import { categoryLabel, dietaryLabels, dishLabel, photoPath, priceLabel, type Dish } from './menu';

interface DishCardProps {
  dish: Dish;
  showCategory: boolean;
  onSelect: (dish: Dish) => void;
}

export default function DishCard({ dish, showCategory, onSelect }: DishCardProps) {
  return (
    <article className="card">
      <button type="button" aria-haspopup="dialog" onClick={() => onSelect(dish)}>
        <span className="card-image">
          <Image src={photoPath(dish.id)} alt="" width={380} height={380} unoptimized />
        </span>
        <span className="card-copy">
          {showCategory && <span className="card-category">{categoryLabel(dish.category)}</span>}
          <span className="card-name">{dishLabel(dish.name)}</span>
          <span className="card-meta">
            <span className="card-price">
              {priceLabel(dish.price)}
              {dish.diet && <span className="diet-mark" data-diet={dish.diet} role="img" aria-label={dietaryLabels[dish.diet]} title={dietaryLabels[dish.diet]} />}
            </span>
            <span className="card-arrow" aria-hidden="true">↗</span>
          </span>
        </span>
      </button>
    </article>
  );
}

