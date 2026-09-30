import { createClient } from 'redis';
import { REDIS_URI } from '../config/config.js';
export const client = createClient({
  url: REDIS_URI
});
export async function connectRedis() {
  try {
    await client.connect()
    console.log(`Redis database connected successfully....`);
  } catch (error) {
    console.log(`Fail to connect on redis database.... Error::${error}`);
  }
}
