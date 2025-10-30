// Bursaries data
const bursaries = [
    {
        title: "National Student Financial Aid Scheme (NSFAS)",
        provider: "Department of Higher Education",
        amount: "Full tuition & allowances",
        deadline: "November 30, 2025",
        field: "All fields",
        level: "Undergraduate",
        description: "NSFAS provides financial assistance to eligible South African students who wish to study at public universities and TVET colleges.",
        requirements: [
            "South African citizen",
            "Combined household income not exceeding R350,000 per annum",
            "Admitted to a public university or TVET college",
            "Studying towards first qualification"
        ],
        coverage: "Tuition fees, accommodation, learning materials, and living allowances",
        url: "https://www.nsfas.org.za",
        tags: ["Government", "Full Coverage", "Undergraduate"]
    },
    {
        title: "Funza Lushaka Bursary",
        provider: "Department of Basic Education",
        amount: "Full tuition & stipend",
        deadline: "Ongoing",
        field: "Education",
        level: "Undergraduate",
        description: "Multi-year bursary for students studying towards becoming teachers in priority areas.",
        requirements: [
            "South African citizen",
            "Studying Initial Teacher Education qualification",
            "Must teach in a public school for same number of years as bursary was received",
            "Priority subjects include Mathematics, Science, and Technology"
        ],
        coverage: "Registration, tuition, accommodation, books, and monthly stipend",
        url: "https://www.funzalushaka.doe.gov.za",
        tags: ["Education", "Government", "Teaching Commitment"]
    },
    {
        title: "Eskom Engineering Bursary",
        provider: "Eskom Holdings SOC Ltd",
        amount: "Up to R100,000 per year",
        deadline: "August 31, 2025",
        field: "Engineering",
        level: "Undergraduate",
        description: "Comprehensive bursary for students pursuing engineering degrees with work-back agreement.",
        requirements: [
            "South African citizen",
            "Minimum 65% average in Mathematics and Physical Science",
            "Studying towards engineering degree",
            "Financial need"
        ],
        coverage: "Tuition, prescribed textbooks, accommodation, meals, and travel allowance",
        url: "https://www.eskom.co.za/careers/bursaries",
        tags: ["Engineering", "Corporate", "Work-back Agreement"]
    },
    {
        title: "Sasol Bursary Programme",
        provider: "Sasol Limited",
        amount: "Full tuition & allowances",
        deadline: "July 15, 2025",
        field: "Science, Engineering, Commerce",
        level: "Undergraduate, Postgraduate",
        description: "Supports students in science, engineering, and commerce fields with comprehensive funding.",
        requirements: [
            "South African citizen",
            "Excellent academic record (minimum 70%)",
            "Studying relevant qualification at recognized institution",
            "Leadership potential"
        ],
        coverage: "Full tuition, accommodation, meals, books, and pocket money",
        url: "https://www.sasol.com/careers/bursaries",
        tags: ["STEM", "Corporate", "Leadership"]
    },
    {
        title: "Anglo American Bursary",
        provider: "Anglo American South Africa",
        amount: "Full cost of study",
        deadline: "September 30, 2025",
        field: "Engineering, Science",
        level: "Undergraduate, Postgraduate",
        description: "Funding for engineering and science students with vacation work opportunities.",
        requirements: [
            "South African citizen",
            "Minimum 60% average",
            "Studying Mining Engineering, Metallurgy, or related fields",
            "Financial need demonstrated"
        ],
        coverage: "Tuition, accommodation, meals, textbooks, and vacation work salary",
        url: "https://www.angloamerican.com/careers/bursaries",
        tags: ["Mining", "Engineering", "Vacation Work"]
    },
    {
        title: "Department of Health Bursary",
        provider: "National Department of Health",
        amount: "Full tuition & living allowance",
        deadline: "October 31, 2025",
        field: "Health Sciences",
        level: "Undergraduate, Postgraduate",
        description: "Supports students pursuing careers in critical health professions.",
        requirements: [
            "South African citizen",
            "Studying medicine, nursing, pharmacy, or allied health",
            "Must work in public health sector after graduation",
            "Good academic standing"
        ],
        coverage: "Tuition, accommodation, meals, books, and monthly allowance",
        url: "https://www.health.gov.za/bursaries",
        tags: ["Healthcare", "Government", "Service Commitment"]
    },
    {
        title: "Momentum Metropolitan Bursary",
        provider: "Momentum Metropolitan Holdings",
        amount: "R50,000 - R80,000 per year",
        deadline: "August 15, 2025",
        field: "Commerce, Actuarial Science",
        level: "Undergraduate",
        description: "Financial support for students pursuing actuarial science, finance, and accounting.",
        requirements: [
            "South African citizen",
            "Minimum 70% average in Mathematics",
            "Studying towards relevant commerce degree",
            "Strong analytical skills"
        ],
        coverage: "Tuition fees, prescribed textbooks, and accommodation allowance",
        url: "https://www.momentum.co.za/careers/bursaries",
        tags: ["Commerce", "Actuarial", "Financial Services"]
    },
    {
        title: "Thuthuka Bursary Fund",
        provider: "South African Institute of Chartered Accountants",
        amount: "Full tuition & support",
        deadline: "December 15, 2025",
        field: "Accounting",
        level: "Undergraduate, Honours",
        description: "Comprehensive programme for disadvantaged students pursuing chartered accountancy.",
        requirements: [
            "Black African, Coloured, or Indian South African",
            "Financial need",
            "Good academic record",
            "Studying towards CA qualification"
        ],
        coverage: "Tuition, accommodation, meals, textbooks, laptop, and mentorship",
        url: "https://www.saica.org.za/thuthuka",
        tags: ["Accounting", "Transformation", "Mentorship"]
    }
];

