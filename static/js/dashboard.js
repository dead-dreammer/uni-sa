// Sample data structure
const userData = {
  reports: [
    { id: 1, title: "Profile Assessment Report", date: "Nov 15, 2024" },
    { id: 2, title: "University Ranking Analysis", date: "Nov 20, 2024" },
  ],
  matches: [
    {
      id: 1,
      name: "University of Cape Town",
      province: "Western Cape",
      ranking: 1,
      matched: true,
    },
    {
      id: 2,
      name: "University of the Witwatersrand",
      province: "Gauteng",
      ranking: 2,
      matched: true,
    },
    {
      id: 3,
      name: "Stellenbosch University",
      province: "Western Cape",
      ranking: 3,
      matched: true,
    },
    {
      id: 4,
      name: "University of Pretoria",
      province: "Gauteng",
      ranking: 4,
      matched: true,
    },
  ],
  likes: [
    { id: 1, name: "University of Cape Town", province: "Western Cape" },
  ],
};

// Render Reports
function renderReports() {
  const container = document.getElementById("reportsContainer");
  
  if (userData.reports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p>No reports generated yet</p>
        <span class="empty-subtext">Complete your profile to get started</span>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userData.reports
    .map(
      (report) => `
      <div class="report-item">
        <div class="report-info">
          <h4>${report.title}</h4>
          <p class="report-date">${report.date}</p>
        </div>
        <a href="#" class="btn btn-small btn-secondary">
          <span>Download</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V12M8 12L4 8M8 12L12 8M2 14H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    `
    )
    .join("");
}

// Render Matched Universities
function renderMatches() {
  const container = document.getElementById("matchesContainer");
  
  if (userData.matches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No matches available yet</p>
        <span class="empty-subtext">Complete your profile to discover universities</span>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userData.matches
    .map((uni) => {
      const isLiked = userData.likes.some(like => like.id === uni.id);
      return `
        <div class="match-item">
          <div class="match-info">
            <h4>${uni.name}</h4>
            <p class="match-province">${uni.province}</p>
          </div>
          <button class="btn btn-like ${isLiked ? 'liked' : ''}" onclick="toggleLike(${uni.id}, '${uni.name}', '${uni.province}')">
            <span class="heart">${isLiked ? '❤️' : '♡'}</span>
          </button>
        </div>
      `;
    })
    .join("");
}

// Render Liked Universities
function renderLikes() {
  const container = document.getElementById("likesContainer");
  
  if (userData.likes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💾</div>
        <p>You haven't saved any universities yet</p>
        <span class="empty-subtext">Click the heart icon to save your favorites</span>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userData.likes
    .map(
      (uni) => `
      <div class="like-item">
        <div class="like-info">
          <h4>${uni.name}</h4>
          <p class="like-province">${uni.province}</p>
        </div>
        <button class="btn btn-remove" onclick="removeFromLikes(${uni.id})">
          ✕
        </button>
      </div>
    `
    )
    .join("");
    
  // Update badge count
  updateBadge('likes', userData.likes.length);
}

// Toggle Like (Add or Remove)
function toggleLike(id, name, province) {
  const alreadyLiked = userData.likes.some((uni) => uni.id === id);
  
  if (alreadyLiked) {
    // Remove from likes
    userData.likes = userData.likes.filter((uni) => uni.id !== id);
  } else {
    // Add to likes
    userData.likes.push({ id, name, province });
  }
  
  renderLikes();
  renderMatches();
  
  // Add a little animation feedback
  const button = event.target.closest('.btn-like');
  if (button) {
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
      button.style.transform = '';
    }, 200);
  }
}

// Remove from Likes by ID
function removeFromLikes(id) {
  userData.likes = userData.likes.filter((uni) => uni.id !== id);
  renderLikes();
  renderMatches();
}

// Update Badge Count
function updateBadge(type, count) {
  const badgeId = type === 'matches' ? 'matchesBadge' : 'likesBadge';
  const badge = document.getElementById(badgeId);
  if (badge) {
    badge.textContent = `${count} ${type === 'likes' ? 'saved' : 'matches'}`;
  }
}

// Initialize Dashboard
function initializeDashboard() {
  renderReports();
  renderMatches();
  renderLikes();
  
  // Update initial badge counts
  updateBadge('matches', userData.matches.length);
  updateBadge('likes', userData.likes.length);
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);