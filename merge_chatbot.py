import re

# Read admin.html
with open('frontend/admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()

# Read chatbot-knowledge.html
with open('frontend/chatbot-knowledge.html', 'r', encoding='utf-8') as f:
    chat_html = f.read()

# 1. Extract CSS from chat_html
css_match = re.search(r'<style>(.*?)</style>', chat_html, re.DOTALL)
chat_css = css_match.group(1) if css_match else ''
# We only want the specific knowledge CSS, not the overrides we added
knowledge_css = []
capture = False
for line in chat_css.split('\n'):
    if '.knowledge-container {' in line:
        capture = True
    if capture:
        knowledge_css.append(line)

chat_css_str = '\n'.join(knowledge_css)
chat_css_str = chat_css_str.replace('.knowledge-container {', '.knowledge-container { /* Chatbot Styles */')

# Inject CSS into admin.html
admin_html = admin_html.replace('</style>', f'    {chat_css_str}\n  </style>')

# 2. Extract HTML content from chat_html
content_match = re.search(r'<main[^>]*>(.*?)</main>', chat_html, re.DOTALL)
if not content_match:
    # try body
    content_match = re.search(r'<div class="knowledge-container">(.*)<!-- Modal', chat_html, re.DOTALL)

chat_content = ''
if content_match:
    chat_content = content_match.group(1)
else:
    # Fallback to extracting the container
    container_match = re.search(r'(<div class="knowledge-container">.*?</div>\s*<!-- Modal.*?</div>\s*</div>)', chat_html, re.DOTALL)
    if container_match:
        chat_content = container_match.group(1)
    else:
        # Just grab everything inside main
        m = re.search(r'<main[^>]*>(.*?)</main>', chat_html, re.DOTALL)
        chat_content = m.group(1) if m else ''

# 3. Create the section HTML
section_html = f'''
      <!-- Chatbot RAG Section -->
      <section id="section-chatbot-rag" class="section-content">
        {chat_content}
      </section>
'''

# Inject the section before the closing </main> or after the last section in admin.html
# admin.html has <div class="flex-1 flex flex-col overflow-hidden"> ... <main ...> ... sections ... </main>
# Let's insert it right before </main>
admin_html = admin_html.replace('</main>', f'{section_html}\n      </main>')

# 4. Update the sidebar link in admin.html
# From: <a href="chatbot-knowledge.html" class="sidebar-item flex items-center px-3 py-2.5 text-slate-100 group">
# To: <a href="#" onclick="showSection('chatbot-rag')" class="sidebar-item flex items-center px-3 py-2.5 text-slate-100 group" id="nav-chatbot-rag">
admin_html = re.sub(
    r'<a href="chatbot-knowledge\.html"[^>]*>',
    '<a href="#" onclick="showSection(\'chatbot-rag\')" class="sidebar-item flex items-center px-3 py-2.5 text-slate-100 group" id="nav-chatbot-rag">',
    admin_html
)

# 5. Update showSection function in admin.html
# news: 'Quản lý Tin tức', -> news: 'Quản lý Tin tức',\n        'chatbot-rag': 'Quản lý Chatbot Knowledge',
admin_html = admin_html.replace(
    "news: 'Quản lý Tin tức',",
    "news: 'Quản lý Tin tức',\n        'chatbot-rag': 'Quản lý Chatbot Knowledge',"
)

# 6. Add chatbot-knowledge.js script tag to admin.html before </body>
script_tag = '<script src="chatbot-knowledge.js"></script>\n</body>'
admin_html = admin_html.replace('</body>', script_tag)

# 7. Add init call to DOMContentLoaded in admin.html
init_call = '''
        // Initialize Chatbot Knowledge Base data
        if (typeof initChatbotKnowledge === 'function') {
            initChatbotKnowledge();
        }

        // Load dashboard data
'''
admin_html = admin_html.replace('// Load dashboard data', init_call)

# Write back admin.html
with open('frontend/admin.html', 'w', encoding='utf-8') as f:
    f.write(admin_html)


# Now modify chatbot-knowledge.js
with open('frontend/chatbot-knowledge.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace loading functions to use admin's page-loader
js_content = js_content.replace("document.getElementById('loadingOverlay')", "document.getElementById('page-loader')")
js_content = js_content.replace("overlay.style.display = 'flex'", "overlay.classList.remove('hidden')")
js_content = js_content.replace("overlay.style.display = 'none'", "overlay.classList.add('hidden')")

# Create init function and remove auto checkAdminAuth
init_logic = '''// Khởi tạo
function initChatbotKnowledge() {
    loadStats();
    loadKnowledge();
}

// Nếu truy cập trực tiếp trang cũ (fallback)
if (window.location.pathname.includes('chatbot-knowledge.html')) {
    checkAdminAuth().then(isAuth => {
        if (isAuth) {
            initChatbotKnowledge();
        }
    });
}
'''

js_content = re.sub(r'// Khởi tạo\ncheckAdminAuth\(\)\.then\(isAuth => \{.*?(?=\n// Tìm kiếm|$)', init_logic, js_content, flags=re.DOTALL)

with open('frontend/chatbot-knowledge.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Migration successful")
