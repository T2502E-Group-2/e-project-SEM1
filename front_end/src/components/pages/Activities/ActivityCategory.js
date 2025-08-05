import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import URL from "../../../util/url";
import axios_instance from "../../../util/axios_instance";

function ActivityCategory() {
  const { id } = useParams(); // Lấy ID từ URL, ví dụ: /category/5 -> id = 5
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // Gọi đến API PHP của bạn
        const response = await axios_instance.get(
          URL.ACTIVITIES_BY_CATEGORY + id
        );
        setActivities(response.data.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [id]); // Chạy lại mỗi khi ID trên URL thay đổi

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <div>
      <h1>Activities in this Category</h1>
      {/* Hiển thị danh sách activities ở đây */}
    </div>
  );
}

export default ActivityCategory;
