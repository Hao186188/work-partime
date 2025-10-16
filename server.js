const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper functions
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [], jobs: [], employers: [], applications: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Routes

// Đăng ký người dùng
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const data = readData();

        // Kiểm tra email đã tồn tại
        if (data.users.find(user => user.email === email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email đã được sử dụng' 
            });
        }

        // Kiểm tra số điện thoại đã tồn tại
        if (data.users.find(user => user.phone === phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Số điện thoại đã được sử dụng' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            password: hashedPassword,
            hasCV: false,
            cvData: null,
            applications: [],
            createdAt: new Date().toISOString(),
            verified: false
        };

        data.users.push(newUser);
        writeData(data);

        res.json({
            success: true,
            message: 'Đăng ký thành công!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                hasCV: newUser.hasCV
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Đăng nhập
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = readData();

        // Tìm user theo email hoặc số điện thoại
        const user = data.users.find(user => 
            user.email === email || user.phone === email
        );

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email/số điện thoại hoặc mật khẩu không đúng' 
            });
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email/số điện thoại hoặc mật khẩu không đúng' 
            });
        }

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                hasCV: user.hasCV
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Lấy danh sách công việc
app.get('/api/jobs', (req, res) => {
    try {
        const data = readData();
        const activeJobs = data.jobs.filter(job => job.active);
        
        res.json({
            success: true,
            data: activeJobs
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Đăng công việc mới (cho nhà tuyển dụng)
app.post('/api/jobs', (req, res) => {
    try {
        const { title, company, location, type, salary, description, requirements, benefits, employerId } = req.body;
        const data = readData();

        // Kiểm tra employer tồn tại
        const employer = data.employers.find(emp => emp.id === employerId);
        if (!employer) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nhà tuyển dụng không tồn tại' 
            });
        }

        const newJob = {
            id: Date.now(),
            title,
            company,
            location,
            type,
            salary,
            description,
            requirements: requirements || [],
            benefits: benefits || [],
            employerId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            active: true,
            applications: []
        };

        data.jobs.push(newJob);
        writeData(data);

        res.json({
            success: true,
            message: 'Đăng tuyển thành công!',
            job: newJob
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Ứng tuyển công việc
app.post('/api/applications', (req, res) => {
    try {
        const { jobId, userId } = req.body;
        const data = readData();

        // Kiểm tra job tồn tại
        const job = data.jobs.find(j => j.id === jobId);
        if (!job) {
            return res.status(400).json({ 
                success: false, 
                message: 'Công việc không tồn tại' 
            });
        }

        // Kiểm tra user tồn tại và có CV
        const user = data.users.find(u => u.id === userId);
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Người dùng không tồn tại' 
            });
        }

        if (!user.hasCV) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng tạo CV trước khi ứng tuyển' 
            });
        }

        // Kiểm tra đã ứng tuyển chưa
        const existingApplication = data.applications.find(app => 
            app.jobId === jobId && app.userId === userId
        );

        if (existingApplication) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn đã ứng tuyển công việc này rồi' 
            });
        }

        const newApplication = {
            id: Date.now(),
            jobId,
            userId,
            employerId: job.employerId,
            status: 'pending',
            appliedAt: new Date().toISOString(),
            employerViewed: false,
            notes: ''
        };

        data.applications.push(newApplication);
        
        // Thêm application ID vào job và user
        job.applications.push(newApplication.id);
        user.applications.push({
            jobId: jobId,
            applicationId: newApplication.id,
            appliedAt: newApplication.appliedAt,
            status: 'pending'
        });

        writeData(data);

        res.json({
            success: true,
            message: 'Ứng tuyển thành công!',
            application: newApplication
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Lấy ứng tuyển của user
app.get('/api/users/:userId/applications', (req, res) => {
    try {
        const { userId } = req.params;
        const data = readData();

        const userApplications = data.applications.filter(app => 
            app.userId === parseInt(userId)
        );

        // Thêm thông tin job vào mỗi application
        const applicationsWithJobInfo = userApplications.map(app => {
            const job = data.jobs.find(j => j.id === app.jobId);
            return {
                ...app,
                jobTitle: job?.title,
                company: job?.company,
                jobType: job?.type
            };
        });

        res.json({
            success: true,
            data: applicationsWithJobInfo
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Cập nhật CV cho user
app.put('/api/users/:userId/cv', (req, res) => {
    try {
        const { userId } = req.params;
        const { cvData } = req.body;
        const data = readData();

        const userIndex = data.users.findIndex(u => u.id === parseInt(userId));
        if (userIndex === -1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Người dùng không tồn tại' 
            });
        }

        data.users[userIndex].cvData = cvData;
        data.users[userIndex].hasCV = true;
        data.users[userIndex].cvUpdatedAt = new Date().toISOString();

        writeData(data);

        res.json({
            success: true,
            message: 'Cập nhật CV thành công!'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📁 Dữ liệu được lưu tại: ${DATA_FILE}`);
});