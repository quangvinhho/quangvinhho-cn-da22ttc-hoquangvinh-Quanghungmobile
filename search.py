import re

with open('frontend/admin.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Let's search for some patterns:
# 1. Sidebar menu items: we want to find where sidebar items are defined.
# 2. Main content sections: we want to find where sections (like dashboard, products, employees) are defined.
# 3. JS scripts or functions that handle dashboard statistics.

print("=== SIDEBAR SECTION ===")
for match in re.finditer(r'<aside.*?>.*?</aside>', content, re.DOTALL):
    print(f"Aside tag at character {match.start()} to {match.end()}")
    # print first 500 chars of aside
    print(content[match.start():match.start()+1000])

print("\n=== SCRIPT SECTIONS ===")
for match in re.finditer(r'<script.*?>', content):
    start = match.start()
    end = content.find('</script>', start)
    script_content = content[start:end+9]
    if 'showSection' in script_content or 'loadDashboard' in script_content or 'loadProducts' in script_content:
        print(f"Script starting at line {content.count('\n', 0, start) + 1} contains section handlers.")
        # Print a small part of it
        print(script_content[:300] + "\n...")

print("\n=== MAIN CONTENT / SECTIONS ===")
for match in re.finditer(r'id=["\'](dashboard|products|employees)-section["\']|id=["\'](dashboard|products|employees)["\']', content):
    line_num = content.count('\n', 0, match.start()) + 1
    print(f"Found section match '{match.group(0)}' on line {line_num}:")
    print(content[match.start()-50:match.start()+200])
