// CV Storage and API Management
class CVStorage {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
    }

    // Save CV to API
    async saveCVToAPI(userId, cvData) {
        try {
            const response = await fetch(`${this.API_BASE}/users/${userId}/cv`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cvData: cvData,
                    updatedAt: new Date().toISOString()
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return { success: true, data: result.data };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Lỗi lưu CV lên server:', error);
            throw error;
        }
    }

    // Load CV from API
    async loadCVFromAPI(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/users/${userId}/cv`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Lỗi tải CV từ server:', error);
            return null;
        }
    }

    // Save CV to localStorage (fallback)
    saveCVToLocal(cvData) {
        try {
            localStorage.setItem('userCV', JSON.stringify(cvData));
            return true;
        } catch (error) {
            console.error('Lỗi lưu CV vào localStorage:', error);
            return false;
        }
    }

    // Load CV from localStorage (fallback)
    loadCVFromLocal() {
        try {
            const cvData = localStorage.getItem('userCV');
            return cvData ? JSON.parse(cvData) : null;
        } catch (error) {
            console.error('Lỗi tải CV từ localStorage:', error);
            return null;
        }
    }

    // Export CV as PDF
    async exportCVToPDF(cvData, format = 'A4') {
        // This would integrate with a PDF generation service
        // For now, we'll provide a print-friendly version
        this.generatePrintView(cvData);
    }

    // Generate print-friendly view
    generatePrintView(cvData) {
        const printWindow = window.open('', '_blank');
        const previewHTML = document.getElementById('cvPreview').innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CV - ${cvData.personalInfo.fullName || 'Ứng viên'}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        color: #333;
                    }
                    .cv-template { 
                        max-width: 210mm; 
                        margin: 0 auto; 
                    }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="cv-template">
                    ${previewHTML}
                </div>
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        In CV
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        Đóng
                    </button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // Share CV via link
    generateShareableLink(cvData) {
        // In a real application, this would generate a unique shareable link
        // For now, we'll create a data URL
        const cvString = JSON.stringify(cvData);
        const compressed = btoa(encodeURIComponent(cvString));
        return `${window.location.origin}/cv-view.html?data=${compressed}`;
    }

    // Validate CV data
    validateCVData(cvData) {
        const errors = [];
        
        if (!cvData.personalInfo?.fullName) {
            errors.push('Họ và tên là bắt buộc');
        }
        
        if (!cvData.personalInfo?.email) {
            errors.push('Email là bắt buộc');
        }
        
        if (!cvData.personalInfo?.phone) {
            errors.push('Số điện thoại là bắt buộc');
        }
        
        if (!cvData.personalInfo?.jobTitle) {
            errors.push('Vị trí mong muốn là bắt buộc');
        }
        
        if (cvData.education.length === 0) {
            errors.push('Cần ít nhất một thông tin học vấn');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Get CV statistics
    getCVStats(cvData) {
        return {
            completeness: this.calculateCompleteness(cvData),
            sections: {
                personalInfo: !!cvData.personalInfo?.fullName,
                education: cvData.education.length > 0,
                experience: cvData.experience.length > 0,
                skills: cvData.skills.length > 0
            },
            wordCount: this.calculateWordCount(cvData)
        };
    }

    calculateCompleteness(cvData) {
        let score = 0;
        let total = 4; // 4 main sections
        
        if (cvData.personalInfo?.fullName) score++;
        if (cvData.education.length > 0) score++;
        if (cvData.experience.length > 0) score++;
        if (cvData.skills.length > 0) score++;
        
        return Math.round((score / total) * 100);
    }

    calculateWordCount(cvData) {
        let count = 0;
        
        if (cvData.personalInfo?.summary) {
            count += cvData.personalInfo.summary.split(/\s+/).length;
        }
        
        cvData.education.forEach(edu => {
            if (edu.educationDescription) {
                count += edu.educationDescription.split(/\s+/).length;
            }
        });
        
        cvData.experience.forEach(exp => {
            if (exp.workDescription) {
                count += exp.workDescription.split(/\s+/).length;
            }
        });
        
        return count;
    }
}

// Initialize CV Storage
const cvStorage = new CVStorage();