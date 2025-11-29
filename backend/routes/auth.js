// API routes cho xác thực (đăng ký, đăng nhập)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const passport = require('passport');
const { pool } = require('../config/database');

// Lưu trữ OTP tạm thời (trong production nên dùng Redis)
const otpStore = new Map();

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Hàm tạo OTP 6 số
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi email OTP
async function sendOTPEmail(email, otp, ho_ten) {
    const mailOptions = {
        from: `"QuangHưng Mobile" <${process.env.EMAIL_USER || 'noreply@quanghungmobile.com'}>`,
        to: email,
        subject: '🔐 Mã xác thực OTP - QuangHưng Mobile',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #e41e26, #c5111a); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">QuangHưng Mobile</h1>
                    <p style="color: #ffcdd2; margin: 10px 0 0;">Xác thực tài khoản</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; color: #333;">Xin chào <strong>${ho_ten || 'bạn'}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Mã OTP xác thực của bạn là:</p>
                    <div style="background: #fff; border: 2px dashed #e41e26; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
                        <span style="font-size: 36px; font-weight: bold; color: #e41e26; letter-spacing: 8px;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">⏰ Mã có hiệu lực trong <strong>5 phút</strong></p>
                    <p style="font-size: 14px; color: #666;">⚠️ Không chia sẻ mã này với bất kỳ ai</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.<br>
                        © 2025 QuangHưng Mobile - Uy tín - Chất lượng - Giá tốt
                    </p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Đảm bảo thư mục avatars tồn tại
const avatarDir = path.join(__dirname, '../../frontend/images/avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// Cấu hình multer để upload avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, avatarDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: function (req, file, cb) {
        // Mở rộng hỗ trợ nhiều định dạng ảnh
        const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|tiff|tif|svg|ico|heic|heif|avif|jfif/;
        const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp|bmp|tiff|svg\+xml|x-icon|vnd\.microsoft\.icon|heic|heif|avif)|application\/octet-stream/;
        
        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.test(file.mimetype);
        
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Định dạng ảnh không được hỗ trợ! Chấp nhận: JPG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO, HEIC, AVIF'));
    }
});

