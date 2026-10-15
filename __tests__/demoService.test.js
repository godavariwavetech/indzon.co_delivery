import service from '../src/services/apiservice';
import {
  resetDemo,
  subscribeDemo,
  getDemoExtras,
  markDemoRead,
  toggleDemoSetting,
} from '../src/services/demoService';
import {demoDay} from '../src/data/demoData';

jest.mock('axios', () => {
  throw new Error('Demo must not import a network client');
});
beforeEach(resetDemo);

test('demo login and every screen data source work locally', async () => {
  expect((await service.login()).data[0].delivery_boy_name).toBe('Arjun Kumar');
  for (const name of [
    'getLocations',
    'getProfileData',
    'getContactUs',
    'getReportingHistory',
    'getReports',
    'getPayments',
    'getCODAmounts',
    'getCODSettledHistory',
  ]) {
    expect(await service[name]()).toBeTruthy();
  }
  expect(
    (await service.getOrderDetails('4101')).data.orderitemdata,
  ).toHaveLength(2);
});

test('accept, pickup and delivery update home, history and earnings together', async () => {
  const changed = jest.fn();
  const unsubscribe = subscribeDemo(changed);
  const initial = (await service.getReportingHistory()).data.data[0];
  await service.acceptorders({order_id: '4101'});
  expect((await service.getOrders()).active_orders).toHaveLength(3);
  await expect(service.acceptorders({order_id: '4102'})).rejects.toThrow();
  await service.vendorReceived({id: '4101'});
  await service.completedorder({order_id: '4101'});
  expect((await service.getOrders()).active_orders).toHaveLength(2);
  expect(
    (await service.completedorders({f_date: demoDay, t_date: demoDay})).data
      .data,
  ).toHaveLength(initial.total_orders + 1);
  const current = (await service.getReportingHistory()).data.data[0];
  expect(current.total_orders).toBe(initial.total_orders + 1);
  expect(current.delivery_charges).toBe(initial.delivery_charges + 40);
  expect(changed).toHaveBeenCalledTimes(3);
  unsubscribe();
});

test('profile edits, availability and reset are local and reusable', async () => {
  await service.updateProfileData({
    name: 'Demo Rider',
    mobilenumber: '9000000101',
    address: 'Local demo address',
  });
  await service.updateDriverStatus(1);
  expect((await service.getProfileData()).data.data[0].delivery_boy_name).toBe(
    'Demo Rider',
  );
  expect(
    (await service.getProfileData()).data.data[0].delivery_boy_active_status,
  ).toBe(1);
  resetDemo();
  expect((await service.getOrders()).new_orders).toHaveLength(4);
});

test('notifications, preferences, settlements and filters remain consistent', async () => {
  markDemoRead('NOTICE-1');
  toggleDemoSetting('alerts');
  expect(getDemoExtras().notifications[0].read).toBe(true);
  expect(getDemoExtras().settings[0].enabled).toBe(false);
  const totals = (await service.getReportingHistory()).data.data[0];
  const settled = (await service.getCODSettledHistory()).reduce(
    (sum, item) => sum + item.cod_amount,
    0,
  );
  const pending = (await service.getCODAmounts())[0].cod_amount;
  expect(settled + pending).toBe(totals.cod_amount);
  expect(
    await service.getPayments({from_date: '2000-01-01', to_date: '2000-01-02'}),
  ).toHaveLength(0);
  const external = await service.getOrders();
  external.data[0].customer_name = 'Changed';
  expect((await service.getOrders()).data[0].customer_name).toBe('Meera Rao');
});
