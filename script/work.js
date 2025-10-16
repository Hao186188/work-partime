// DỮ LIỆU VIỆC LÀM THỰC TẾ (Dùng làm fallback)
const jobsData = [
    {
        id: 1,
        title: "Nhân viên pha chế cà phê",
        company: "Cà phê khỏe",
        location: "Văn Lang Street, An Giang",
        type: "Part-time",
        salary: "22,000đ/giờ",
        tags: ["Pha chế", "Part-time", "Không yêu cầu kinh nghiệm"],
        time: "1 ngày trước",
        featured: true,
        urgent: true,
        new: true,
        description: "Tuyển nhân viên pha chế làm việc part-time. Không yêu cầu kinh nghiệm, sẽ được đào tạo.",
        timestamp: new Date('2024-01-15').getTime(),
        relevance: 95,
        requirements: ["Không yêu cầu kinh nghiệm", "Có thể làm ca sáng/chiều", "Thân thiện, nhiệt tình"],
        benefits: ["Lương thưởng hấp dẫn", "Được đào tạo", "Môi trường trẻ trung"]
    },
    // ... (giữ nguyên các job khác)
];

// Biến toàn cục
let currentJobs = [];
let currentSort = 'newest';
let currentSearchTerm = '';
let currentFilters = {
    type: '',
    location: '',
    salary: ''
};

const API_BASE = 'http://localhost:3000/api';

// Khởi tạo trang
async function initWorkPage() {
    await loadJobsFromAPI();
    setupEventListeners();
    setupSearchAndFilters();
    checkLoginStatus();
    createJobDetailsModal();
}

// Tải công việc từ API
async function loadJobsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        const result = await response.json();
        
        if (result.success) {
            currentJobs = result.data;
            displayJobs(currentJobs);
        } else {
            throw new Error('Không thể tải danh sách công việc');
        }
    } catch (error) {
        console.error('Lỗi tải công việc:', error);
        // Fallback: sử dụng dữ liệu mẫu
        currentJobs = [...jobsData];
        displayJobs(currentJobs);
    }
}

