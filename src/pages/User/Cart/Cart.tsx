import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { t, convertCurrency } from "../../../utils/translations";
import apiClient from "../../../services/api";
import "./Cart.css";

interface Booking {
  id: number;
  tableId: number;
  tableName: string;
  bookingTime: string;
  status: string;
}

const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { language } = useTheme();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [orderType, setOrderType] = useState<"Dinein" | "Takeaway">("Dinein");

  useEffect(() => {
    const checkActiveBooking = async () => {
      if (!userId || orderType === "Takeaway") {
        setLoadingBooking(false);
        setActiveBooking(null);
        return;
      }

      setLoadingBooking(true);
      try {
        const response = await apiClient.get(`/api/bookings/user/${userId}`);

        const bookings = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const userActiveBooking = bookings.find(
          (booking: any) =>
            (booking.status === "Confirmed" || booking.status === "Pending") &&
            new Date(booking.bookingTime) >= startOfToday
        );

        console.log("User active booking:", userActiveBooking);

        if (userActiveBooking) {
          setActiveBooking({
            id: userActiveBooking.id,
            tableId: userActiveBooking.table?.id,
            tableName: `Bàn ${userActiveBooking.table?.tableNumber}`,
            bookingTime: userActiveBooking.bookingTime,
            status: userActiveBooking.status,
          });
        } else {
          setActiveBooking(null);
        }
      } catch (error) {
        console.error("Error checking active booking:", error);
      } finally {
        setLoadingBooking(false);
      }
    };

    checkActiveBooking();
  }, [userId, orderType]);

  const formatCurrency = (amount: number, vndAmount: boolean = true) => {
    let locale = "vi-VN";
    let currency = "VND";
    let displayAmount = amount;
    
    if (language === "en") {
      locale = "en-US";
      currency = "USD";
      displayAmount = vndAmount ? convertCurrency(amount, "vi", "en") : amount;
    } else if (language === "zh") {
      locale = "zh-CN";
      currency = "CNY";
      displayAmount = vndAmount ? convertCurrency(amount, "vi", "zh") : amount;
    } else if (language === "ja") {
      locale = "ja-JP";
      currency = "JPY";
      displayAmount = vndAmount ? convertCurrency(amount, "vi", "ja") : amount;
    }
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(displayAmount);
  };

  const handleCheckout = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để đặt món");
      navigate("/signin");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, vui lòng thêm món");
      return;
    }

    if (orderType === "Dinein" && !activeBooking) {
      navigate("/booking", { state: { fromCart: true } });
      return;
    }

    try {
      const orderItems = cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      const orderCreateRequest: any = {
        userId: userId,
        orderType: orderType,
        orderItems: orderItems,
      };

      if (orderType === "Dinein" && activeBooking) {
        orderCreateRequest.tableId = activeBooking.tableId;
      }

      const response = await apiClient.post("/api/orders", orderCreateRequest);

      if (response.status === 201) {
        alert("Đặt món thành công!");
        clearCart();
        setActiveBooking(null);
        navigate("/order-history");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.response?.status === 400) {
        alert("Đặt món thất bại: Thông tin không hợp lệ");
      } else if (error.response?.status === 403) {
        alert("Bạn không có quyền đặt món");
      } else {
        alert("Đặt món thất bại, vui lòng thử lại");
      }
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">{t("cartTitle", language)}</h1>
          <p className="cart-subtitle">
            {language === "vi" ? `Bạn có ${getTotalItems()} món trong giỏ hàng` : language === "en" ? `You have ${getTotalItems()} items in cart` : language === "zh" ? `您的购物车中有${getTotalItems()}件商品` : `あなたのカートに${getTotalItems()}個のアイテムがあります`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">{t("emptyCart", language)}</h2>
            <p className="cart-empty-text">
              {language === "vi" ? "Hãy thêm món ăn yêu thích vào giỏ hàng của bạn" : language === "en" ? "Add your favorite dishes to cart" : language === "zh" ? "添加你喜欢的菜肴到购物车" : "お気に入りの料理をカートに追加してください"}
            </p>
            <Link to="/menu" className="continue-shopping-btn">
              {language === "vi" ? "Khám phá menu" : language === "en" ? "Explore Menu" : language === "zh" ? "探索菜单" : "メニューを探索"}
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        {t("remove", language)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">{t("cartTitle", language)}</h2>

              <div className="order-type-selection">
                <h3 className="order-type-label">{t("orderMethod", language)}</h3>
                <div className="order-type-buttons">
                  <button
                    className={`order-type-btn ${
                      orderType === "Dinein" ? "active" : ""
                    }`}
                    onClick={() => setOrderType("Dinein")}
                  >
                    {t("dineIn", language)}
                  </button>
                  <button
                    className={`order-type-btn ${
                      orderType === "Takeaway" ? "active" : ""
                    }`}
                    onClick={() => setOrderType("Takeaway")}
                  >
                    {t("takeaway", language)}
                  </button>
                </div>
              </div>

              <div className="summary-row">
                <span className="summary-label">{t("itemCount", language)}:</span>
                <span className="summary-value">{getTotalItems()}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">{t("subtotal", language)}:</span>
                <span className="summary-value">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>

              <div className="summary-row total">
                <span className="summary-label">{t("total", language)}:</span>
                <span className="summary-value total">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>

              {orderType === "Dinein" && (
                <div className="booking-status">
                  {loadingBooking ? (
                    <div className="booking-info">
                      <p>Đang kiểm tra đặt bàn...</p>
                    </div>
                  ) : activeBooking ? (
                    <div className="booking-info success">
                      <p className="booking-status-text">
                        {t("bookingConfirmed", language)}: Bàn 1
                      </p>
                      <p className="booking-info-time">
                        {language === "vi" ? "Thời gian" : language === "en" ? "Time" : language === "zh" ? "时间" : "時間"}: 17:00:00 24/12/2025
                      </p>
                    </div>
                  ) : (
                    <div className="booking-info warning">
                      <p>⚠️ {language === "vi" ? "Chưa có đặt bàn" : language === "en" ? "No booking yet" : language === "zh" ? "尚无预订" : "予約がありません"}</p>
                      <p className="booking-info-time">
                        {language === "vi" ? "Vui lòng đặt bàn trước khi đặt món" : language === "en" ? "Please book a table before placing an order" : language === "zh" ? "请先预订一张桌子再下单" : "注文する前にテーブルを予約してください"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                {orderType === "Dinein" && !activeBooking
                  ? (language === "vi" ? "Đặt bàn trước" : language === "en" ? "Book a table first" : language === "zh" ? "先预订一张桌子" : "まずテーブルを予約する")
                  : t("checkout", language)}
              </button>

              <button
                className="clear-cart-btn"
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
              >
                {t("clearCart", language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
