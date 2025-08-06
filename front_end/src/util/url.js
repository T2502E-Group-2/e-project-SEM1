const BASE = "http://localhost:8888/API";

const URL = {
  //ACTIVITIES
  CATEGORY_ACTIVITIES: BASE + "/Activities/category_activities.php",
  ACTIVITIES_BY_CATEGORY: BASE + "/Activities/activities.php?category_id=",
  LATEST_ACTIVITIES: BASE + "/Activities/latest_activities.php",
  FEATURED_ACTIVITIES: BASE + "/Activities/featured_activities.php",
  ACTIVITY_DETAIL: BASE + "/Activities/detail_activities.php?id=",
  CATEGORY_LIST: BASE + "/Activities/categories.php",
  //GEARS
  ALL_EQUIPMENTS: BASE + "/Equipments/equipments.php",
  EQUIPMENT_CATEGORIES: BASE + "/Equipments/equipment_categories.php",
  EQUIPMENT_DETAIL: BASE + "/Equipments/detail_equipments.php?id=",
  FEATURED_EQUIPMENTS: BASE + "/Equipments/featured_equipments.php",
  //POSTS
  ALL_POST: BASE + "/Posts/posts.php",
  POST_DETAIL: BASE + "/Posts/post_details.php?id=",
};

export default URL;
