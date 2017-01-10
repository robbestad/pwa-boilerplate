const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const spdy = require('spdy');
const router = require('./router');
const app = require('./app');

const ports = {
  http: process.env.HTTP || 80,
  https: process.env.HTTPS || 443
};

//fs.readFileSync(path.join(__dirname, 'cert', 'server.key'))

const ssl = {
  key: process.env.PUBKEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDA28xmMTypKQo0\nVbf5spPrC9yoDTx4W5auRnM6o73UyCIR9iBSXkNWe2A2ZraTOHtfqZYFrBWRlXoT\nlQYlAR24Zht+NneQTb7KLzSkiVQ4vufmMOpVKQ/h41JDbKDd6EiF+dHjS4OsJvct\n/CAaHyHDq5Zt8C00uzFfRZnV55ei6CTgAlbw8BlgRGfWVvYHuPyJxbAS8xMO0gUC\n3VE0iRIAuchgLfX5GkvEI7mfL/2k1VkyFYO5aA6Xu2sVjxPoNV9lvlPgKCdN/tIX\nMDruIt7i6SOPeDOIkmFAA8nheoSLjp8A5ZgTNfAeh9STSiqt9BJs+kP1M2gqgZOd\n1IKWdGLfAgMBAAECggEAYqQJN3uXey3yejIdlykvXtkCUzHx691shFakOSnmvh5e\nzrEEdxyfdGxGGY0PdN0+vP8QLHaH0Z6SgdGHAwY/HUGcbkGNhdE99EuQsVdMLHn4\nQlRihowqA28xdCrrXJSiA2RzZb4J6tNDOdHq2XFy45GvrytY88+KwR/oPu/lLvyJ\nR09h/PeUynVAnUnGaKKCtjGCuHTe3QDHWMWz0LvlI5YwmFtOCYEbTPXNgP8yjDRi\nDeYL+wkCORzHnX44o45zj5V/66Lekeuh0UgUBxotGxhsUe5pGE2lj2WJgliePYeY\nrRAKTUoOZZEMqyoR6MdN/UxGA/VcuPnTXpZV3jBvAQKBgQDxn0FGxuNJZQEQv9/c\ngQ4IKSW07Y5+9EJPilok6QTegGoGwdM1NKwZlRGLyPvvIPZH3fXXTeBLg1reLx3g\nPiwggQdniFBF52kEkW/UW0HuPdrAmqEBZrqWdDF9aZK5kyW5TX0ps+uPt1NokAGi\nYc9v4V6HY3IAobZTPIDgAJjimQKBgQDMVbSmfit4WgKdNWxwwWA01I5wYLjWcRQi\nw1GWbxPbxMbdfYPiVZsBUgKz1V+IA0S/cKfYpYkBQtGys88AVBQRFcSc6EHeTyr5\nqJ+732ML2qhrL8d4dzTMptVoZBfu+JwMxJIqc6n3cJ458QZTHtw+T0mYhRUacQm4\nrb9BZ73UNwKBgQDmH3l6QV6jvnEfVL+PMdL9bsMc6Mw4mca2HtzwHoamq8NPoDba\ni8oFq3ZEni1keQ5XME0+vEsNYJOg3VslAdHhO0KkFq3thhL9aM8Lf8bxczPvENab\nkQ3Q0eV4vp4h5MWfEPBOUa/e9wmXouALmgCJXCo95Dbl5x7Rc+SCc88osQKBgBGG\nhFEHX0kaR0EelOdy3oKJfJIM6a2S00xL/lJtwoFF9lyG6GngN8Q8OXkdIu1yglH9\nIphFUmPmTEAMhgOcMoBooo1mqkeb+K6jFNgzR7Z7kZhn567gYonvATzL4PWhIxlB\nPtwfQYO0iA2mK4mziuZZPJG1UGMNMO1DEbVVZYWvAoGACKIdnK1JslREeSqLmpC5\nwpBBzQNdrSkIm6famyAYMgJaioxWyu7ACiY5SFDUoFa9s1GdEsZpO7WC/0v5vefm\nMKohak/BCLxQfAVdeZcCpwNd6B3Qtvsziz64HaFybR9a3tN2ze+66Qlxs9AckaG8\n2vXggZrqEMFuyyBOqFHCpf4=\n-----END PRIVATE KEY-----",
  cert: process.env.CERT || '',
};

// SSL options
const options = {
  key: ssl.key,
  spdy: {
    protocols: ['h2'],
    ssl: true,
    plain: false
  }
};

if (ssl.cert) options.cert = ssl.cert;

// http server that will only be used as a redirect to SSL
http.createServer((req, res) => {
  res.writeHead(301, {
    "Location": "https://" + (req.headers['host'] + req.url)
      .replace(ports.http, ports.https)
      .replace(/:80$/, '')
      .replace(/:443$/, '')
  });
  res.end();
}).listen(ports.http);

// http2 server
spdy.createServer(options, app.callback()).listen(ports.https);