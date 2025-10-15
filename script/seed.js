// backend/scripts/seed.js (updated)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';

// Load env vars
dotenv.config();

// Kết nối database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Dữ liệu mẫu
const sampleUsers = [
  {
    name: 'Nguyễn Văn A',
    email: 'user1@example.com',
    password: '123456',
    role: 'user'
  },
  {
    name: 'Trần Thị B',
    email: 'user2@example.com',
    password: '123456',
    role: 'user'
  },
  {
    name: 'Công Ty ABC',
    email: 'employer1@example.com',
    password: '123456',
    role: 'employer'
  },
  {
    name: 'Công Ty XYZ',
    email: 'employer2@example.com',
    password: '123456',
    role: 'employer'
  }
];

const sampleJobs = [
  {
    title: 'Frontend Developer',
    company: 'Công ty ABC',
    location: 'Hà Nội',
    type: 'full-time',
    salary: '10-15 triệu',
    description: 'Tuyển dụng Frontend Developer có kinh nghiệm ReactJS, VueJS. Môi trường làm việc chuyên nghiệp, lương thưởng hấp dẫn.',
    requirements: ['2+ năm kinh nghiệm Frontend', 'Thành thạo ReactJS/VueJS', 'HTML/CSS/JavaScript'],
    skills: ['react', 'javascript', 'css', 'html5']
  },
  {
    title: 'Backend Developer',
    company: 'Công ty XYZ',
    location: 'TP HCM',
    type: 'full-time',
    salary: '15-20 triệu',
    description: 'Tuyển Backend Developer có kinh nghiệm Node.js, MongoDB. Tham gia phát triển hệ thống lớn.',
    requirements: ['3+ năm kinh nghiệm Backend', 'Node.js, Express', 'MongoDB/MySQL'],
    skills: ['nodejs', 'mongodb', 'express', 'api']
  },
  {
    title: 'Graphic Designer',
    company: 'Công ty DEF',
    location: 'Đà Nẵng',
    type: 'part-time',
    salary: '8-12 triệu',
    description: 'Tuyển Graphic Designer part-time, có thể làm remote. Thiết kế banner, logo, ấn phẩm truyền thông.',
    requirements: ['1+ năm kinh nghiệm thiết kế', 'Thành thạo Photoshop, Illustrator', 'Có portfolio'],
    skills: ['photoshop', 'illustrator', 'design', 'ui/ux']
  },
  {
    title: 'Business Analyst',
    company: 'Công ty GHI',
    location: 'Hà Nội',
    type: 'full-time',
    salary: '20-25 triệu',
    description: 'Tuyển Business Analyst có kinh nghiệm phân tích nghiệp vụ, làm việc với khách hàng và team kỹ thuật.',
    requirements: ['3+ năm kinh nghiệm BA', 'Phân tích nghiệp vụ', 'Tiếng Anh giao tiếp'],
    skills: ['business analysis', 'requirements', 'documentation']
  }
];

// Hàm seed database
const seedDatabase = async () => {
  try {
    console.log('🔃 Đang kết nối database...');
    await connectDB();

    console.log('🗑️ Đang xóa dữ liệu cũ...');
    await User.deleteMany();
    await Job.deleteMany();
    console.log('✅ Đã xóa dữ liệu cũ');

    console.log('🌱 Đang thêm users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Đã tạo user: ${user.name} (${user.email})`);
    }

    console.log('\n💼 Đang thêm jobs...');
    const employers = createdUsers.filter(user => user.role === 'employer');
    
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const employer = employers[i % employers.length]; // Phân bổ jobs cho employers
      
      const job = await Job.create({
        ...jobData,
        employer: employer._id
      });
      
      console.log(`✅ Đã tạo job: ${job.title} tại ${job.company}`);
    }

    console.log('\n🎉 Seed database thành công!');
    console.log(`📊 Đã tạo ${createdUsers.length} users và ${sampleJobs.length} jobs`);
    
    console.log('\n🔑 Thông tin đăng nhập test:');
    console.log('   User: user1@example.com / 123456');
    console.log('   Employer: employer1@example.com / 123456');

  } catch (error) {
    console.error('❌ Lỗi seed database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔒 Đã đóng kết nối database');
    process.exit(0);
  }
};

// Chạy seed
seedDatabase();