// Industry page functionality
function initIndustryPage() {
    const industryCards = document.querySelectorAll('.industry-card');
    
    industryCards.forEach(card => {
        card.addEventListener('click', function() {
            const industry = this.dataset.industry;
            window.location.href = `work.html?industry=${industry}`;
        });
    });
}

// Internship page functionality
function initInternshipPage() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter internships based on selection
            filterInternships(this.textContent);
        });
    });
}

function filterInternships(filter) {
    // Implementation for filtering internships
    console.log(`Filtering internships by: ${filter}`);
}

// Online jobs functionality
function initOnlineJobsPage() {
    // Initialize online jobs filters
    const filters = document.querySelectorAll('.filter-item select');
    
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterOnlineJobs();
        });
    });
}

function filterOnlineJobs() {
    // Implementation for filtering online jobs
    console.log('Filtering online jobs...');
}

// Initialize specific pages
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and initialize accordingly
    if (document.querySelector('.industry-section')) {
        initIndustryPage();
    }
    
    if (document.querySelector('.internship-filters')) {
        initInternshipPage();
    }
    
    if (document.querySelector('.online-listings')) {
        initOnlineJobsPage();
    }
});