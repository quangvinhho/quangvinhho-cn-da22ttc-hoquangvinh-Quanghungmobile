const API_URL_CHATBOT_KNOWLEDGE = 'http://localhost:3000/api/chatbot-knowledge';

let chatbotKnowledgeList = [];

// Thêm listener cho nút load
document.getElementById('nav-chatbot-knowledge')?.addEventListener('click', loadChatbotKnowledge);

async function loadChatbotKnowledge() {
    try {
        const res = await fetch(API_URL_CHATBOT_KNOWLEDGE);
        if (!res.ok) throw new Error('Network rror');
        chatbotKnowledgeList = await res.json();
        renderChatbotKnowledgeTable();
    } catch (e) {
        console.error('Lỗi khi tải dữ liệu chatbot:', e);
        const tbody = document.getElementById('chatbot-knowledge-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Lỗi khi tải dữ liệu!</td></tr>';
    }
}

function renderChatbotKnowledgeTable() {
    const tbody = document.getElementById('chatbot-knowledge-table-body');
    if (!tbody) return;
    
    // Áp dụng filter (nếu có)
    const typeFilter = document.getElementById('chatbot-knowledge-type-filter')?.value || '';
    const search = document.getElementById('chatbot-knowledge-search')?.value.toLowerCase() || '';
    
    let filtered = chatbotKnowledgeList.filter(item => {
        const matchType = !typeFilter || item.type === typeFilter;
        const matchSearch = !search || item.question.toLowerCase().includes(search) || item.answer.toLowerCase().includes(search);
        return matchType && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Không có dữ liệu</td></tr>';
        return;
    }

    const typeLabels = {
        'store_info': '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Thông tin cửa hàng</span>',
        'faq': '<span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">FAQ</span>',
        'policy': '<span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Chính sách</span>'
    };

    tbody.innerHTML = filtered.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4 align-top text-center text-sm font-medium text-slate-500">#${item.id}</td>
            <td class="p-4 align-top font-medium text-slate-800 line-clamp-2">${item.question}</td>
            <td class="p-4 align-top text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">${item.answer}</td>
            <td class="p-4 align-top">${typeLabels[item.type] || item.type}</td>
            <td class="p-4 align-top">
                ${item.is_active ? 
                    '<span class="text-emerald-500"><i class="fas fa-check-circle"></i> Bật</span>' : 
                    '<span class="text-slate-400"><i class="fas fa-times-circle"></i> Tắt</span>'}
            </td>
            <td class="p-4 align-top">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="editChatbotKnowledge(${item.id})" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center" title="Sửa">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteChatbotKnowledge(${item.id})" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center" title="Xóa">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

document.getElementById('chatbot-knowledge-type-filter')?.addEventListener('change', renderChatbotKnowledgeTable);
document.getElementById('chatbot-knowledge-search')?.addEventListener('input', renderChatbotKnowledgeTable);

function openChatbotKnowledgeModal(id = null) {
    const modal = document.getElementById('chatbot-knowledge-modal');
    const form = document.getElementById('chatbot-knowledge-form');
    const title = document.getElementById('chatbot-knowledge-modal-title');
    
    form.reset();
    document.getElementById('chatbot-knowledge-id').value = '';
    document.getElementById('chatbot-knowledge-active').checked = true;
    
    if (id) {
        const item = chatbotKnowledgeList.find(x => x.id === id);
        if (item) {
            title.textContent = 'Sửa thông tin Chatbot';
            document.getElementById('chatbot-knowledge-id').value = item.id;
            document.getElementById('chatbot-knowledge-type').value = item.type;
            document.getElementById('chatbot-knowledge-question').value = item.question;
            document.getElementById('chatbot-knowledge-answer').value = item.answer;
            document.getElementById('chatbot-knowledge-active').checked = !!item.is_active;
        }
    } else {
        title.textContent = 'Thêm thông tin Chatbot';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeChatbotKnowledgeModal() {
    const modal = document.getElementById('chatbot-knowledge-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function editChatbotKnowledge(id) { openChatbotKnowledgeModal(id); }

async function deleteChatbotKnowledge(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
        const res = await fetch(`${API_URL_CHATBOT_KNOWLEDGE}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Xóa thành công!');
            loadChatbotKnowledge();
        } else alert('Lỗi khi xóa!');
    } catch (e) {
        console.error(e);
        alert('Lỗi mạng!');
    }
}

async function saveChatbotKnowledge(e) {
    e.preventDefault();
    const id = document.getElementById('chatbot-knowledge-id').value;
    const data = {
        type: document.getElementById('chatbot-knowledge-type').value,
        question: document.getElementById('chatbot-knowledge-question').value,
        answer: document.getElementById('chatbot-knowledge-answer').value,
        is_active: document.getElementById('chatbot-knowledge-active').checked ? 1 : 0
    };

    const url = id ? `${API_URL_CHATBOT_KNOWLEDGE}/${id}` : API_URL_CHATBOT_KNOWLEDGE;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeChatbotKnowledgeModal();
            loadChatbotKnowledge();
            alert('Lưu thành công!');
        } else {
            alert('Lỗi khi lưu!');
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi lưu dữ liệu!');
    }
}