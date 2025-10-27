const mongoose = require("mongoose");
const express = require("express");
const User = require('./models/user');

const path = require("path");
const { SID, PORT, MONGO_URL } = require("./config/constants");

const recipeRouter = require("./routes/recipe-routes");
const inventoryRouter = require("./routes/inventory-routes");
const userRouter = require('./routes/user-routes');

const app = express();

function readUserId(req) {
  return (req.query && req.query.userId) || (req.body && req.body.userId) || '';
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// views
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/bootstrap', express.static(
  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')
));
app.use(express.static(path.join(__dirname, 'public')));


app.use(async (req, res, next) => {
  try {
    const userId = readUserId(req);
    let currentUser = null;

    if (userId) {
      currentUser = await User.findOne({ userId, isLoggedIn: true })
        .select('userId fullName email role')
        .lean();
    }

    res.locals.SID = app.locals.SID;
    res.locals.currentUser = currentUser;
    res.locals.userIdParam = userId || '';

    req.userIdParam = userId;
    req.currentUser = currentUser;
    next();
  } catch (e) { next(e); }
});

app.locals.SID =SID;


// DB connect
const { connectDB } = require('./config/db');
connectDB(MONGO_URL);

//ROUTERS
app.use("/", recipeRouter);
app.use("/", inventoryRouter);
app.use('/', userRouter);  

const distPath = path.join(__dirname, '..', 'cloudkitchenpro', 'dist', 'cloudkitchenpro', 'browser');
app.use('/', express.static(distPath));
app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(distPath, 'index.html')));

// 404
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
