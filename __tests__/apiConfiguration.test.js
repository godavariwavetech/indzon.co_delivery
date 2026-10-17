import axios from 'axios';
import service from '../src/services/apiservice';
jest.mock('../src/config/api', () => ({
  DELIVERY_API_BASE_URL: '',
  PUBLIC_API_BASE_URL: '',
}));
test('unconfigured Indzon URL prevents network requests', async () => {
  const adapter = jest.fn();
  axios.defaults.adapter = adapter;
  await expect(service.login('9000000000', 'secret')).rejects.toMatchObject({message: expect.stringContaining('not configured')});
  await expect(service.getContactUs()).rejects.toMatchObject({message: expect.stringContaining('not configured')});
  expect(adapter).not.toHaveBeenCalled();
});
