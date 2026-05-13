const fs = require('fs');
const profileHtml = fs.readFileSync('profile.html', 'utf8');
const notifHtml = fs.readFileSync('notifications.html', 'utf8');

// 1. Extract CSS
const cssMatch = notifHtml.match(/<style>([\s\S]*?)<\/style>/);
let css = cssMatch ? cssMatch[1] : '';
css = css.replace(/\* \{ font-family: 'Roboto', sans-serif; \}/g, '');

// 2. Extract Notification Container
const containerMatch = notifHtml.match(/<div class="notification-container">([\s\S]*?)<!-- Notification Detail Modal -->/);
let containerHtml = containerMatch ? containerMatch[1].trim() : '';

// 3. Extract Modal
const modalMatch = notifHtml.match(/<!-- Notification Detail Modal -->([\s\S]*?)<!-- Footer -->/);
let modalHtml = modalMatch ? modalMatch[1].trim() : '';

// --- INJECT TO PROFILE.HTML ---

// Inject CSS
let newProfile = profileHtml.replace('</style>', css + '\n    </style>');

// Inject Container as a tab section
// Wrap in our tab format
const tabHtml = `
          <!-- Thông báo -->
          <div id="notifications" class="tab-section hidden bg-white rounded-lg shadow-md p-6 mb-6 scroll-mt-32">
            <div class="notification-container w-full max-w-full">
            ` + containerHtml.replace(/<\/div>\s*$/, '') + `
            </div>
          </div>
`;
newProfile = newProfile.replace('</main>', tabHtml + '\n        </main>');

// Inject Modal
newProfile = newProfile.replace('<!-- AI Chatbot -->', '<!-- Notification Modal -->\n    ' + modalHtml + '\n\n    <!-- AI Chatbot -->');

// Inject Script
newProfile = newProfile.replace('<script src="main.js"></script>', '<script src="js/notifications.js"></script>\n  <script src="main.js"></script>');

fs.writeFileSync('profile.html', newProfile);
console.log('Merge complete!');
