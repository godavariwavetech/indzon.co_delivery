// Fictional presentation records. Dates follow the local demo day.
export const demoDay = `${new Date().getFullYear()}-${String(
  new Date().getMonth() + 1,
).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
export const demoProfile = {
  id: 'PARTNER-101',
  delivery_boy_name: 'Arjun Kumar',
  delivery_boy_mobile_number: '9000000101',
  delivery_boy_address: '12, Prakash Nagar, Rajahmundry, Andhra Pradesh',
  delivery_boy_location_id: '1',
  delivery_boy_active_status: 0,
  profile_img: null,
};
export const demoLocations = ['Rajahmundry', 'Kakinada', 'Amalapuram'].map(
  (location_name, i) => ({id: String(i + 1), location_name}),
);
export const demoCustomers = [
  ['Meera Rao', 'Flat 302, Lotus Residency, Danavaipeta'],
  ['Sai Teja', '8-14, Main Road, Prakash Nagar'],
  ['Ananya Reddy', 'Villa 6, Green Park, Tilak Road'],
  ['Kiran Das', '21, River View Apartments, Kotipalli Road'],
  ['Priya Sharma', 'Door 4-28, Central Avenue, Syamala Nagar'],
  ['Ravi Varma', 'Office 203, City Plaza, AV Appa Rao Road'],
].map(([name, address], i) => ({
  id: `CUS-${i + 1}`,
  name,
  address: `${address}, Rajahmundry`,
  phone: `90000002${String(i).padStart(2, '0')}`,
}));
export const demoOrders = Array.from({length: 18}, (_, i) => {
  const customer = demoCustomers[i % demoCustomers.length];
  const items = [
    {
      id: `${i}-1`,
      item_name: i % 2 ? 'Paneer Rice Bowl' : 'Vegetable Biryani',
      sub_item_count: 2,
      price: 180,
    },
    {id: `${i}-2`, item_name: 'Fresh Lime Soda', sub_item_count: 1, price: 60},
  ];
  return {
    id: String(4101 + i),
    order_id: String(4101 + i),
    order_ids: `AM-${4101 + i}`,
    customer_id: customer.id,
    customer_name: customer.name,
    customer_mobile_number: customer.phone,
    delivery_address: customer.address,
    order_latitude: 17.005,
    order_longitude: 81.778,
    shop_name: ['Amaraa Kitchen', 'Godavari Tiffins', 'Spice Garden'][i % 3],
    shop_address: '24, Main Road, Danavaipeta, Rajahmundry',
    shop_phone_number: '9000000301',
    shop_latitude: 17.01,
    shop_longitude: 81.78,
    pickup_instructions:
      'Collect the sealed bag from the takeaway counter. Check both items before leaving.',
    delivery_instructions: 'Use the main entrance and ring the doorbell.',
    order_status: i < 4 ? 1 : i === 4 ? 8 : i === 5 ? 2 : 3,
    payment_type: i % 3 === 0 ? 'COD' : 'Pay Online',
    grand_total: 460,
    total_amount: 460,
    delivery_charges: 40,
    order_date: demoDay,
    order_time: `${12 + Math.floor(i / 4)}:${String((i * 7) % 60).padStart(
      2,
      '0',
    )}`,
    customer_otp: '1234',
    item_count: 3,
    items,
    delivery_boy_array: JSON.stringify([demoProfile]),
  };
});
export const demoContact = {
  contact_number: '9000000300',
  mail_id: 'support@amaraa.example',
};
export const demoSettlements = demoOrders
  .filter(order => order.order_status === 3 && order.payment_type === 'COD')
  .slice(0, 3)
  .map((order, i) => ({
    id: `SET-${i + 1}`,
    order_ids: [order.order_id],
    settleddate: demoDay,
    cod_amount: order.grand_total,
    cod_orders: 1,
    cod_settlement_otp: '1234',
    settlement_status_text: 'Approved',
  }));
export const demoNotifications = [
  {
    id: 'NOTICE-1',
    title: 'New delivery available',
    message: 'Amaraa Kitchen has a delivery ready for Meera Rao.',
    order_id: '4101',
    read: false,
  },
  {
    id: 'NOTICE-2',
    title: 'Pickup reminder',
    message: 'Your assigned order at Godavari Tiffins is ready for collection.',
    order_id: '4105',
    read: false,
  },
  {
    id: 'NOTICE-3',
    title: 'Settlement approved',
    message: 'Your cash settlement of ₹460 has been approved.',
    read: true,
  },
].map(item => ({...item, date: demoDay}));
export const demoSettings = [
  {
    id: 'alerts',
    title: 'Delivery alerts',
    description: 'Show local delivery reminders',
    enabled: true,
  },
  {
    id: 'sound',
    title: 'Notification sounds',
    description: 'Notification sound preference',
    enabled: true,
  },
];
