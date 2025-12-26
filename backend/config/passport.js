const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');

module.exports = function(passport) {
    // Serialize user
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    // Deserialize user
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        passReqToCallback: true // Để truy cập req
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const ho_ten = profile.displayName;
            const avt = profile.photos[0]?.value || null;
            const google_id = profile.id;
            
            // Lấy state từ query hoặc session để biết đang đăng nhập hay đăng ký
            // Google trả về state trong req.query.state khi callback
            const state = req.query.state || req.session?.googleAuthState || 'login';
            const isRegistering = state === 'register';
            
            console.log('Google OAuth - State:', state, '- isRegistering:', isRegistering, '- Email:', email);
            console.log('Query params:', req.query);
            
            // Kiểm tra user đã tồn tại chưa
            const [existingUsers] = await pool.query(
                'SELECT * FROM khach_hang WHERE email = ? OR google_id = ?',
                [email, google_id]
            );

            let user;

            if (existingUsers.length > 0) {
                // User đã tồn tại
                user = existingUsers[0];
                console.log('User đã tồn tại trong DB:', user.email);
                
                // Nếu đang đăng ký mà email đã tồn tại → báo lỗi
                if (isRegistering) {
                    return done(null, false, { message: 'email_exists' });
                }
                
                // Cập nhật google_id nếu chưa có
                if (!user.google_id) {
                    await pool.query(
                        'UPDATE khach_hang SET google_id = ?, avt = COALESCE(avt, ?) WHERE ma_kh = ?',
                        [google_id, avt, user.ma_kh]
                    );
                }
            } else {
                // User chưa tồn tại
                console.log('User chưa tồn tại trong DB');
                
                if (isRegistering) {
                    // Đang đăng ký → tạo tài khoản mới
                    console.log('Đang đăng ký - tạo tài khoản mới');
                    const [result] = await pool.query(
                        'INSERT INTO khach_hang (ho_ten, email, avt, google_id, mat_khau) VALUES (?, ?, ?, ?, ?)',
                        [ho_ten, email, avt, google_id, 'google_oauth_user']
                    );
                    // Trả về thông tin đăng ký thành công (không đăng nhập ngay)
                    return done(null, false, { message: 'register_success', email: email, ho_ten: ho_ten });
                } else {
                    // Đang đăng nhập mà chưa có tài khoản → từ chối, yêu cầu đăng ký trước
                    console.log('Đang đăng nhập nhưng chưa có tài khoản - từ chối');
                    return done(null, false, { message: 'not_registered' });
                }
            }

            // Kiểm tra xem user có phải admin không
            const [adminCheck] = await pool.query(
                'SELECT * FROM admin WHERE tai_khoan = ?',
                [email]
            );

            const isAdmin = adminCheck.length > 0;
            const adminData = isAdmin ? adminCheck[0] : null;

            return done(null, {
                ma_kh: user.ma_kh,
                ma_admin: adminData?.ma_admin || null,
                ho_ten: user.ho_ten || ho_ten,
                email: user.email || email,
                avt: user.avt || avt,
                so_dt: user.so_dt,
                dia_chi: user.dia_chi,
                gioi_tinh: user.gioi_tinh,
                ngay_sinh: user.ngay_sinh,
                quyen: adminData?.quyen || null,
                role: isAdmin ? 'admin' : 'customer',
                isAdmin: isAdmin
            });

        } catch (error) {
            console.error('Google OAuth Error:', error);
            return done(error, null);
        }
    }));
};
