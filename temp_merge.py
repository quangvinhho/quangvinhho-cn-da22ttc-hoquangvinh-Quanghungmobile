import re

with open('frontend/admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()

with open('frontend/chatbot-knowledge.html', 'r', encoding='utf-8') as f:
    chat_html = f.read()

# Extract styles from admin
style_match = re.search(r'<style>(.*?)</style>', admin_html, re.DOTALL)
admin_styles = style_match.group(1) if style_match else ''
# Get just the sidebar styles
sidebar_styles = '\n'.join([line for line in admin_styles.split('\n') if 'sidebar' in line or '::-webkit-scrollbar' in line or 'glass-effect' in line])

# Extract Sidebar
sidebar_match = re.search(r'<!-- Sidebar -->(.*?)<!-- Main Content -->', admin_html, re.DOTALL)
sidebar_html = '<!-- Sidebar -->' + sidebar_match.group(1) if sidebar_match else ''
# Make Chatbot RAG active
sidebar_html = sidebar_html.replace('class="sidebar-item active', 'class="sidebar-item')
sidebar_html = sidebar_html.replace('href="chatbot-knowledge.html" class="sidebar-item', 'href="chatbot-knowledge.html" class="sidebar-item active')

# Extract Header
header_match = re.search(r'<!-- Header -->(.*?)<!-- Main Content Area -->', admin_html, re.DOTALL)
header_html = '<!-- Header -->' + header_match.group(1) if header_match else ''
# Change header title
header_html = header_html.replace('Tổng quan', 'Chatbot Knowledge Base')
header_html = header_html.replace('Chào mừng trở lại! Đây là Tổng quan hoạt động', 'Quản lý câu hỏi và câu trả lời cho chatbot RAG')

# Extract chat body content
body_match = re.search(r'<body>(.*?)<script src="chatbot-knowledge.js"></script>', chat_html, re.DOTALL)
chat_body = body_match.group(1) if body_match else ''

# Clean up chat head styles
chat_head_match = re.search(r'<head>(.*?)</head>', chat_html, re.DOTALL)
chat_head = chat_head_match.group(1) if chat_head_match else ''
chat_style_match = re.search(r'<style>(.*?)</style>', chat_head, re.DOTALL)
chat_styles = chat_style_match.group(1) if chat_style_match else ''

new_html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Chatbot Knowledge - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    fontFamily: {{ sans: ['Be Vietnam Pro', 'sans-serif'] }},
                }}
            }}
        }}
    </script>
    <style>
        * {{ font-family: 'Be Vietnam Pro', sans-serif; }}
        {sidebar_styles}
        {chat_styles}
        /* Overrides to make it look good in main content area */
        .knowledge-container {{
            margin: 0;
            padding: 0;
            max-width: none;
        }}
        .header-section {{
            display: none; /* Hide the old header section since we have the top header now */
        }}
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 min-h-screen">
  <div class="flex h-screen overflow-hidden">
    {sidebar_html}
    <div class="flex-1 flex flex-col overflow-hidden">
      {header_html}
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative w-full h-full p-4 lg:p-8">
        {chat_body}
      </main>
    </div>
  </div>
  <script src="chatbot-knowledge.js"></script>
</body>
</html>'''

with open('frontend/chatbot-knowledge.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Done")
