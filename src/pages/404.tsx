import React, { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./404.scss";

const NotFoundPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    // Chỉ áp dụng hiệu ứng parallax trên màn hình lớn
    if (window.innerWidth < 768) return;

    const rect = container.getBoundingClientRect();
    const halfFieldWidth = rect.width / 2;
    const halfFieldHeight = rect.height / 2;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = (mouseX - halfFieldWidth) / 30;
    const newY = (mouseY - halfFieldHeight) / 30;

    const waveElements =
      container.querySelectorAll<HTMLElement>('[class*="wave"]');

    waveElements.forEach((el, index) => {
      el.style.transition = "none";
      const depth = index * 0.5;
      el.style.transform = `translate3d(${newX * depth}px, ${
        newY * depth
      }px, 0px)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const waveElements =
      container.querySelectorAll<HTMLElement>('[class*="wave"]');

    waveElements.forEach((el) => {
      el.style.transition = "transform 0.7s ease-out";
      el.style.transform = "translate3d(0, 0, 0)";
    });
  }, []);

  return (
    <div
      className="not-found parallax"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sky-bg"></div>
      <div className="wave-7"></div>
      <div className="wave-6"></div>

      <Link to="/" className="wave-island" title="Trở về trang chủ">
        <img
          src="https://res.cloudinary.com/andrewhani/image/upload/v1524501929/404/island.svg"
          alt="Island"
          style={{ width: "100%", display: "block" }}
        />
      </Link>

      <div className="wave-5"></div>
      <div className="wave-lost wrp">
        <span>4</span>
        <span>0</span>
        <span>4</span>
      </div>

      <div className="wave-4"></div>
      <div className="wave-boat">
        <img
          className="boat"
          src="https://res.cloudinary.com/andrewhani/image/upload/v1524501894/404/boat.svg"
          alt="Boat"
        />
      </div>

      <div className="wave-3"></div>
      <div className="wave-2"></div>
      <div className="wave-1"></div>

      <div className="wave-message">
        <p>Bạn đã bị lạc đường?</p>
        <p style={{ fontSize: "1.5rem" }}>
          Nhấn vào hòn đảo để quay về đất liền
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