// Middleware xử lý lỗi upload
const handleUpload = (req, res, next) => {
    upload.single('avt')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: 'Lỗi upload: ' + err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

// POST /api/auth/send-otp - Gửi mã OTP đến email
router.post('/send-otp', async (req, res) => {
    try {
        const { email, ho_ten } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
        }

        // Kiểm tra email đã tồn tại chưa
        const [existing] = await pool.query('SELECT ma_kh FROM khach_hang WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký' });
        }

        // Tạo OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

        // Lưu OTP
        otpStore.set(email, { otp, expiresAt, ho_ten });

        // Gửi email
        try {
            await sendOTPEmail(email, otp, ho_ten);
            console.log(`OTP sent to ${email}: ${otp}`); // Log để debug
            res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn' });
        } catch (emailError) {
            console.error('Lỗi gửi email:', emailError);
            // Vẫn trả về thành công để test (trong production cần xử lý khác)
            console.log(`OTP for ${email}: ${otp}`); // Log OTP để test
            res.json({ success: true, message: 'Mã OTP đã được gửi (kiểm tra console nếu email không nhận được)', otp_debug: otp });
        }

    } catch (error) {
        console.error('Lỗi gửi OTP:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/verify-otp - Xác thực OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã OTP' });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Mã OTP không đúng' });
        }

        // OTP đúng - đánh dấu email đã xác thực
        otpStore.set(email, { ...storedData, verified: true });

        res.json({ success: true, message: 'Xác thực OTP thành công' });

    } catch (error) {
        console.error('Lỗi xác thực OTP:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/register - Đăng ký khách hàng (sau khi xác thực OTP)
router.post('/register', handleUpload, async (req, res) => {
    try {
        const { ho_ten, email, so_dt, dia_chi, mat_khau, skip_otp } = req.body;
        const avtFile = req.file;

        // Validate required fields
        if (!email || !mat_khau || !ho_ten) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc (họ tên, email, mật khẩu)' 
            });
        }

        // Kiểm tra OTP đã xác thực chưa (bỏ qua nếu skip_otp = true để test)
        if (!skip_otp) {
            const storedData = otpStore.get(email);
            if (!storedData || !storedData.verified) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email chưa được xác thực. Vui lòng xác thực OTP trước.' 
                });
            }
        }

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT ma_kh FROM khach_hang WHERE email = ?', 
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email đã được sử dụng' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(mat_khau, 10);

        // Đường dẫn avatar (nếu có upload)
        const avtPath = avtFile ? `images/avatars/${avtFile.filename}` : null;

        // Insert new customer
        const [result] = await pool.query(
            `INSERT INTO khach_hang (ho_ten, avt, email, so_dt, dia_chi, mat_khau) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ho_ten, avtPath, email, so_dt || null, dia_chi || null, hashedPassword]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký thành công',
            data: { ma_kh: result.insertId, ho_ten, email, avt: avtPath }
        });

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/login - Đăng nhập khách hàng
router.post('/login', async (req, res) => {
    try {
        const { email, mat_khau } = req.body;

        if (!email || !mat_khau) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập email và mật khẩu' 
            });
        }

        // Find user by email or phone
        const [users] = await pool.query(
            'SELECT * FROM khach_hang WHERE email = ? OR so_dt = ?', 
            [email, email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // Return user info (without password)
        res.json({ 
            success: true, 
            message: 'Đăng nhập thành công',
            data: {
                ma_kh: user.ma_kh,
                ho_ten: user.ho_ten,
                email: user.email,
                so_dt: user.so_dt,
                dia_chi: user.dia_chi,
                avt: user.avt,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/admin/login - Đăng nhập admin
router.post('/admin/login', async (req, res) => {
    try {
        const { tai_khoan, mat_khau } = req.body;

        if (!tai_khoan || !mat_khau) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập tài khoản và mật khẩu' 
            });
        }

        // Find admin
        const [admins] = await pool.query(
            'SELECT * FROM admin WHERE tai_khoan = ?', 
            [tai_khoan]
        );

        if (admins.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tài khoản hoặc mật khẩu không đúng' 
            });
        }

        const admin = admins[0];

        // Compare password (assuming plain text for now, should use bcrypt)
        const isMatch = admin.mat_khau === mat_khau || await bcrypt.compare(mat_khau, admin.mat_khau).catch(() => false);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tài khoản hoặc mật khẩu không đúng' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Đăng nhập admin thành công',
            data: {
                ma_admin: admin.ma_admin,
                tai_khoan: admin.tai_khoan,
                ho_ten: admin.ho_ten,
                quyen: admin.quyen,
                avt: admin.avt,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// PUT /api/auth/profile/:id - Cập nhật hồ sơ khách hàng
router.put('/profile/:id', handleUpload, async (req, res) => {
    try {
        const { id } = req.params;
        const { ho_ten, so_dt, dia_chi } = req.body;
        const avtFile = req.file;

        // Kiểm tra user tồn tại
        const [existing] = await pool.query('SELECT * FROM khach_hang WHERE ma_kh = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Chuẩn bị dữ liệu cập nhật
        let updateFields = [];
        let updateValues = [];

        if (ho_ten) {
            updateFields.push('ho_ten = ?');
            updateValues.push(ho_ten);
        }
        if (so_dt !== undefined) {
            updateFields.push('so_dt = ?');
            updateValues.push(so_dt || null);
        }
        if (dia_chi !== undefined) {
            updateFields.push('dia_chi = ?');
            updateValues.push(dia_chi || null);
        }
        if (avtFile) {
            const avtPath = `images/avatars/${avtFile.filename}`;
            updateFields.push('avt = ?');
            updateValues.push(avtPath);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật' });
        }

        // Thực hiện cập nhật
        updateValues.push(id);
        await pool.query(
            `UPDATE khach_hang SET ${updateFields.join(', ')} WHERE ma_kh = ?`,
            updateValues
        );

        // Lấy thông tin user sau khi cập nhật
        const [updated] = await pool.query('SELECT * FROM khach_hang WHERE ma_kh = ?', [id]);
        const user = updated[0];

        res.json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            data: {
                ma_kh: user.ma_kh,
                ho_ten: user.ho_ten,
                email: user.email,
                so_dt: user.so_dt,
                dia_chi: user.dia_chi,
                avt: user.avt,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// Lưu trữ OTP reset password riêng
const resetOtpStore = new Map();

// POST /api/auth/forgot-password - Gửi OTP reset password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
        }

        // Kiểm tra email có tồn tại không
        const [users] = await pool.query('SELECT ma_kh, ho_ten FROM khach_hang WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống' });
        }

        const user = users[0];

        // Tạo OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

        // Lưu OTP reset
        resetOtpStore.set(email, { otp, expiresAt, ma_kh: user.ma_kh });

        // Gửi email reset password
        const mailOptions = {
            from: `"QuangHưng Mobile" <${process.env.EMAIL_USER || 'noreply@quanghungmobile.com'}>`,
            to: email,
            subject: '🔑 Đặt lại mật khẩu - QuangHưng Mobile',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #e41e26, #c5111a); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">QuangHưng Mobile</h1>
                        <p style="color: #ffcdd2; margin: 10px 0 0;">Đặt lại mật khẩu</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333;">Xin chào <strong>${user.ho_ten}</strong>,</p>
                        <p style="font-size: 16px; color: #333;">Bạn đã yêu cầu đặt lại mật khẩu. Mã OTP của bạn là:</p>
                        <div style="background: #fff; border: 2px dashed #e41e26; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
                            <span style="font-size: 36px; font-weight: bold; color: #e41e26; letter-spacing: 8px;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #666;">⏰ Mã có hiệu lực trong <strong>5 phút</strong></p>
                        <p style="font-size: 14px; color: #666;">⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © 2025 QuangHưng Mobile - Uy tín - Chất lượng - Giá tốt
                        </p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Reset OTP sent to ${email}: ${otp}`);
            res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn' });
        } catch (emailError) {
            console.error('Lỗi gửi email:', emailError);
            console.log(`Reset OTP for ${email}: ${otp}`);
            res.json({ success: true, message: 'Mã OTP đã được gửi (kiểm tra console nếu email không nhận được)', otp_debug: otp });
        }

    } catch (error) {
        console.error('Lỗi forgot password:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/verify-reset-otp - Xác thực OTP reset password
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã OTP' });
        }

        const storedData = resetOtpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn' });
        }

        if (Date.now() > storedData.expiresAt) {
            resetOtpStore.delete(email);
            return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Mã OTP không đúng' });
        }

        // OTP đúng - đánh dấu đã xác thực
        resetOtpStore.set(email, { ...storedData, verified: true });

        res.json({ success: true, message: 'Xác thực OTP thành công' });

    } catch (error) {
        console.error('Lỗi verify reset OTP:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// POST /api/auth/reset-password - Đặt lại mật khẩu mới
router.post('/reset-password', async (req, res) => {
    try {
        const { email, mat_khau_moi } = req.body;

        if (!email || !mat_khau_moi) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu mới' });
        }

        if (mat_khau_moi.length < 8) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
        }

        // Kiểm tra OTP đã xác thực chưa
        const storedData = resetOtpStore.get(email);
        if (!storedData || !storedData.verified) {
            return res.status(400).json({ success: false, message: 'Vui lòng xác thực OTP trước' });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu
        await pool.query('UPDATE khach_hang SET mat_khau = ? WHERE email = ?', [hashedPassword, email]);

        // Xóa OTP sau khi reset thành công
        resetOtpStore.delete(email);

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });

    } catch (error) {
        console.error('Lỗi reset password:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// PUT /api/auth/change-password/:id - Đổi mật khẩu
router.put('/change-password/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mat_khau_cu, mat_khau_moi } = req.body;

        if (!mat_khau_cu || !mat_khau_moi) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
        }

        if (mat_khau_moi.length < 8) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
        }

        // Lấy user hiện tại
        const [users] = await pool.query('SELECT * FROM khach_hang WHERE ma_kh = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const user = users[0];

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(mat_khau_cu, user.mat_khau);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu
        await pool.query('UPDATE khach_hang SET mat_khau = ? WHERE ma_kh = ?', [hashedPassword, id]);

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// ==================== GOOGLE OAUTH ====================

// GET /api/auth/google - Bắt đầu đăng nhập Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// GET /api/auth/google/callback - Callback từ Google
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login.html?error=google_failed' }),
    (req, res) => {
        // Đăng nhập thành công - redirect về frontend với user data
        const userData = encodeURIComponent(JSON.stringify(req.user));
        res.redirect(`/login.html?google_success=true&user=${userData}`);
    }
);

// GET /api/auth/google/user - Lấy thông tin user đã đăng nhập
router.get('/google/user', (req, res) => {
    if (req.user) {
        res.json({ success: true, data: req.user });
    } else {
        res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
});

// POST /api/auth/google/logout - Đăng xuất Google
router.post('/google/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi đăng xuất' });
        }
        res.json({ success: true, message: 'Đăng xuất thành công' });
    });
});

module.exports = router;
