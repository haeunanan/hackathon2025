require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

/* ---------- 미들웨어 ---------- */
app.use(express.json());
app.use(cookieParser());
// 프록시를 쓸 거라 CORS 크게 신경 안 써도 되지만 로컬 테스트용으로 둠
app.use(cors({ origin: true, credentials: true }));
// Express 5는 '*' 대신 정규식 패턴 사용
app.use(cors({
  origin: ['http://localhost:3000','http://127.0.0.1:3000'],
  credentials: true,
}));
// 모든 OPTIONS(프리플라이트) 요청을 204로 응답 (경로 패턴 X, 에러 없음)
// server.js 맨 위 미들웨어들 다음에 잠깐 추가
app.use((req, _res, next) => {
  console.log('[API]', req.method, req.path);
  next();
});


/* ---------- DB 연결 ---------- */
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('MongoDB connected'))
  .catch((e) => { console.error('DB:', e.message); process.exit(1); });

/* ---------- User 모델 (로그인 + 게임 변수 포함) ---------- */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:  { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  passwordHash: { type: String, required: true },

  user_id: { type: String },

  highest_score: { type: Number, default: 0, min: 0 },
  all_score:     { type: Number, default: 0, min: 0 },

  strawberry_seed: { type: Number, default: 0, min: 0 },
  peach_seed:      { type: Number, default: 0, min: 0 },
  lemon_seed:      { type: Number, default: 0, min: 0 },
  grape_seed:      { type: Number, default: 0, min: 0 },

  strawberry: { type: Number, default: 0, min: 0 },
  peach:      { type: Number, default: 0, min: 0 },
  lemon:      { type: Number, default: 0, min: 0 },
  grape:      { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

/* ---------- JWT 유틸 ---------- */
const signToken = (user) =>
  jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: '7d',
  });

const getTokenFromReq = (req) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.token || null;
};

/* ---------- 헬스체크 ---------- */
app.get('/health', (_req, res) => res.json({ ok: true }));

/* ---------- 회원가입 ---------- */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ message: '옳지 않습니다' });

    const dup = await User.findOne({ email }).lean();
    if (dup) return res.status(409).json({ message: '옳지 않습니다' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name, passwordHash: hash });

    return res.status(201).json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: '옳지 않습니다' });
    console.error('[/auth/register] error:', e);
    return res.status(500).json({ message: '서버 오류' });
  }
});

/* ---------- 로그인 ---------- */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return res.json({ success: true, message: '로그인 성공', user: { email: user.email, name: user.name } });
  } catch (e) {
    console.error('[/auth/login] error:', e);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

/* ---------- 내 정보 ---------- */
app.get('/auth/me', (req, res) => {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ message: 'unauthorized' });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: { id: p.sub, email: p.email, name: p.name } });
  } catch {
    return res.status(401).json({ message: 'invalid token' });
  }
});

/* ---------- 로그아웃 ---------- */
app.post('/auth/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ message: 'ok' });
});

/* ---------- 서버 시작 ---------- */
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
