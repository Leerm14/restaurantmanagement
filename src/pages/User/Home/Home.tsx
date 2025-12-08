import React from "react";
import "./Home.css";
import Button from "../../../components/Button.tsx";
import MenuCardHighlight from "../../../components/MenuCardHighlight.tsx";
import { Link } from "react-router-dom";
import chefImage from "../../../assets/home/chef.png";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
  image: string;
  description?: string;
}

const Home: React.FC = () => {
  const featuredMenu: MenuItem[] = [
    {
      id: 1,
      name: "Phở Bò Đặc Biệt",
      price: 65000,
      category: "Món Chính",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
      description:
        "Phở bò truyền thống với nước dùng hầm xương 12 tiếng, thịt bò tươi ngon",
    },
    {
      id: 2,
      name: "Bún Chả Hà Nội",
      price: 55000,
      category: "Món Chính",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop",
      description:
        "Bún chả Hà Nội chính gốc với chả nướng thơm phức, nước mắm chua ngọt đặc trưng",
    },
    {
      id: 3,
      name: "Gỏi Cuốn Tôm Thịt",
      price: 45000,
      category: "Khai Vị",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
      description:
        "Gỏi cuốn tươi ngon với tôm, thịt ba chỉ, rau thơm và bún tươi",
    },
  ];

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Nhà hàng Hương Vị</h1>
            <p className="hero-subtitle">Hương vị đặc biệt từ từng món ăn</p>
            <Button variant="primary" className="pt-4">
              <Link to="/menu" className="nav-link">
                Khám phá menu
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="home-container">
          <div className="about-content">
            <h2 className="section-title">Chào mừng đến với Hương Vị</h2>
            <p className="about-description">
              Chúng tôi tự hào là một trong những nhà hàng hàng đầu với hương vị
              đặc trưng và không gian sang trọng. Được thành lập từ năm 2010,
              nhà hàng đã phục vụ hàng ngàn thực khách với những món ăn đậm đà
              hương vị truyền thống kết hợp cùng phong cách hiện đại. Chúng tôi
              cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất.
            </p>

            <div className="chef-story">
              <div className="chef-image">
                <img src={chefImage} alt="Chef" />
              </div>
              <div className="chef-content">
                <h3>Câu Chuyện Của Chúng Tôi</h3>
                <p>
                  Với hơn 15 năm kinh nghiệm trong nghề, đầu bếp chính của chúng
                  tôi đã tạo nên những công thức độc đáo, kết hợp giữa hương vị
                  truyền thống và hiện đại. Mỗi món ăn đều được chế biến tỉ mỉ
                  từ những nguyên liệu tươi ngon nhất, đảm bảo chất lượng và
                  hương vị đặc biệt.
                </p>
                <p>
                  Nhà hàng không chỉ là nơi thưởng thức ẩm thực mà còn là không
                  gian để gia đình và bạn bè gặp gỡ, chia sẻ những khoảnh khắc
                  đáng nhớ bên những món ăn ngon và dịch vụ tận tâm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="menu-preview">
        <div className="home-container">
          <h2 className="section-title">Thực Đơn Nổi Bật</h2>
          <div className="menu-grid-highlight">
            {featuredMenu.map((menuItem) => (
              <MenuCardHighlight
                key={menuItem.id}
                image={menuItem.image}
                title={menuItem.name}
                description={menuItem.description || ""}
                price={menuItem.price}
                category={menuItem.category}
                alt={menuItem.name}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="home-container">
          <div className="newsletter-content">
            <h2>Đăng Ký Nhận Tin Của Chúng Tôi</h2>
            <p>
              Nhận những tin tức mới nhất về các món ăn đặc biệt và các chương
              trình khuyến mãi hấp dẫn từ nhà hàng chúng tôi
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="email-input"
              />
              <button className="subscribe-btn">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
