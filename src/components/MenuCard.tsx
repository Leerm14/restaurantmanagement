import React from "react";
import "./Components.css";
import Button from "./Button.tsx";

interface MenuCardProps {
  image: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  alt?: string;
  onAddToCart?: (item: { title: string; price: string; image: string }) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  image,
  title,
  description,
  price,
  category,
  alt,
  onAddToCart,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ title, price: price.toString(), image });
    }
  };

  return (
    <div className="menu-item">
      <div className="menu-image">
        <img src={image} alt={alt || title} />
      </div>
      <div className="menu-info">
        {category && <span className="menu-category">{category}</span>}
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="price-action">
          <span className="price">{formatPrice(price)}</span>
          <Button variant="primary" onClick={handleAddToCart}>
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
