import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";

function ActivityCategory() {
  const { id } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios_instance.get(URL.CATEGORY_ACTIVITIES, {
          params: { category_id: id },
        });
        setActivities(response.data.data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [id]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <div>
      <h1>Activities in this Category</h1>
      {/* Render activities when integrated with UI components */}
    </div>
  );
}

export default ActivityCategory;
