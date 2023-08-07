import { spawn } from 'child_process';

const lang = process.argv.slice(2)[0];
const child = spawn('npx', ['parcel', `src/${lang}/shapes.html`], {
  shell: true,
});

child.on('error', (e) => console.log(e));
child.stdout.on('data', (data) => process.stdout.write(data));
child.stderr.on('data', (data) => process.stdout.write(data));

