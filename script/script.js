// Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.getElementById('contactDropdown');

  // Toggle dropdown menu
  dropdownToggle.addEventListener('click', function(e) {
    e.preventDefault();
    dropdownMenu.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      dropdownMenu.classList.remove('show');
    }
  });

  // Close dropdown when clicking on a dropdown item
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  dropdownItems.forEach(item => {
    item.addEventListener('click', function() {
      dropdownMenu.classList.remove('show');
    });
  });

  // Search form functionality
  const searchForm = document.getElementById('searchForm');
  const searchKeyword = document.getElementById('searchKeyword');
  const searchLocation = document.getElementById('searchLocation');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Handle form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    redirectToWorkPage();
  });

  // Quick filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      handleQuickFilter(filter);
    });
  });

  // Job card clicks
  const jobCards = document.querySelectorAll('.job-card');
  jobCards.forEach(card => {
    card.addEventListener('click', function() {
      const jobId = this.getAttribute('data-job');
      window.location.href = `work.html?job=${jobId}`;
    });
  });

  // Handle quick filter selection
  function handleQuickFilter(filter) {
    switch(filter) {
      case 'part-time':
      case 'full-time':
        searchKeyword.value = filter;
        searchLocation.value = '';
        break;
      case 'an giang':
        searchKeyword.value = '';
        searchLocation.value = 'an giang';
        break;
      case 'remote':
        searchKeyword.value = 'remote';
        searchLocation.value = '';
        break;
    }
    redirectToWorkPage();
  }

  // Redirect to work page with search parameters
  function redirectToWorkPage() {
    const keyword = searchKeyword.value.trim();
    const location = searchLocation.value;
    
    let url = 'work.html';
    const params = new URLSearchParams();
    
    if (keyword) {
      params.append('search', keyword);
    }
    
    if (location) {
      params.append('location', location);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    window.location.href = url;
  }

  // Check for URL parameters to pre-fill search (if coming back from work page)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const locationParam = urlParams.get('location');
  
  if (searchParam) {
    searchKeyword.value = searchParam;
  }
  
  if (locationParam) {
    searchLocation.value = locationParam;
  }

  // Add keyboard navigation for dropdown
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdownMenu.classList.remove('show');
    }
  });

  // Add animation to statistics counters
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target + '+';
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start) + '+';
      }
    }, 16);
  }

  // Animate statistics when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statItems = entry.target.querySelectorAll('.stat-item h3');
        statItems.forEach((item, index) => {
          const target = index === 0 ? 100 : index === 1 ? 50 : 1000;
          setTimeout(() => {
            animateCounter(item, target);
          }, index * 300);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statisticsSection = document.querySelector('.statistics');
  if (statisticsSection) {
    observer.observe(statisticsSection);
  }

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Utility function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #2563eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    max-width: 400px;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 3000;
  `;
  
  if (type === 'success') {
    notification.style.borderLeftColor = '#059669';
  } else if (type === 'error') {
    notification.style.borderLeftColor = '#dc2626';
  }
  
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; padding: 0; margin-left: 15px;">&times;</button>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 100);
  
  // Auto hide after 5 seconds
  const autoHide = setTimeout(() => {
    hideNotification(notification);
  }, 5000);
  
  // Close button event
  notification.querySelector('.notification-close').addEventListener('click', () => {
    clearTimeout(autoHide);
    hideNotification(notification);
  });
  
  // Hide notification function
  function hideNotification(notif) {
    notif.style.transform = 'translateX(400px)';
    notif.style.opacity = '0';
    setTimeout(() => {
      if (notif.parentNode) {
        notif.parentNode.removeChild(notif);
      }
    }, 300);
  }
}

// Export functions for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showNotification };
}
// Load featured jobs for homepage
async function loadFeaturedJobs() {
    console.log('🔄 Đang tải featured jobs cho trang chủ...');
    
    await dataAPI.init();
    const allJobs = await dataAPI.getActiveJobs();
    
    // Lấy 6 jobs mới nhất
    const featuredJobs = allJobs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    
    console.log('📊 Featured jobs:', featuredJobs);
    displayFeaturedJobs(featuredJobs);
}

// Display featured jobs on homepage
function displayFeaturedJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    
    if (!jobsGrid) {
        console.log('ℹ️ Không tìm thấy jobsGrid trên trang chủ, có thể trang không có section này');
        return;
    }

    if (jobs.length === 0) {
        jobsGrid.innerHTML = `
            <div class="no-jobs" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                <p>Chưa có việc làm nào được đăng. Hãy là người đầu tiên đăng tin!</p>
            </div>
        `;
        return;
    }

    jobsGrid.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="showJobDetails(${job.id})">
            <div class="job-card-header">
                <h4>${job.jobTitle}</h4>
                ${isNewJob(job.createdAt) ? '<span class="new-badge">MỚI</span>' : ''}
            </div>
            <div class="company">${job.employerName}</div>
            <div class="location">📍 ${job.location}</div>
            <div class="type">${getJobTypeText(job.jobType)}</div>
            <div class="salary">💰 ${formatSalary(job.salaryMin, job.salaryMax)}</div>
        </div>
    `).join('');
}

// Helper functions (có thể đưa vào file common.js)
function getJobTypeText(type) {
    const types = {
        'fulltime': 'Toàn thời gian',
        'parttime': 'Bán thời gian',
        'contract': 'Hợp đồng',
        'internship': 'Thực tập',
        'remote': 'Làm việc từ xa'
    };
    return types[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function isNewJob(createdAt) {
    const jobDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now - jobDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 3; // Mới trong 3 ngày
}

function formatSalary(min, max) {
    if (min && max) {
        return `${min} - ${max} triệu`;
    } else if (min) {
        return `Từ ${min} triệu`;
    } else if (max) {
        return `Đến ${max} triệu`;
    }
    return 'Thương lượng';
}

// Lắng nghe sự kiện thay đổi dữ liệu
window.addEventListener('jobsDataChanged', async function() {
    console.log('🔄 Nhận sự kiện thay đổi jobs data, reloading homepage...');
    await loadFeaturedJobs();
});

// Khởi tạo trang chủ
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Khởi tạo trang chủ...');
    await dataAPI.init();
    await loadFeaturedJobs();
});

// Hàm showJobDetails cho trang chủ (tạm thời)
function showJobDetails(jobId) {
    alert('Tính năng xem chi tiết công việc đang được phát triển. Job ID: ' + jobId);
    // Trong thực tế, điều hướng đến trang chi tiết công việc
    // window.location.href = `job-details.html?id=${jobId}`;
}