// common.js - Common helper functions

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Format date with time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get job type text
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

// Get status text
function getStatusText(status) {
    const statuses = {
        'active': 'Đang hoạt động',
        'draft': 'Bản nháp',
        'expired': 'Hết hạn',
        'archived': 'Đã lưu trữ'
    };
    return statuses[status] || status;
}

// Format salary
function formatSalary(min, max) {
    if (min && max) {
        return `${min} - ${max} triệu VND`;
    } else if (min) {
        return `Từ ${min} triệu VND`;
    } else if (max) {
        return `Đến ${max} triệu VND`;
    }
    return 'Thương lượng';
}

// Check if job is new (within 7 days)
function isNewJob(createdAt) {
    const jobDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now - jobDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
}

// Show notification
function showNotification(message, type = 'info') {
    // Tạo notification element nếu chưa có
    let notification = document.getElementById('global-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'global-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Set style based on type
    const styles = {
        success: 'background: #10b981;',
        error: 'background: #dc2626;',
        warning: 'background: #f59e0b;',
        info: 'background: #2563eb;'
    };
    
    notification.style.cssText += styles[type] || styles.info;
    notification.textContent = message;
    notification.style.display = 'block';

    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}