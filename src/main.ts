import * as readline from 'readline';
import { FiveMAPI } from './api/fivem';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((r) => rl.question(q, r));

async function main() {
    const url = await ask('URL: ');
    const user = await ask('User: ');
    const pass = await ask('Pass: ');

    const api = new FiveMAPI(url);
    if (!(await api.login(user, pass))) {
        console.log('Login failed');
        return rl.close();
    }
    console.log('Logged in\n');

    const players = await api.getAllPlayers();
    for (const p of players) {
        const ok = await api.banOfflinePlayer(p.license, 'Banned', 'permanent');
        console.log(`${p.displayName}: ${ok ? 'OK' : 'FAIL'}`);
    }

    console.log('\nDone');
    rl.close();
}

main();
