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
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const ho_ten = profile.displayName;
            const avt = profile.photos[0]?.value || null;
            const google_id = profile.id;

            // Kiểm tra user đã tồn tại chưa
            const [existingUsers] = await pool.query(
                'SELECT * FROM khach_hang WHERE email = ? OR google_id = ?',
                [email, google_id]
            );

            let user;

            if (existingUsers.length > 0) {
                // User đã tồn tại - cập nhật google_id nếu chưa có
                user = existingUsers[0];
                if (!user.google_id) {
                    await pool.query(
                        'UPDATE khach_hang SET google_id = ?, avt = COALESCE(avt, ?) WHERE ma_kh = ?',
                        [google_id, avt, user.ma_kh]
                    );
                }
            } else {
                // Tạo user mới
                const [result] = await pool.query(
                    'INSERT INTO khach_hang (ho_ten, email, avt, google_id, mat_khau) VALUES (?, ?, ?, ?, ?)',
                    [ho_ten, email, avt, google_id, 'google_oauth_user']
                );
                user = {
                    ma_kh: result.insertId,
                    ho_ten,
                    email,
                    avt,
                    google_id
                };
            }

            return done(null, {
                ma_kh: user.ma_kh,
                ho_ten: user.ho_ten || ho_ten,
                email: user.email || email,
                avt: user.avt || avt,
                so_dt: user.so_dt,
                dia_chi: user.dia_chi,
                role: 'customer'
            });

        } catch (error) {
            console.error('Google OAuth Error:', error);
            return done(error, null);
        }
    }));
};
