const BASE = "http://localhost:8888/API";

const URL = {
  CATEGORY_ACTIVITIES: BASE + "/Activities/category_activities.php",
  LATEST_ACTIVITIES: BASE + "/Activities/latest_activities.php",
  ACTIVITIES_BY_CATEGORY: BASE + "/Activities/activities.php?category_id=",
  FEATURED_ACTIVITIES: BASE + "/Activities/featured_activities.php",
  ACTIVITY_DETAIL: BASE + "/Activities/detail_activities.php?id=",
  CATEGORY_LIST: BASE + "/Activities/categories.php",
  SEARCH: BASE + "/Activities/search_courses.php",
  ALL_EQUIPMENTS: BASE + "/Equipments/equipments.php",
  EQUIPMENT_CATEGORIES: BASE + "/Equipments/equipment_categories.php",
  EQUIPMENT_DETAIL: BASE + "/Equipments/detail_equipments.php?id=",
  FEATURED_EQUIPMENTS: BASE + "/Equipments/featured_equipments.php",
  ALL_POST: BASE + "/Posts/posts.php",
  POST_DETAIL: BASE + "/Posts/post_detail.php?id=",
};

export default URL;
