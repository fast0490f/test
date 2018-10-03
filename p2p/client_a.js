const udp = require('dgram');
const readline = require('readline');

const client = udp.createSocket('udp4');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const store = {
  mode: 'session',
  sessionid: null,
  session: {},
};

function message(msg, info) {
  // console.log(msg[0], msg.toString());
  switch (msg[0]) {
    case 114:
      console.log('\x1b[33mregistration: OK \x1b[0m');
      break;
    case 99:
      if (!store.session[store.sessionid]) {
        const [type, host, port] = msg.toString().split(' ');
        store.session[store.sessionid] = { host, port };
        console.log(`\x1b[35mcandidate: ${host}:${port} \x1b[0m`);
        channel();
      }
      break;
    case 116:
      const [_, sessionid, status] = msg.toString().split(' ');
      check(sessionid, status)
      break;
    case 100:
      console.log('->', info.address, info.port, msg.slice(1).toString());
      break;
    default:

  }
}

function check(sessionid, status) {
  if (status === 'check') {
    console.log(`\x1b[34mchannel: check \x1b[0m`);
    client.send(`t ${store.sessionid} ok`, store.session[store.sessionid].port, store.session[store.sessionid].host);
  }

  if (status === 'ok') {
    console.log(`\x1b[34mchannel: OK \x1b[0m`);
    client.send(`t ${store.sessionid} ok`, store.session[store.sessionid].port, store.session[store.sessionid].host);
    store.mode = 'channel';
    console.log(``);
    console.log(`\x1b[32menter text: \x1b[0m`);
  }
}

function channel() {
  setTimeout(() => {
    console.log('')
    console.log(`\x1b[34mchannel: create \x1b[0m`);
    client.send(`t ${store.sessionid} check`, store.session[store.sessionid].port, store.session[store.sessionid].host);
  }, 250);
}

function command(value) {
  switch (store.mode) {
    case 'session':
      store.mode = null;
      store.sessionid = value;
      client.send(`r ${store.sessionid}`, 49900, '127.0.0.1');
      break;
    case 'channel':
      client.send(`d${value}`, store.session[store.sessionid].port, store.session[store.sessionid].host);
      break;
    default:

  }
  listenKeyboard();
}

function listenKeyboard() {
  rl.question('', command);
}

function start() {
  rl.question('\x1b[36mset session id: \x1b[0m', command);
}


client.on('message', message);
client.bind(49998, start);