// Hiển thị danh sách việc làm
function displayJobs(jobs = currentJobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    
    if (!jobsGrid) {
        console.error('Không tìm thấy element jobsGrid');
        return;
    }

    if (jobs.length === 0) {
        jobsGrid.innerHTML = `
            <div class="no-jobs-found">
                <div class="no-jobs-icon">😔</div>
                <h3>Không tìm thấy việc làm phù hợp</h3>
                <p>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc của bạn</p>
                <button class="btn btn-primary" onclick="resetFilters()">Xóa bộ lọc</button>
            </div>
        `;
        return;
    }

    jobsGrid.innerHTML = jobs.map(job => `
        <div class="job-card ${job.featured ? 'featured' : ''} ${job.urgent ? 'urgent' : ''} ${job.new ? 'new' : ''}" 
             onclick="showJobDetails(${job.id})">
            <div class="job-card-header">
                <h4>${job.title}</h4>
                ${job.urgent ? '<span class="urgent-badge">GẤP</span>' : ''}
                ${job.featured ? '<span class="featured-badge">NỔI BẬT</span>' : ''}
            </div>
            <div class="job-company">
                <div class="company-logo">${getCompanyInitials(job.company)}</div>
                <span class="company">${job.company}</span>
            </div>
            <div class="job-meta">
                <div class="job-location">
                    <span class="icon">📍</span> ${job.location}
                </div>
                <span class="job-type">${job.type}</span>
                <div class="job-salary">${job.salary}</div>
            </div>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
            </div>
            <div class="job-footer">
                <div class="job-time">
                    <span class="icon">🕒</span> ${job.time}
                </div>
                <div class="job-actions">
                    <button class="job-action-btn" onclick="event.stopPropagation(); saveJob(${job.id})" title="Lưu công việc">
                        <span class="icon">💾</span>
                    </button>
                    <button class="job-action-btn" onclick="event.stopPropagation(); shareJob(${job.id})" title="Chia sẻ">
                        <span class="icon">📤</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Lấy chữ cái đầu của tên công ty
function getCompanyInitials(companyName) {
    return companyName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Thiết lập event listeners
function setupEventListeners() {
    // Filter tags
    const filterTags = document.getElementById('filterTags');
    if (filterTags) {
        filterTags.addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-tag')) {
                // Remove active class from all tags
                document.querySelectorAll('.filter-tag').forEach(tag => {
                    tag.classList.remove('active');
                });
                // Add active class to clicked tag
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                if (filter === 'all') {
                    currentFilters.type = '';
                } else {
                    currentFilters.type = filter;
                }
                performSearch();
            }
        });
    }

    // Đóng modal khi click outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeJobModal();
        }
    });

    // Đóng modal bằng ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeJobModal();
        }
    });
}

// Thiết lập tìm kiếm và bộ lọc
function setupSearchAndFilters() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    // Tìm kiếm
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearchTerm = e.target.value.toLowerCase();
            performSearch();
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Thực hiện tìm kiếm
function performSearch() {
    let filteredJobs = currentJobs.filter(job => {
        // Tìm kiếm theo từ khóa
        const matchesSearch = currentSearchTerm === '' || 
            job.title.toLowerCase().includes(currentSearchTerm) ||
            job.company.toLowerCase().includes(currentSearchTerm) ||
            job.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm)) ||
            job.description.toLowerCase().includes(currentSearchTerm);

        // Lọc theo loại công việc
        const matchesType = currentFilters.type === '' || 
            job.type.toLowerCase().includes(currentFilters.type) ||
            job.tags.some(tag => tag.toLowerCase().includes(currentFilters.type));

        return matchesSearch && matchesType;
    });

    displayJobs(filteredJobs);
}

// Reset bộ lọc
function resetFilters() {
    currentSearchTerm = '';
    currentFilters = { type: '', location: '', salary: '' };
    
    const searchInput = document.querySelector('.search-input');
    const filterTags = document.querySelectorAll('.filter-tag');
    
    if (searchInput) searchInput.value = '';
    
    // Reset active tag
    filterTags.forEach(tag => {
        tag.classList.remove('active');
        if (tag.dataset.filter === 'all') {
            tag.classList.add('active');
        }
    });
    
    displayJobs(currentJobs);
}

// Tạo modal chi tiết công việc
function createJobDetailsModal() {
    const modalHTML = `
        <div id="jobDetailsModal" class="modal">
            <div class="modal-content job-details-modal">
                <span class="close-btn" id="closeJobModal">&times;</span>
                <div class="job-details-header">
                    <h3 id="jobDetailsTitle"></h3>
                    <p class="company" id="jobDetailsCompany"></p>
                    <div class="job-badges" id="jobDetailsBadges"></div>
                </div>
                <div class="job-details-content">
                    <div class="detail-item">
                        <span class="detail-label">📍 Địa điểm:</span>
                        <span class="detail-value" id="jobDetailsLocation"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏰ Hình thức:</span>
                        <span class="detail-value" id="jobDetailsType"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">💰 Mức lương:</span>
                        <span class="detail-value salary" id="jobDetailsSalary"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📝 Mô tả công việc:</span>
                        <span class="detail-value" id="jobDetailsDescription"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">✅ Yêu cầu:</span>
                        <span class="detail-value" id="jobDetailsRequirements"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🎁 Quyền lợi:</span>
                        <span class="detail-value" id="jobDetailsBenefits"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🏷️ Tags:</span>
                        <span class="detail-value tags" id="jobDetailsTags"></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🕒 Đã đăng:</span>
                        <span class="detail-value" id="jobDetailsTime"></span>
                    </div>
                </div>
                <div class="job-details-actions">
                    <button class="apply-btn" id="applyJobBtn">
                        <span class="icon">📨</span>
                        Ứng tuyển ngay
                    </button>
                    <button class="save-btn" id="saveJobBtn">
                        <span class="icon">💾</span>
                        Lưu công việc
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Thêm event listeners cho modal
    document.getElementById('closeJobModal').addEventListener('click', closeJobModal);
    document.getElementById('applyJobBtn').addEventListener('click', applyForJob);
    document.getElementById('saveJobBtn').addEventListener('click', saveJobFromModal);
}

// Hiển thị chi tiết công việc
function showJobDetails(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('jobDetailsModal');
    
    // Điền thông tin vào modal
    document.getElementById('jobDetailsTitle').textContent = job.title;
    document.getElementById('jobDetailsCompany').textContent = job.company;
    document.getElementById('jobDetailsLocation').textContent = job.location;
    document.getElementById('jobDetailsType').textContent = job.type;
    document.getElementById('jobDetailsSalary').textContent = job.salary;
    document.getElementById('jobDetailsDescription').textContent = job.description;
    document.getElementById('jobDetailsTime').textContent = job.time;
    
    // Yêu cầu
    const requirementsHTML = job.requirements ? 
        job.requirements.map(req => `<li>${req}</li>`).join('') : 
        '<li>Không có yêu cầu đặc biệt</li>';
    document.getElementById('jobDetailsRequirements').innerHTML = `<ul>${requirementsHTML}</ul>`;
    
    // Quyền lợi
    const benefitsHTML = job.benefits ? 
        job.benefits.map(benefit => `<li>${benefit}</li>`).join('') : 
        '<li>Theo chính sách công ty</li>';
    document.getElementById('jobDetailsBenefits').innerHTML = `<ul>${benefitsHTML}</ul>`;
    
    // Tags
    document.getElementById('jobDetailsTags').innerHTML = 
        job.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Badges
    const badgesHTML = [];
    if (job.urgent) badgesHTML.push('<span class="urgent-badge">TUYỂN GẤP</span>');
    if (job.featured) badgesHTML.push('<span class="featured-badge">NỔI BẬT</span>');
    if (job.new) badgesHTML.push('<span class="new-badge">MỚI</span>');
    document.getElementById('jobDetailsBadges').innerHTML = badgesHTML.join('');

    // Lưu jobId cho các button action
    document.getElementById('applyJobBtn').dataset.jobId = job.id;
    document.getElementById('saveJobBtn').dataset.jobId = job.id;

    modal.style.display = 'flex';
}

// Đóng modal
function closeJobModal() {
    const modal = document.getElementById('jobDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Ứng tuyển công việc
async function applyForJob() {
    const jobId = parseInt(this.dataset.jobId);
    const job = currentJobs.find(j => j.id === jobId);
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        alert('Vui lòng đăng nhập để ứng tuyển!');
        closeJobModal();
        window.location.href = 'account.html';
        return;
    }

    if (!user.hasCV) {
        if (confirm('Bạn cần có CV để ứng tuyển. Đến trang tạo CV ngay?')) {
            closeJobModal();
            window.location.href = 'cv-create.html';
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jobId: jobId,
                userId: user.id
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(`🎯 ${result.message}\n\nVị trí: ${job.title}\nCông ty: ${job.company}\n\nBạn sẽ nhận được thông báo khi có kết quả.`);
            closeJobModal();
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Lỗi ứng tuyển:', error);
        // Fallback: lưu vào localStorage
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const existingApplication = applications.find(app => 
            app.jobId === jobId && app.userId === user.id
        );

        if (existingApplication) {
            alert('Bạn đã ứng tuyển công việc này rồi!');
            return;
        }

        const application = {
            id: Date.now(),
            jobId: jobId,
            userId: user.id,
            jobTitle: job.title,
            company: job.company,
            applicantName: user.name,
            applicantEmail: user.email,
            applicantPhone: user.phone,
            status: 'pending',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        applications.push(application);
        localStorage.setItem('jobApplications', JSON.stringify(applications));

        alert(`🎯 Đã gửi đơn ứng tuyển thành công!\n\nVị trí: ${job.title}\nCông ty: ${job.company}\n\nBạn sẽ nhận được thông báo khi có kết quả.`);
        closeJobModal();
    }
}

// Lưu công việc từ modal
function saveJobFromModal() {
    const jobId = parseInt(this.dataset.jobId);
    saveJob(jobId);
}

// Lưu công việc
function saveJob(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert('Vui lòng đăng nhập để lưu công việc!');
        return;
    }
    
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    
    // Kiểm tra xem đã lưu chưa
    if (savedJobs.some(saved => saved.jobId === job.id)) {
        alert('Công việc này đã được lưu trước đó!');
        return;
    }
    
    savedJobs.push({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        salary: job.salary,
        location: job.location,
        type: job.type,
        savedAt: new Date().toISOString()
    });
    
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    alert(`✅ Đã lưu công việc: ${job.title}`);
}

// Chia sẻ công việc
function shareJob(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    const shareUrl = `${window.location.origin}${window.location.pathname}?job=${job.id}`;
    const shareText = `🔔 Cơ hội việc làm: ${job.title} tại ${job.company}\n📍 ${job.location}\n💰 ${job.salary}\n\n${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: job.title,
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('📋 Đã copy thông tin công việc vào clipboard!');
        });
    }
}

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginSection = document.getElementById('loginSection');

    if (token && user) {
        // Đã đăng nhập
        loginSection.innerHTML = `
            <span style="color: #2563eb; font-weight: 600;">Xin chào, ${user.name}</span>
            <button class="logout-btn" onclick="logout()">Đăng xuất</button>
        `;
    } else {
        // Chưa đăng nhập
        loginSection.innerHTML = `
            <button class="login-btn" onclick="openLoginModal()">Đăng nhập</button>
            <button class="register-btn" onclick="window.location.href='account.html'">Đăng ký</button>
        `;
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Mở modal đăng nhập
function openLoginModal() {
    window.location.href = 'account.html';
}

// Khởi chạy khi trang load
document.addEventListener('DOMContentLoaded', function() {
    initWorkPage();
    
    // Kiểm tra URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job');
    if (jobId) {
        setTimeout(() => showJobDetails(parseInt(jobId)), 500);
    }
});
// DROPDOWN FUNCTIONALITY - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing dropdown functionality...');
    
    // Toggle dropdowns - FIXED
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            console.log('Dropdown clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            console.log('Dropdown found:', dropdown);
            
            // Toggle current dropdown
            const isActive = dropdown.classList.contains('active');
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
            
            console.log('Dropdown active:', !isActive);
        });
    });

    // Close dropdowns when clicking outside - FIXED
    document.addEventListener('click', function(e) {
        // Only close if not clicking on dropdown toggle or menu
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Prevent dropdown menu from closing when clicking inside
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Rest of your existing code...
    setupLoginSection();
    setupSearchAndFilters();
    // ... other existing functions
});

// Setup login section
function setupLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'Người dùng';

    if (isLoggedIn) {
        loginSection.innerHTML = `
            <span style="color: #2563eb; font-weight: 500;">Xin chào, ${username}</span>
            <button class="logout-btn" onclick="logout()">Đăng xuất</button>
        `;
    } else {
        loginSection.innerHTML = `
            <button class="login-btn" onclick="showLoginModal()">Đăng nhập</button>
            <button class="register-btn" onclick="showRegisterModal()">Đăng ký</button>
        `;
    }
}

// Modal functions
window.showLoginModal = function() {
    console.log('Opening login modal');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Đăng nhập</h3>
            <input type="text" class="modal-input" placeholder="Email hoặc số điện thoại">
            <input type="password" class="modal-input" placeholder="Mật khẩu">
            <button class="modal-btn primary" onclick="login()">Đăng nhập</button>
            <button class="modal-btn secondary" onclick="closeModal(this)">Hủy</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
};

window.showRegisterModal = function() {
    console.log('Opening register modal');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Đăng ký tài khoản</h3>
            <input type="text" class="modal-input" placeholder="Họ và tên">
            <input type="email" class="modal-input" placeholder="Email">
            <input type="tel" class="modal-input" placeholder="Số điện thoại">
            <input type="password" class="modal-input" placeholder="Mật khẩu">
            <input type="password" class="modal-input" placeholder="Xác nhận mật khẩu">
            <button class="modal-btn primary" onclick="register()">Đăng ký</button>
            <button class="modal-btn secondary" onclick="closeModal(this)">Hủy</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
};

window.closeModal = function(element) {
    const modal = element.closest('.modal');
    if (modal) {
        modal.remove();
    }
};

// Login/Register functions
window.login = function() {
    const inputs = document.querySelectorAll('.modal-input');
    const email = inputs[0].value;
    const password = inputs[1].value;
    
    if (email && password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', email.split('@')[0]);
        showNotification('Đăng nhập thành công!', 'success');
        closeModal(document.querySelector('.modal'));
        setupLoginSection();
    } else {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
    }
};

window.register = function() {
    const inputs = document.querySelectorAll('.modal-input');
    const fullName = inputs[0].value;
    const email = inputs[1].value;
    const phone = inputs[2].value;
    const password = inputs[3].value;
    const confirmPassword = inputs[4].value;
    
    if (fullName && email && phone && password && confirmPassword) {
        if (password === confirmPassword) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', fullName);
            showNotification('Đăng ký thành công!', 'success');
            closeModal(document.querySelector('.modal'));
            setupLoginSection();
        } else {
            showNotification('Mật khẩu xác nhận không khớp!', 'error');
        }
    } else {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
    }
};

window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    showNotification('Đã đăng xuất!', 'success');
    setupLoginSection();
};

// Notification function
window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
};

// Search and filter functionality
function setupSearchAndFilters() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                showNotification(`Đang tìm kiếm: ${searchTerm}`, 'info');
                // Add actual search logic here
            }
        });
    }

    // Filter tags
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            const filterText = this.textContent;
            showNotification(`Đã áp dụng bộ lọc: ${filterText}`, 'info');
        });
    });
}