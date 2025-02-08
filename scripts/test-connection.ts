import { testConnection } from '../lib/db/queries';

async function test() {
    const result = await testConnection();
    console.log('Connection test result:', result);
    process.exit(0);
}

test(); 