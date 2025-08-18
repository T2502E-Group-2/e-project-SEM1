const BASE = process.env.REACT_APP_API_BASE_URL;
const URL = {
  //ADMIN
  ADMIN_ORDER: BASE + "/Admin/admin_orders.php",
  ADMIN_USERS: BASE + "/Admin/admin_users.php",
  ADMIN_POSTS: BASE + "/Admin/admin_posts.php",
  ADMIN_ACTIVITIES: BASE + "/Admin/admin_activities.php",
  ADMIN_EQUIPMENT: BASE + "/Admin/admin_equipments.php",
  //AUTH
  LOGIN: BASE + "/auth/login.php",
  REGISTER: BASE + "/auth/register.php",
  FORGOT_PASSWORD: BASE + "/auth/forgot_password.php",
  RESET_PASSWORD: BASE + "/auth/reset_password.php",
  UPDATE_PROFILE: BASE + "/Users/update_profile.php",
  //USERS
  GET_USER_DETAILS: BASE + "/Users/get_user_details.php",
  GET_USER_POSTS: BASE + "/Users/get_user_posts.php",
  UPDATE_AVATAR: BASE + "/Users/update_avatar.php",
  //ACTIVITIES
  ACTIVITY_CATEGORIES: BASE + "/Activities/activity_categories.php",
  LATEST_ACTIVITIES: BASE + "/Activities/latest_activities.php",
  FEATURED_ACTIVITIES: BASE + "/Activities/featured_activities.php",
  ACTIVITY_DETAIL: BASE + "/Activities/activity_details.php?id=",
  ALL_ACTIVITIES: BASE + "/Activities/all_activities.php",
  CATEGORY_LIST: BASE + "/Activities/categories.php",
  SEARCH_ACTIVITIES: BASE + "/Activities/search_activities.php",
  SEARCH: BASE + "/search.php",
  //GEARS
  ALL_EQUIPMENTS: BASE + "/Equipments/equipments.php",
  EQUIPMENT_CATEGORIES: BASE + "/Equipments/equipment_categories.php",
  EQUIPMENT_DETAIL: BASE + "/Equipments/detail_equipments.php?id=",
  FEATURED_EQUIPMENTS: BASE + "/Equipments/featured_equipments.php",
  //POSTS
  ALL_POST: BASE + "/Posts/posts.php",
  POST_DETAIL: BASE + "/Posts/post_details.php?id=",
  CREATE_POST: BASE + "/Posts/create_posts.php",
  UPDATE_POST: BASE + "/Posts/update_posts.php",
  UPLOAD_IMAGE: BASE + "/upload_image.php",
  POST_ACTIONS: BASE + "/Posts/user_post_actions.php",
  POST_CATEGORIES: BASE + "/Posts/post_categories.php",
  GALLERIES: BASE + "/Galleries/galleries.php",
  GET_ALBUMS: BASE + "/Galleries/get_albums.php",

  //PAYMENT
  PAYMENT: BASE + "/Payments/payment.php",
  //ORDERS
  GET_USER_ORDERS: BASE + "/Users/get_user_orders.php",
};

export default URL;