// Create bursary card HTML
function createBursaryCard(bursary) {
    return `
        <div class="bursary-card" onclick="toggleCard(this)">
            <div class="bursary-header">
                <h3 class="bursary-title">${bursary.title}</h3>
                <p class="bursary-provider">${bursary.provider}</p>
                <div class="bursary-highlights">
                    <div class="highlight-item">
                        <span class="highlight-icon">💰</span>
                        <span>${bursary.amount}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📅</span>
                        <span>${bursary.deadline}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📚</span>
                        <span>${bursary.field}</span>
                    </div>
                </div>
                <div class="tag-container">
                    ${bursary.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="bursary-details">
                <div class="details-section">
                    <h4>About This Bursary</h4>
                    <p>${bursary.description}</p>
                </div>
                <div class="details-section">
                    <h4>Requirements</h4>
                    <ul>
                        ${bursary.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="details-section">
                    <h4>What's Covered</h4>
                    <p>${bursary.coverage}</p>
                </div>
                <a href="${bursary.url}" target="_blank" class="apply-button">Visit Bursary Website →</a>
            </div>
            <div class="expand-indicator"></div>
        </div>
    `;
}

// Toggle card expansion
function toggleCard(card) {
    card.classList.toggle('expanded');
}

// Filter bursaries based on search and filters
function filterBursaries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const fieldFilter = document.getElementById('fieldFilter').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value.toLowerCase();

    const filtered = bursaries.filter(bursary => {
        const matchesSearch = bursary.title.toLowerCase().includes(searchTerm) ||
                            bursary.provider.toLowerCase().includes(searchTerm);
        const matchesField = !fieldFilter || bursary.field.toLowerCase().includes(fieldFilter);
        const matchesLevel = !levelFilter || bursary.level.toLowerCase().includes(levelFilter);

        return matchesSearch && matchesField && matchesLevel;
    });

    const grid = document.getElementById('bursaryGrid');
    const noResults = document.getElementById('noResults');

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(createBursaryCard).join('');
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('input', filterBursaries);
    document.getElementById('fieldFilter').addEventListener('change', filterBursaries);
    document.getElementById('levelFilter').addEventListener('change', filterBursaries);

    // Initial load
    filterBursaries();
});