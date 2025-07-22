const update_storage = (state) => {
  localStorage.setItem("state", JSON.stringify(state));
  return state;
};
const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_CART":
      return update_storage({
        ...state,
        cart: action.payload,
      });
    default:
      return state;
  }
};
export default reducer;
