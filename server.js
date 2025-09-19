require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// ── 미들웨어
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true })); // 개발용(CORS 자동 허용). 배포 시 origin 고정 권장.
app.use(express.static(path.join(__dirname, 'public')));

// ── DB 연결
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('MongoDB connected'))
  .catch((e) => { console.error('DB:', e.message); process.exit(1); });

// ── User 모델 (passwordHash로 통일)
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:  { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  passwordHash: { type: String, required: true }
}, { timestamps: true }));

// ── 유틸
const signToken = (user) =>
  jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, {
    subject: String(user._id), expiresIn: '7d'
  });

const getTokenFromReq = (req) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.token || null;
};

// ── 헬스체크
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── 회원가입
app.post('/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ message: '옳지 않습니다' });

    const dup = await User.findOne({ email }).lean();
    if (dup) return res.status(409).json({ message: '옳지 않습니다' }); // 이메일 중복

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name, passwordHash: hash });
    // 요구사항: 가입 후 로그인 페이지로 돌아가므로 쿠키 설정은 생략
    return res.status(201).json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: '옳지 않습니다' });
    console.error('[/auth/register] error:', e);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// ── 로그인 (passwordHash/password 혼재 데이터도 안전하게 처리)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    // 과거 데이터 호환 (만약 password 필드가 존재할 수도 있는 프로젝트 이력 대비)
    const storedHash = user.passwordHash || user.password /* undefined일 수 있음 */;
    if (!storedHash) {
      // 계정은 있으나 비밀번호가 저장되어 있지 않음
      return res.status(200).json({ success: false, message: '저장된 정보가 없습니다' });
    }

    const ok = await bcrypt.compare(password, storedHash);
    if (!ok) return res.status(400).json({ success: false, message: '옳지 않습니다' });

    // 기본 정보 확인 (요구: 저장된 정보가 없으면 메시지)
    if (!user.email || !user.name) {
      return res.status(200).json({ success: false, message: '저장된 정보가 없습니다' });
    }

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return res.json({ success: true, message: '로그인 성공', user: { email: user.email, name: user.name } });
  } catch (e) {
    console.error('[/auth/login] error:', e);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ── 내 정보
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

// ── 로그아웃
app.post('/auth/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ message: 'ok' });
});

// ── 서버 시작
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`http://localhost:${port}`));
