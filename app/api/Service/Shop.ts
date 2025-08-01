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
    const response = await Axios.post('/shop/getShopById', { shopId });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch shop details" };
  }
};

