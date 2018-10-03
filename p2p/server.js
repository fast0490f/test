const udp = require('dgram');

const server = udp.createSocket('udp4');

const store = {};

function candidate(sessionid) {
  server.send(`c ${store[sessionid].b.h} ${store[sessionid].b.p}`, store[sessionid].a.p, store[sessionid].a.h);
  server.send(`c ${store[sessionid].a.h} ${store[sessionid].a.p}`, store[sessionid].b.p, store[sessionid].b.h);
  server.send(`c ${store[sessionid].b.h} ${store[sessionid].b.p}`, store[sessionid].a.p, store[sessionid].a.h);
  server.send(`c ${store[sessionid].a.h} ${store[sessionid].a.p}`, store[sessionid].b.p, store[sessionid].b.h);
}

function register(msg, info) {
  const sessionid = msg[1];

  console.log(sessionid, info.address, info.port);
  server.send('r ok', info.port, info.address);

  if (store.hasOwnProperty(sessionid)) {
    store[sessionid].b = { h: info.address, p: info.port };
    candidate(sessionid);
  } else {
    store[sessionid] = {
      a: { h: info.address, p: info.port },
      b: { h: null, p: null },
    };
  }
}

function message(data, info) {
  const msg = data.toString().split(' ');
  switch (msg[0]) {
    case 'r':
      register(msg, info);
      break;
    default:

  }
}

function start() {
  //
}


server.on('message', message);
server.bind(49900, start);
