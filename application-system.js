// Hệ thống quản lý ứng tuyển
class ApplicationSystem {
    constructor() {
        this.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    }

    // Ứng tuyển công việc
    applyForJob(jobId, userId) {
        const user = this.users.find(u => u.id === userId);
        const job = this.jobs.find(j => j.id === jobId);

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        if (!user.hasCV) {
            throw new Error('Vui lòng tạo CV trước khi ứng tuyển');
        }

        if (!job) {
            throw new Error('Công việc không tồn tại');
        }

        // Kiểm tra đã ứng tuyển chưa
        const existingApplication = this.applications.find(app => 
            app.jobId === jobId && app.userId === userId
        );

        if (existingApplication) {
            throw new Error('Bạn đã ứng tuyển công việc này rồi');
        }

        // Tạo đơn ứng tuyển
        const application = {
            id: Date.now(),
            jobId: jobId,
            userId: userId,
            jobTitle: job.title,
            company: job.company,
            applicantName: user.name,
            applicantEmail: user.email,
            applicantPhone: user.phone,
            cvData: user.cv,
            status: 'pending', // pending, reviewing, accepted, rejected
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            employerViewed: false
        };

        this.applications.push(application);
        this.saveApplications();

        // Gửi thông báo xác nhận
        this.sendApplicationConfirmation(application);

        return application;
    }

    // Nhà tuyển dụng xem CV
    employerViewCV(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            application.employerViewed = true;
            application.updatedAt = new Date().toISOString();
            this.saveApplications();
        }
    }

    // Cập nhật trạng thái ứng tuyển
    updateApplicationStatus(applicationId, status, feedback = '') {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            application.status = status;
            application.feedback = feedback;
            application.updatedAt = new Date().toISOString();
            this.saveApplications();

            // Gửi thông báo cho ứng viên
            this.sendStatusNotification(application);

            return application;
        }
    }

    // Gửi thông báo xác nhận ứng tuyển
    sendApplicationConfirmation(application) {
        const message = `🎯 ĐƠN ỨNG TUYỂN ĐÃ GỬI THÀNH CÔNG\n\n` +
                       `Vị trí: ${application.jobTitle}\n` +
                       `Công ty: ${application.company}\n` +
                       `Thời gian: ${new Date(application.appliedAt).toLocaleDateString('vi-VN')}\n\n` +
                       `Đơn của bạn đã được gửi đến nhà tuyển dụng. ` +
                       `Bạn sẽ nhận được thông báo khi có kết quả.`;

        // Gửi email
        this.sendEmail(application.applicantEmail, 'Xác nhận ứng tuyển thành công', message);
        
        // Gửi SMS (giả lập)
        this.sendSMS(application.applicantPhone, message);
    }

    // Gửi thông báo kết quả
    sendStatusNotification(application) {
        let title, message;

        switch (application.status) {
            case 'reviewing':
                title = '📋 ĐƠN ỨNG TUYỂN ĐANG ĐƯỢC XEM XÉT';
                message = `Đơn ứng tuyển vị trí ${application.jobTitle} tại ${application.company} ` +
                         `đang được nhà tuyển dụng xem xét. Bạn sẽ nhận được kết quả trong thời gian sớm nhất.`;
                break;
            
            case 'accepted':
                title = '🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN!';
                message = `Chúc mừng! Bạn đã được nhận vào vị trí ${application.jobTitle} tại ${application.company}.` +
                         `\n\nThông tin liên hệ:\n` +
                         `📞 Liên hệ: ${application.company}\n` +
                         `📧 Email: ${application.company.toLowerCase().replace(/\s+/g, '')}@company.com\n\n` +
                         `Hãy liên hệ với nhà tuyển dụng để biết thêm chi tiết!`;
                if (application.feedback) {
                    message += `\n\nNhận xét từ nhà tuyển dụng:\n${application.feedback}`;
                }
                break;
            
            case 'rejected':
                title = '😔 KẾT QUẢ ỨNG TUYỂN';
                message = `Cảm ơn bạn đã quan tâm đến vị trí ${application.jobTitle} tại ${application.company}. ` +
                         `Rất tiếc, hồ sơ của bạn không phù hợp với yêu cầu công việc lần này.` +
                         `\n\nChúc bạn may mắn trong những cơ hội tiếp theo!`;
                if (application.feedback) {
                    message += `\n\nNhận xét từ nhà tuyển dụng:\n${application.feedback}`;
                }
                break;
        }

        if (title && message) {
            // Gửi email
            this.sendEmail(application.applicantEmail, title, message);
            
            // Gửi SMS
            this.sendSMS(application.applicantPhone, `${title}\n\n${message}`);
            
            // Hiển thị thông báo trong app
            this.showInAppNotification(application.userId, title, message);
        }
    }

    // Gửi email (giả lập)
    sendEmail(to, subject, body) {
        console.log(`📧 Gửi email đến: ${to}`);
        console.log(`Tiêu đề: ${subject}`);
        console.log(`Nội dung: ${body}`);
        console.log('---');

        // Trong thực tế, đây sẽ là API call đến email service
        const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        emails.push({
            to: to,
            subject: subject,
            body: body,
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('sentEmails', JSON.stringify(emails));
    }

    // Gửi SMS (giả lập)
    sendSMS(to, message) {
        console.log(`📱 Gửi SMS đến: ${to}`);
        console.log(`Nội dung: ${message}`);
        console.log('---');

        // Trong thực tế, đây sẽ là API call đến SMS service
        const sms = JSON.parse(localStorage.getItem('sentSMS') || '[]');
        sms.push({
            to: to,
            message: message,
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('sentSMS', JSON.stringify(sms));
    }

    // Hiển thị thông báo trong app
    showInAppNotification(userId, title, message) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
            userId: userId,
            title: title,
            message: message,
            type: 'application_status',
            read: false,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // Lấy ứng tuyển của user
    getUserApplications(userId) {
        return this.applications.filter(app => app.userId === userId)
            .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    // Lấy ứng tuyển cho job
    getJobApplications(jobId) {
        return this.applications.filter(app => app.jobId === jobId);
    }

    // Lấy thông báo của user
    getUserNotifications(userId) {
        return JSON.parse(localStorage.getItem('notifications') || '[]')
            .filter(notif => notif.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Lưu applications
    saveApplications() {
        localStorage.setItem('jobApplications', JSON.stringify(this.applications));
    }
}

// Sử dụng trong trang ứng tuyển
function applyForJobWithValidation(jobId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        alert('Vui lòng đăng nhập để ứng tuyển!');
        window.location.href = 'account.html';
        return;
    }

    if (!user.hasCV) {
        if (confirm('Bạn cần có CV để ứng tuyển. Đến trang tạo CV ngay?')) {
            window.location.href = 'cv-create.html';
        }
        return;
    }

    try {
        const appSystem = new ApplicationSystem();
        const application = appSystem.applyForJob(jobId, user.id);
        
        alert('🎯 Đã gửi đơn ứng tuyển thành công!\nBạn sẽ nhận được thông báo qua email và SMS khi có kết quả.');
        
        // Cập nhật UI
        updateApplicationUI(application);
        
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// Cập nhật UI sau khi ứng tuyển
function updateApplicationUI(application) {
    const applyBtn = document.querySelector(`[data-job-id="${application.jobId}"]`);
    if (applyBtn) {
        applyBtn.textContent = '✅ Đã ứng tuyển';
        applyBtn.disabled = true;
        applyBtn.style.background = '#6c757d';
    }
}