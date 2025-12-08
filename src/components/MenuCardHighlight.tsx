import React from "react";
import "./Components.css";
import Button from "./Button.tsx";

interface MenuCardHighlightProps {
  image: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  alt?: string;
  onAddToCart?: (item: { title: string; price: string; image: string }) => void;
}

const MenuCardHighlight: React.FC<MenuCardHighlightProps> = ({
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
    <div className="menu-item-highlight">
      <div className="menu-image-highlight">
        <img src={image} alt={alt || title} />
      </div>
      <div className="menu-info-highlight">
        {category && (
          <span className="menu-category-highlight">{category}</span>
        )}
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="price-action-highlight">
          <span className="price-highlight">{formatPrice(price)}</span>
          {onAddToCart && (
            <Button variant="primary" onClick={handleAddToCart}>
              Thêm vào giỏ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCardHighlight;
