// api.js - Cập nhật với hệ thống đồng bộ dữ liệu
class DataAPI {
    constructor() {
        this.employersData = null;
        this.jobsData = null;
        this.init();
    }

    // Khởi tạo dữ liệu
    async init() {
        await this.loadAllData();
    }

    // Load tất cả dữ liệu
    async loadAllData() {
        await this.loadEmployersData();
        await this.loadJobsData();
    }

    // Load employers data từ localStorage (tạm thời) hoặc JSON
    async loadEmployersData() {
        try {
            // Ưu tiên dùng localStorage để demo
            const localData = localStorage.getItem('employersData');
            if (localData) {
                this.employersData = JSON.parse(localData);
            } else {
                // Fallback: tạo dữ liệu mẫu
                this.employersData = {
                    employers: [
                        {
                            id: 1,
                            email: 'techcompany@email.com',
                            password: '123456',
                            companyName: 'Công ty Công nghệ ABC',
                            phone: '0912345678',
                            address: '123 Đường ABC, Quận 1, TP.HCM',
                            taxCode: '0123456789',
                            contactPerson: 'Nguyễn Văn A',
                            position: 'Trưởng phòng Nhân sự',
                            industry: 'technology',
                            isVerified: true,
                            isActive: true,
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date().toISOString(),
                            jobPosts: 0
                        }
                    ],
                    users: [],
                    applications: [],
                    settings: { lastUpdate: new Date().toISOString() }
                };
                await this.saveEmployersData();
            }
        } catch (error) {
            console.error('Lỗi load employers data:', error);
        }
    }

    // Load jobs data từ localStorage (tạm thời) hoặc JSON
    async loadJobsData() {
        try {
            // Ưu tiên dùng localStorage để demo
            const localData = localStorage.getItem('jobsData');
            if (localData) {
                this.jobsData = JSON.parse(localData);
            } else {
                // Fallback: tạo dữ liệu mẫu
                this.jobsData = {
                    jobs: [
                        {
                            id: 1,
                            jobTitle: 'Lập trình viên Frontend',
                            jobType: 'fulltime',
                            industry: 'technology',
                            location: 'Hồ Chí Minh',
                            salaryMin: '15',
                            salaryMax: '25',
                            experience: 'junior',
                            workArrangement: ['office'],
                            jobDescription: 'Phát triển giao diện người dùng cho các ứng dụng web...',
                            requirements: 'Kinh nghiệm React, JavaScript, HTML/CSS...',
                            benefits: 'Lương thưởng hấp dẫn, bảo hiểm, đào tạo...',
                            selectedBenefits: ['insurance', 'training'],
                            applicationDeadline: '2024-12-31',
                            vacancies: '2',
                            contactInfo: 'HR Department - 0912345678',
                            employerId: 1,
                            employerName: 'Công ty Công nghệ ABC',
                            status: 'active',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            applications: 5,
                            views: 120
                        },
                        {
                            id: 2,
                            jobTitle: 'Nhân viên Kinh doanh',
                            jobType: 'fulltime',
                            industry: 'sales',
                            location: 'Hà Nội',
                            salaryMin: '10',
                            salaryMax: '15',
                            experience: 'fresher',
                            workArrangement: ['office', 'hybrid'],
                            jobDescription: 'Tìm kiếm khách hàng và phát triển thị trường...',
                            requirements: 'Kỹ năng giao tiếp tốt, có tinh thần học hỏi...',
                            benefits: 'Lương cứng + hoa hồng, thưởng doanh số...',
                            selectedBenefits: ['bonus', 'healthcare'],
                            applicationDeadline: '2024-11-30',
                            vacancies: '3',
                            contactInfo: 'Phòng Kinh doanh - 0987654321',
                            employerId: 1,
                            employerName: 'Công ty Công nghệ ABC',
                            status: 'active',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            applications: 8,
                            views: 95
                        }
                    ],
                    categories: [
                        { id: 1, name: 'Công nghệ thông tin', slug: 'technology' },
                        { id: 2, name: 'Kinh doanh', slug: 'sales' },
                        { id: 3, name: 'Marketing', slug: 'marketing' }
                    ],
                    lastUpdate: new Date().toISOString()
                };
                await this.saveJobsData();
            }
        } catch (error) {
            console.error('Lỗi load jobs data:', error);
        }
    }

    // Save employers data
    async saveEmployersData() {
        try {
            localStorage.setItem('employersData', JSON.stringify(this.employersData));
            console.log('✅ Đã lưu employers data');
            return true;
        } catch (error) {
            console.error('❌ Lỗi save employers data:', error);
            return false;
        }
    }

    // Save jobs data
    async saveJobsData() {
        try {
            localStorage.setItem('jobsData', JSON.stringify(this.jobsData));
            console.log('✅ Đã lưu jobs data');
            
            // Đồng bộ với các trang khác bằng event
            this.notifyDataChange();
            return true;
        } catch (error) {
            console.error('❌ Lỗi save jobs data:', error);
            return false;
        }
    }

