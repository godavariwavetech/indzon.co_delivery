import service from '../src/services/apiservice';

let mockAdapter;
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {__esModule: true, default: {
    create: config => actual.default.create({...config, adapter: request => mockAdapter(request)}),
  }};
});
jest.mock('../src/config/api', () => ({
  DELIVERY_API_BASE_URL: 'https://delivery.test.invalid/delivery_boy',
  PUBLIC_API_BASE_URL: 'https://public.test.invalid/public_app',
}));
const user = {id: 'rider', delivery_boy_location_id: 'location'};
const accept = {deliveryarr: [user], id: user.id, order_status: 8, order_id: 'order'};
const pickup = {id: 'order', customer_id: 'customer'};
const complete = {order_id: 'order', delivery_id: user.id, delivery_otp: '5678', customer_id: 'customer'};
const cases = [
  ['login', ['9000000000', 'secret'], 'post', '/logincheck', {number: '9000000000', password: 'secret'}],
  ['getOrders', [user], 'post', '/getcurrentorders', user],
  ['getOrderDetails', ['order'], 'post', '/getorderdetails', {order_id: 'order'}],
  ['acceptorders', [accept], 'post', '/acceptorderstatus', accept],
  ['vendorReceived', [pickup], 'post', '/updateoderstatdata', pickup],
  ['completedorder', [complete], 'post', '/completedorder', complete],
  ['registration', [{name: 'Rider', selfie: 'base64'}], 'post', '/adddeliveryboy', {name: 'Rider', selfie: 'base64'}],
  ['deleteAccount', ['rider'], 'post', '/deleteuseraccount', {id: 'rider'}],
  ['getLocations', [], 'get', '/getlocation', undefined],
  ['getProfileData', [user], 'post', '/getprofiledata', user],
  ['updateProfileData', [{id: 'rider', avatar: 'base64'}], 'post', '/updateprofiledata', {id: 'rider', avatar: 'base64'}],
  ['completedorders', [{f_date: '2026-10-01', t_date: '2026-10-17', emp_id: 'rider'}], 'post', '/getordersdatewise', {f_date: '2026-10-01', t_date: '2026-10-17', emp_id: 'rider'}],
  ['getPayments', [{fromDate: '2026-10-01', toDate: '2026-10-17', emp_id: 'rider'}], 'post', '/getpayments', {fromDate: '2026-10-01', toDate: '2026-10-17', emp_id: 'rider'}],
  ['getContactUs', [], 'post', '/application_common_api', []],
  ['getReportingHistory', ['rider'], 'post', '/deliveryboypayments', {deliveryboy_id: 'rider'}],
  ['getReports', ['rider', '2026-10-01', '2026-10-17'], 'post', '/deliveryboypaymentreports', {deliveryboy_id: 'rider', fromdate: '2026-10-01', todate: '2026-10-17'}],
  ['uploadFcmToken', ['token', 'rider', 'location'], 'post', '/postplayer_id', {player_id: 'token', user_id: 'rider', user_type: 2, location_id: 'location'}],
  ['verifyMobileNumber', ['9000000000'], 'post', '/checkthemobilenumber', {number: '9000000000'}],
  ['resetPassword', ['9000000000', 'secret'], 'post', '/updatenewpassword', {number: '9000000000', password: 'secret'}],
  ['updateDriverStatus', [0, 'rider'], 'post', '/deliveryboyactivestatus', {active_status: 0, deliveryboy_id: 'rider'}],
  ['getCODAmounts', ['rider'], 'post', '/getcodamounts', {deliveryboy_id: 'rider'}],
  ['getCODSettledHistory', ['rider'], 'post', '/getcodsettledhistory', {deliveryboy_id: 'rider'}],
];

beforeEach(() => {
  mockAdapter = jest.fn(async config => ({data: {status: 200, data: [{id: 'from-server'}]}, status: 200, statusText: 'OK', headers: {}, config}));
});
test.each(cases)('%s preserves the reference request contract', async (name, args, method, url, body) => {
  const result = await service[name](...args);
  const config = mockAdapter.mock.calls[0][0];
  expect(config.method).toBe(method);
  expect(config.url).toBe(url);
  expect(config.data === undefined ? undefined : JSON.parse(config.data)).toEqual(body);
  expect(config.headers['Content-Type']).toBe('application/json');
  expect(config.baseURL).toBe(name === 'getContactUs' ? 'https://public.test.invalid/public_app' : 'https://delivery.test.invalid/delivery_boy');
  expect(config.timeout).toBe(10000);
  expect(result).toEqual(name.startsWith('getCOD') ? [{id: 'from-server'}] : {status: 200, data: [{id: 'from-server'}]});
});
test.each(['acceptorders', 'vendorReceived', 'completedorder', 'updateProfileData'])('%s propagates a backend rejection', async name => {
  mockAdapter.mockRejectedValueOnce({response: {data: {status: 403, message: 'Not allowed'}}});
  await expect(service[name]({})).rejects.toEqual({status: 403, message: 'Not allowed'});
});
test('network failure cannot become a successful delivery', async () => {
  mockAdapter.mockRejectedValueOnce({request: {}});
  await expect(service.completedorder(complete)).rejects.toMatchObject({message: expect.stringContaining('Network error')});
});
