import React, { useEffect, useState, useContext } from "react";
import UserContext from "../../context/context";
import URL from "../../util/url";

function AdminOrder() {
  const { state } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(URL.ADMIN_ORDER, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Lỗi server: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Kiểm tra quyền admin ngay frontend, UX cho nhanh
  if (!state.users || state.users.role !== "admin") {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  if (loading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!orders.length) return <div>Không có đơn hàng nào.</div>;

  return (
    <div>
      <h1>Quản lý đơn hàng (Admin)</h1>
      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        border="1"
        cellPadding="8">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>PayPal Order ID</th>
            <th>Khách hàng</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Ghi chú</th>
            <th>Product ID</th>
            <th>Loại sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá mua</th>
            <th>Tổng tiền</th>
            <th>Ngày đặt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((row, index) => (
            <tr key={index}>
              <td>{row.order_id}</td>
              <td>{row.paypal_order_id}</td>
              <td>{row.full_name}</td>
              <td>{row.phone}</td>
              <td>{row.address}</td>
              <td>{row.note}</td>
              <td>{row.product_id}</td>
              <td>{row.product_type}</td>
              <td>{row.quantity}</td>
              <td>${parseFloat(row.price_at_time_of_purchase).toFixed(2)}</td>
              <td>${parseFloat(row.total_amount).toFixed(2)}</td>
              <td>{row.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrder;
