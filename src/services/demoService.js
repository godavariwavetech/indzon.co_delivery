import {
  demoOrders,
  demoProfile,
  demoLocations,
  demoContact,
  demoSettlements,
  demoDay,
  demoNotifications,
  demoSettings,
} from '../data/demoData';

const copy = value => JSON.parse(JSON.stringify(value));
let orders = copy(demoOrders);
let profile = {...demoProfile};
let notifications = copy(demoNotifications);
let settings = copy(demoSettings);
const listeners = new Set();
export const subscribeDemo = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const emit = () => listeners.forEach(listener => listener());
const ok = (data = []) => ({
  status: 200,
  data: copy(data),
  message: 'Action completed',
});
const nested = data => ok({data});
const completed = () => orders.filter(order => order.order_status === 3);
const isoDate = value =>
  value && /^\d{2}-\d{2}-\d{4}$/.test(value)
    ? value.split('-').reverse().join('-')
    : value;
const inRange = (date, from, to) =>
  (!from || date >= isoDate(from)) && (!to || date <= isoDate(to));
const summary = (records = completed()) => {
  const cod = records.filter(order => order.payment_type === 'COD');
  const amount = list =>
    list.reduce((total, order) => total + order.grand_total, 0);
  const earnings = records.reduce(
    (total, order) => total + order.delivery_charges,
    0,
  );
  const settled = demoSettlements.flatMap(item => item.order_ids);
  const pendingCash = cod.filter(item => !settled.includes(item.order_id));
  return {
    date_range: `${demoDay} - ${demoDay}`,
    total_orders: records.length,
    total_amount: amount(records),
    cod_count: cod.length,
    cod_amount: amount(cod),
    pay_online_count: records.length - cod.length,
    pay_online_amount: amount(records) - amount(cod),
    delivery_charges: earnings,
    deliveryboy_order_amount: 40,
    total_deliveryboy_amount: earnings,
    deliveryboy_payment_otp: '1234',
    cash_in_hand: amount(pendingCash),
    cash_in_hand_count: pendingCash.length,
  };
};
const changeStatus = (id, status) => {
  const order = orders.find(
    item => item.order_id === String(id) || item.order_ids === id,
  );
  if (!order) throw new Error('Order not found');
  const allowed = {1: 8, 8: 2, 2: 3};
  if (order.order_status !== status && allowed[order.order_status] !== status)
    throw new Error('Complete the previous delivery step first.');
  if (
    status === 8 &&
    order.order_status === 1 &&
    orders.filter(item => [8, 2].includes(item.order_status)).length >= 3
  )
    throw new Error('Complete an ongoing delivery before accepting another.');
  order.order_status = status;
  emit();
  return ok(order);
};
export const getDemoExtras = () => copy({notifications, settings});
export const markDemoRead = id => {
  notifications = notifications.map(item =>
    item.id === id ? {...item, read: true} : item,
  );
  emit();
};
export const toggleDemoSetting = id => {
  settings = settings.map(item =>
    item.id === id ? {...item, enabled: !item.enabled} : item,
  );
  emit();
};
export const resetDemo = () => {
  orders = copy(demoOrders);
  profile = {...demoProfile};
  notifications = copy(demoNotifications);
  settings = copy(demoSettings);
  emit();
};
const DemoService = {
  login: async () => ok([profile]),
  getOrders: async () => ({
    ...ok(orders.filter(item => item.order_status !== 3)),
    new_orders: copy(orders.filter(item => item.order_status === 1)),
    active_orders: copy(
      orders.filter(item => [8, 2].includes(item.order_status)),
    ),
  }),
  getOrderDetails: async id =>
    ok({
      orderitemdata: copy(
        orders.find(item => item.order_id === String(id))?.items || [],
      ),
    }),
  acceptorders: async payload => changeStatus(payload.order_id, 8),
  vendorReceived: async payload => changeStatus(payload.id, 2),
  completedorder: async payload => changeStatus(payload.order_id, 3),
  completedorders: async ({f_date, t_date}) =>
    nested(
      completed().filter(
        item =>
          (!f_date || item.order_date >= f_date) &&
          (!t_date || item.order_date <= t_date),
      ),
    ),
  getProfileData: async () => nested([profile]),
  updateProfileData: async data => {
    profile = {
      ...profile,
      delivery_boy_name: data.name,
      delivery_boy_mobile_number: data.mobilenumber,
      delivery_boy_address: data.address,
      profile_img: data.avatar || null,
    };
    emit();
    return ok([profile]);
  },
  updateDriverStatus: async status => {
    profile.delivery_boy_active_status = status;
    emit();
    return ok();
  },
  getLocations: async () => ok(demoLocations),
  registration: async () => ok([profile]),
  verifyMobileNumber: async () => ok([profile]),
  resetPassword: async () => ok(),
  deleteAccount: async () => {
    resetDemo();
    return ok();
  },
  uploadFcmToken: async () => ok(),
  getContactUs: async () => ok([demoContact]),
  getReportingHistory: async () => nested([summary()]),
  getReports: async (userId, from, to) =>
    nested(
      [0, 1, 2]
        .map(i => {
          const records = completed().filter((_, index) => index % 3 === i);
          const totals = summary(records);
          return {
            ...totals,
            id: `PAY-${i}`,
            payment_dates: totals.date_range,
            payment_date_time: demoDay,
            amount_per_order: 40,
            cod_orders: totals.cod_count,
            payonline_orders: totals.pay_online_count,
            payonline_amount: totals.pay_online_amount,
            total_payment_amount: totals.total_deliveryboy_amount,
          };
        })
        .filter(item => inRange(item.payment_date_time, from, to)),
    ),
  getPayments: async ({from_date, to_date} = {}) =>
    copy(
      completed()
        .filter(item => inRange(item.order_date, from_date, to_date))
        .map(item => ({
          id: item.id,
          order_id: item.order_ids,
          amount: item.delivery_charges,
          date: item.order_date,
        })),
    ),
  getCODAmounts: async () => {
    const settled = demoSettlements.flatMap(item => item.order_ids);
    const totals = summary(
      completed().filter(
        item => item.payment_type === 'COD' && !settled.includes(item.order_id),
      ),
    );
    return [{...totals, cod_settlement_otp: '1234'}];
  },
  getCODSettledHistory: async () => copy(demoSettlements),
};
export default DemoService;
