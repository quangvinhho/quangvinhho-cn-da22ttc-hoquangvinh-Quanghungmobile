# -*- coding: utf-8 -*-
"""
Fix encoding issues in index.html
Convert from corrupted encoding to proper UTF-8
"""

# Read the file with the current (corrupted) encoding
with open('frontend/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace corrupted Vietnamese characters with correct ones
replacements = {
    '�i?n tho?i': 'Điện thoại',
    'di?n tho?i': 'điện thoại',
    'ch�nh h�ng': 'chính hãng',
    'gi� t?t': 'giá tốt',
    'nh?t': 'nhất',
    'th? tru?ng': 'thị trường',
    'khuy?n m�i': 'khuyến mãi',
    'B?o h�nh': 'Bảo hành',
    'giao h�ng': 'giao hàng',
    'mi?n ph�': 'miễn phí',
    'C?a h�ng': 'Cửa hàng',
    'uy t�n': 'uy tín',
    'ch?t lu?ng': 'chất lượng',
    'h�ng d?u': 'hàng đầu',
    'Vi?t Nam': 'Việt Nam',
    'S? 215': 'Số 215',
    'Gi�p Nh?t': 'Giáp Nhất',
    'Nh�n Ch�nh': 'Nhân Chính',
    'Thanh Xu�n': 'Thanh Xuân',
    'H� N?i': 'Hà Nội',
    'T? l?': 'Tỷ lệ',
    'tuong ph?n': 'tương phản',
    't?i uu': 'tối ưu',
    'M�u d?': 'Màu đỏ',
    'ch�nh': 'chính',
    'v?i': 'với',
    't?i': 'tối',
    'N?n d?': 'Nền đỏ',
    'nh?t': 'nhạt',
    'M�u nh?n': 'Màu nhấn',
    'gi�': 'giá',
    'Ch?': 'Chữ',
    'ph?': 'phụ',
    'Ch? m?': 'Chữ mờ',
    's�ng': 'sáng',
    '�?m b?o': 'Đảm bảo',
    'N�t b?m': 'Nút bấm',
    'cao': 'cao',
    'n?i b?t': 'nổi bật',
    'tr?': 'trả',
    'g�p': 'góp',
    'mi?n': 'miễn',
    'tr�': 'trị',
    'gi�m': 'giảm',
    's?c': 'sốc',
    'd?ng': 'dụng',
    'n?i': 'nội',
    't?ng': 'tổng',
    'n?m': 'năm',
    'tr?n': 'trọn',
    'cu?c': 'cuộc',
    's?ng': 'sống',
    'd? d�ng': 'dễ dàng',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Write back with UTF-8 BOM encoding
with open('frontend/index.html', 'w', encoding='utf-8-sig') as f:
    f.write(content)

print("✅ Fixed encoding successfully!")
print("File saved as UTF-8 with BOM")
