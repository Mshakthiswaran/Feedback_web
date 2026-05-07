const { Client } = require('pg');

const passwords = ['postgres', 'root', 'admin', 'password', '1234', '12345', ''];

async function test() {
    for (const p of passwords) {
        const c = new Client(`postgresql://postgres:${p}@localhost:5432/postgres`);
        try {
            await c.connect();
            console.log(`SUCCESS: Password is '${p}'`);
            await c.end();
            return;
        } catch (e) {
            console.log(`FAILED with '${p}':`, e.message);
        }
    }
}

test();
