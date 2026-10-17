import axios from 'axios';

import {DELIVERY_API_BASE_URL, PUBLIC_API_BASE_URL} from '../config/api';

// Create Axios instance
const apiClient = axios.create({
  baseURL: DELIVERY_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Axios instance
const publicapiClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});


// 🔹 Centralized error handler function
// Reject missing configuration before Axios can issue a relative request.
[apiClient, publicapiClient].forEach(client => {
  client.interceptors.request.use(config => {
    const isLocalDevelopment = __DEV__ && /^http:\/\/127\.0\.0\.1:2406\//.test(config.baseURL || '');
    if (!isLocalDevelopment && !/^https:\/\/[^/]+/.test(config.baseURL || '')) {
      throw new Error('Indzon API URL is not configured. Set src/config/api.js.');
    }
    return config;
  });
});

const handleApiError = error => {
  if (error.response) {
    const data = error.response.data;
    return typeof data === 'object' && data !== null ? data : {message: 'Request failed. Please try again.'};
  } else if (error.request) {
    // console.error('Network Error:', error.request);
    // Alert.alert(
    //   'No Internet',
    //   'Please check your internet connection and try again.',
    // );
    return {message: 'Network error, please try again later.'};
  } else {
    return {message: error.message || 'Something went wrong. Please try again.'};
  }
};

// API Functions
const ApiService = {
  // 🔹 User Login
  login: async (number, password) => {
    try {
      const response = await apiClient.post('/logincheck', {number, password});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 Fetch Orders
  getOrders: async user => {
    try {
      const response = await apiClient.post('/getcurrentorders', user);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getOrderDetails: async id => {
    try {
      const response = await apiClient.post('/getorderdetails', {order_id: id});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  acceptorders: async user => {
    try {
      const response = await apiClient.post('/acceptorderstatus', user);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  vendorReceived: async payload => {
    try {
      const response = await apiClient.post('/updateoderstatdata', payload);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 Update Order Status
  completedorder: async array => {
    try {
      const response = await apiClient.post(`/completedorder`, array);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  //Registration
  registration: async payload => {
    try {
      const resp = await apiClient.post('/adddeliveryboy', payload);
      return resp.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  //Account deletion
  deleteAccount: async userId => {
    try {
      const resp = await apiClient.post('/deleteuseraccount', {id: userId});
      return resp.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  //locations (in registration)
  getLocations: async () => {
    try {
      const resp = await apiClient.get('/getlocation');
      return resp.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getProfileData: async array => {
    try {
      const response = await apiClient.post(`/getprofiledata`, array);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProfileData: async data => {
    try {
      const response = await apiClient.post(`/updateprofiledata`, data);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  completedorders: async ({f_date, t_date, emp_id}) => {
    try {
      const response = await apiClient.post(`/getordersdatewise`, {
        f_date,
        t_date,
        emp_id,
      });
      return response.data; // Assuming the API returns an array of completed orders
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 Fetch Payments (New API Function)
  getPayments: async ({fromDate, toDate, emp_id}) => {
    try {
      const response = await apiClient.post('/getpayments', {
        fromDate,
        toDate,
        emp_id, // Include emp_id if required by API
      });
      // console.log("Payments Response:", response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 contact us api
  getContactUs: async () => {
    try {
      const response = await publicapiClient.post(
        '/application_common_api',
        [],
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getReportingHistory: async deliveryboy_id => {
    try {
      const response = await apiClient.post('/deliveryboypayments', {
        deliveryboy_id: deliveryboy_id,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getReports: async (deliveryboy_id, fromdate, todate) => {
    try {
      const response = await apiClient.post('/deliveryboypaymentreports', {
        deliveryboy_id: deliveryboy_id,
        fromdate: `${fromdate}`,
        todate: `${todate}`,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  uploadFcmToken: async (fcm_token, user_id, delivery_boy_location_id) => {
    try {
      const response = await apiClient.post('/postplayer_id', {
        player_id: fcm_token,
        user_id: user_id,
        user_type: 2,
        location_id: delivery_boy_location_id,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  verifyMobileNumber: async number => {
    try {
      const response = await apiClient.post('/checkthemobilenumber', {
        number: number,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


  resetPassword: async (number,password) => {
    try {

      // return
      const response = await apiClient.post('/updatenewpassword', {
       "number":number,
       "password":password
      })
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

    updateDriverStatus: async (status,id) => {
    try {
      const response = await apiClient.post("/deliveryboyactivestatus", { 
        active_status:status,
        deliveryboy_id:id
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error)
    }
  },
  getCODAmounts: async (deliveryboy_id) => {
    try {
      const response = await apiClient.post('/getcodamounts', {
        deliveryboy_id: deliveryboy_id,
      });
      return response.data?.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCODSettledHistory: async (deliveryboy_id) => {
    try {
      const response = await apiClient.post('/getcodsettledhistory', {
        deliveryboy_id: deliveryboy_id,
      });
      return response.data?.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


};

export default ApiService;
