const BASE = process.env.REACT_APP_API_BASE_URL;
const URL = {
  //AUTH
  LOGIN: BASE + "/auth/login.php",
  REGISTER: BASE + "/auth/register.php",
  FORGOT_PASSWORD: BASE + "/auth/forgot_password.php",
  RESET_PASSWORD: BASE + "/auth/reset_password.php",
  UPDATE_PROFILE: BASE + "/Users/update_profile.php",
  //USERS
  GET_USER_DETAILS: BASE + "/Users/get_user_details.php",
  UPDATE_AVATAR: BASE + "/Users/update_avatar.php",
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
  //PAYMENT
  PAYMENT: BASE + "/Payments/payment.php",
};

export default URL;
