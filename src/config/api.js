// Development connects to the local backend over adb reverse tcp:2406 tcp:2406.
// export const DELIVERY_API_BASE_URL = 'http://127.0.0.1:2406/delivery_boy' //live url
export const DELIVERY_API_BASE_URL = __DEV__
  ? 'http://127.0.0.1:2406/delivery_boy'
  : 'https://amaraa.co.in:2026/delivery_boy';
export const PUBLIC_API_BASE_URL = __DEV__
  ? 'http://127.0.0.1:2406/public_app'
  : 'https://varadhifood.com:2636/public_app';
