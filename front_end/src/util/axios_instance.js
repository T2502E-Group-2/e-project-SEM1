import axios from "axios";
import URL from "./url";

const BASE_URL = URL.BASE;
export default axios.create({
  baseURL: BASE_URL,
});
