import { LOGIN_SUCCESS, LOGOUT, UPDATE_USER_SUCCESS } from "./action";

const reducer = (state, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    case LOGOUT:
      // Remove user from localStorage
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
      };

    case UPDATE_USER_SUCCESS:
      // Update user in localStorage and state
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};
export default reducer;
