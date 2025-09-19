const mongoose = require('mongoose');
const User = require('./user'); // 같은 폴더라 ./User 로 불러오기

(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://quokka0623:sk722512@cluster0.uyovpwr.mongodb.net/hackathon2025?retryWrites=true&w=majority&authSource=admin'
    );
    console.log('success');

    // 유저 생성 테스트
    const u = await User.create({
      email: 'test@example.com',
      name: '홍길동',
      passwordHash: 'dummy'
    });
    console.log('new:', u);

    process.exit(0);
  } catch (err) {
    console.error('error:', err.name, err.message);
    process.exit(1);
  }
})();
