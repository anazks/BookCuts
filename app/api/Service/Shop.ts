import Axios from '../axios';



export const getAllShops = async () => {
  try {
    const response = await Axios.get('/shop/ViewAllShop');
    console.log("Response from getAllShops:", response);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Registration failed" };
  }
};

export const getShopById = async (shopId: string) => {
  try {
    let id =shopId
    let data = id
    const response = await Axios.post('/shop/viewSigleShop/', {data});
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch shop details" };
  }
};

export const getmyBarbers = async (shopId: string) => {
  try {
    const response = await Axios.get(`/shop/viewMyBarbers/${shopId}`);
    console.log("Response from getmyBarbers:", response);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch barbers" };
  }
}
export const getShopServices = async (shopId: string) => {
  try {
    const response = await Axios.get(`/shop/viewMyService/${shopId}`);
    console.log("Response from getShopServices:", response);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch shop services" };
  }
}


