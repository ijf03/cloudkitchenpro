const User = require('../models/user');

// check email format
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// check password format
const PW_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
// preset roles
const ROLES = ['admin', 'chef', 'manager'];

async function nextUserId() {
  const last = await User.findOne().sort({ userId: -1 }).lean();
  if (!last || !/^U-\d{5}$/.test(last.userId || '')) return 'U-00001';
  const n = parseInt(last.userId.slice(2), 10) + 1;
  return `U-${String(n).padStart(5, '0')}`;
}

function firstError(err) {
  if (!err) return null;
  if (err.code === 11000) return 'Email or userId must be unique.';
  if (err.errors) {
    const k = Object.keys(err.errors)[0];
    return err.errors[k]?.message || 'Validation error.';
  }
  return err.message || 'Validation error.';
}

// GET reg form
exports.registerForm = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Sign up',
    SID: req.app.locals.SID,
    roles: ROLES,
    form: {},
    error: null
  });
};

// POST reg
exports.register = async (req, res) => {
  const SID = req.app.locals.SID;
  const { email, password, fullName, role, phone } = req.body || {};
  const form = { email, fullName, role, phone };

  // Server checks
  if (!EMAIL_RX.test(String(email || '').toLowerCase())) {
    return res.status(400).render('auth/register', { pageTitle:'Sign up', SID, roles:ROLES, form, error:'Invalid email format.' });
  }
  if (!PW_RX.test(String(password || ''))) {
    return res.status(400).render('auth/register', { pageTitle:'Sign up', SID, roles:ROLES, form, error:'Password must be 8+ chars incl. upper, lower, number, special.' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).render('auth/register', { pageTitle:'Sign up', SID, roles:ROLES, form, error:'Invalid role selected.' });
  }
  if (!String(fullName || '').trim()) {
    return res.status(400).render('auth/register', { pageTitle:'Sign up', SID, roles:ROLES, form, error:'Full name is required.' });
  }

  try {
    const exists = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
    if (exists) {
      return res.status(400).render('auth/register', { pageTitle:'Sign up', SID, roles:ROLES, form, error:'Email is already registered.' });
    }

    await User.create({
      userId: await nextUserId(),
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      password,
      role,
      phone: String(phone || '').trim()
    });

    return res.redirect(`/login-${SID}`);
  } catch (err) {
    return res.status(400).render('auth/register', {
      pageTitle: 'Sign up', SID, roles: ROLES, form, error: firstError(err)
    });
  }
};

// GET login
exports.loginForm = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    SID: req.app.locals.SID,
    form: {},
    error: null
  });
};

// POST login
exports.login = async (req, res) => {
  const SID = req.app.locals.SID;
  const { email, password } = req.body || {};
  const form = { email };

  if (!EMAIL_RX.test(String(email || '').toLowerCase()) || !password) {
    return res.status(400).render('auth/login', { pageTitle:'Login', SID, form, error:'Please enter a valid email and password.' });
  }

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || user.password !== String(password)) {
      return res.status(400).render('auth/login', { pageTitle:'Login', SID, form, error:'Invalid email or password.' });
    }

    // set flag and SAVE
    user.isLoggedIn = true;
    await user.save();

    //Redirect
    return res.redirect(`/?userId=${user.userId}`);
  } catch (err) {
    return res.status(500).render('auth/login', { pageTitle:'Login', SID, form, error:'Something went wrong. Please try again.' });
  }
};


//logout
exports.logout = async (req, res) => {
  const SID = req.app.locals.SID;
  const userId = req.userIdParam;  // came from query/body via the middleware

  if (userId) {
    await User.updateOne({ userId }, { $set: { isLoggedIn: false } });
  }
  // back to login (no userId in URL)
  return res.redirect(`/login-${SID}`);
};

exports.loginJson = async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.isLoggedIn = true;
    await user.save();

    return res.json({
      _id: user._id,
      userId: user.userId,
      fullName: user.fullName,
      role: user.role || 'chef'
    });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed.' });
  }
};

exports.registerJson = async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!email || !req.body?.password || !req.body?.fullName) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(400).json({ message: 'Email is already registered.' });
    const last = await User.findOne().sort({ userId: -1 }).lean();
    const next = (!last || !/^U-\d{5}$/.test(last.userId || '')) ? 'U-00001'
               : `U-${String(parseInt(last.userId.slice(2), 10) + 1).padStart(5, '0')}`;

    const user = await User.create({
      userId: next,
      fullName: String(req.body.fullName).trim(),
      email,
      password: String(req.body.password),
      role: req.body.role || 'chef',
      isLoggedIn: true
    });

    return res.status(201).json({
      _id: user._id, userId: user.userId, fullName: user.fullName, role: user.role
    });
  } catch {
    return res.status(400).json({ message: 'Registration failed.' });
  }
};

exports.logoutJson = async (req, res) => {
  try {
    const userId = String(req.body?.userId || req.query?.userId || '');
    if (userId) await User.updateOne({ userId }, { $set: { isLoggedIn: false } });
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true });
  }
};