    // Thông báo khi dữ liệu thay đổi
    notifyDataChange() {
        const event = new CustomEvent('jobsDataChanged');
        window.dispatchEvent(event);
    }

    // Employer methods
    async getEmployers() {
        await this.loadEmployersData();
        return this.employersData.employers || [];
    }

    async addEmployer(employer) {
        await this.loadEmployersData();
        employer.id = Date.now();
        employer.createdAt = new Date().toISOString();
        employer.isVerified = false;
        employer.isActive = true;
        employer.jobPosts = 0;
        
        this.employersData.employers.push(employer);
        this.employersData.settings.lastUpdate = new Date().toISOString();
        
        await this.saveEmployersData();
        return employer;
    }

    async findEmployerByEmail(email) {
        const employers = await this.getEmployers();
        return employers.find(emp => emp.email === email);
    }

    async updateEmployer(employerId, updates) {
        await this.loadEmployersData();
        const employerIndex = this.employersData.employers.findIndex(emp => emp.id === employerId);
        if (employerIndex !== -1) {
            this.employersData.employers[employerIndex] = {
                ...this.employersData.employers[employerIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveEmployersData();
            return this.employersData.employers[employerIndex];
        }
        return null;
    }

    // Jobs methods
    async getJobs() {
        await this.loadJobsData();
        return this.jobsData.jobs || [];
    }

    async getActiveJobs() {
        const jobs = await this.getJobs();
        return jobs.filter(job => job.status === 'active');
    }

    async addJob(job) {
        await this.loadJobsData();
        
        // Tạo job mới
        const newJob = {
            id: Date.now(),
            ...job,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applications: 0,
            views: 0
        };
        
        this.jobsData.jobs.push(newJob);
        this.jobsData.lastUpdate = new Date().toISOString();
        
        // Cập nhật số lượng job posts của employer
        await this.updateEmployerJobCount(job.employerId);
        
        await this.saveJobsData();
        console.log('✅ Đã thêm job mới:', newJob);
        return newJob;
    }

    async updateEmployerJobCount(employerId) {
        const jobs = await this.getJobs();
        const employerJobs = jobs.filter(job => job.employerId === employerId);
        await this.updateEmployer(employerId, { jobPosts: employerJobs.length });
    }

    async updateJob(jobId, updates) {
        await this.loadJobsData();
        const jobIndex = this.jobsData.jobs.findIndex(job => job.id === jobId);
        if (jobIndex !== -1) {
            this.jobsData.jobs[jobIndex] = {
                ...this.jobsData.jobs[jobIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveJobsData();
            return this.jobsData.jobs[jobIndex];
        }
        return null;
    }

    async deleteJob(jobId) {
        await this.loadJobsData();
        const job = this.jobsData.jobs.find(j => j.id === jobId);
        this.jobsData.jobs = this.jobsData.jobs.filter(job => job.id !== jobId);
        
        // Cập nhật số lượng job posts của employer
        if (job) {
            await this.updateEmployerJobCount(job.employerId);
        }
        
        await this.saveJobsData();
        return true;
    }

    // Applications methods
    async getApplications() {
        await this.loadEmployersData();
        return this.employersData.applications || [];
    }

    async addApplication(application) {
        await this.loadEmployersData();
        application.id = Date.now();
        application.appliedAt = new Date().toISOString();
        application.status = 'pending';
        
        if (!this.employersData.applications) {
            this.employersData.applications = [];
        }
        this.employersData.applications.push(application);
        
        // Tăng số lượng applications cho job
        await this.incrementJobApplications(application.jobId);
        
        await this.saveEmployersData();
        return application;
    }

    async incrementJobApplications(jobId) {
        await this.loadJobsData();
        const jobIndex = this.jobsData.jobs.findIndex(job => job.id === jobId);
        if (jobIndex !== -1) {
            this.jobsData.jobs[jobIndex].applications = (this.jobsData.jobs[jobIndex].applications || 0) + 1;
            await this.saveJobsData();
        }
    }

    // Search methods
    async searchJobs(query, filters = {}) {
        const jobs = await this.getActiveJobs();
        let filteredJobs = jobs;

        // Tìm kiếm theo từ khóa
        if (query) {
            const searchTerm = query.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.jobTitle.toLowerCase().includes(searchTerm) ||
                job.employerName.toLowerCase().includes(searchTerm) ||
                job.jobDescription.toLowerCase().includes(searchTerm) ||
                job.requirements.toLowerCase().includes(searchTerm)
            );
        }

        // Lọc theo loại công việc
        if (filters.jobType) {
            filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
        }

        // Lọc theo địa điểm
        if (filters.location) {
            filteredJobs = filteredJobs.filter(job => 
                job.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Lọc theo kinh nghiệm
        if (filters.experience) {
            filteredJobs = filteredJobs.filter(job => job.experience === filters.experience);
        }

        return filteredJobs;
    }
}

// Tạo instance global
window.dataAPI = new DataAPI();