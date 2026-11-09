const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const db = require('./src/db');
const { locals, csrf } = require('./src/middleware');

const app = express();
const prod = process.env.NODE_ENV === 'production';

if (prod && !process.env.SESSION_SECRET) throw new Error('Falta SESSION_SECRET');

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: prod ? [] : null
    }
  }
}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: prod ? '7d' : 0 }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));

app.get('/salud', (req, res) => res.send('ok'));

app.use(session({
  store: new PgSession({ pool: db.pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'solo-desarrollo',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: prod, maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(locals);
app.use(csrf);

app.use(require('./src/routes/site'));
app.use(require('./src/routes/team'));
app.use(require('./src/routes/compete'));
app.use(require('./src/routes/recruit'));
app.use(require('./src/routes/admin'));

app.use((req, res) => res.status(404).render('error', { title: 'Página no encontrada', message: 'La página que buscas no existe o fue movida.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error del servidor', message: 'Ocurrió un problema. Inténtalo de nuevo en unos minutos.' });
});

const port = process.env.PORT || 3000;
db.init().then(() => {
  app.listen(port, () => console.log(`IMPERIUM ESPORTS escuchando en ${port}`));
}).catch(err => {
  console.error('No se pudo iniciar la base de datos', err);
  process.exit(1);
});
