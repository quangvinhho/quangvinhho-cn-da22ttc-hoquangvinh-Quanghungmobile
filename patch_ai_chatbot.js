const fs = require('fs');
let code = fs.readFileSync('D:/GDDA/frontend/components/ai-chatbot.js', 'utf8');

const oldHtml = `          <div class="ai-chat-input-area">
            <div class="ai-chat-input-wrapper">
              <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Nhập tin nhắn...">
              <button class="ai-chat-send" id="ai-chat-send">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>`;

const newHtml = `          <div class="ai-chat-input-area" style="position: relative;">
            <div id="ai-image-preview-container" style="display: none; position: absolute; bottom: 100%; left: 10px; background: #fff; padding: 5px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 10; margin-bottom: 10px;">
              <img id="ai-image-preview" src="" style="max-width: 100px; max-height: 100px; border-radius: 4px; object-fit: cover;">
              <button id="ai-remove-image-btn" style="position:absolute; top:-5px; right:-5px; background:#d70018; color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-times"></i></button>
            </div>
            <div class="ai-chat-input-wrapper">
              <label for="ai-image-upload" class="ai-image-upload-label" style="cursor: pointer; padding: 0 10px; color: #888; display:flex; align-items:center;" title="Tải ảnh lên">
                <i class="fas fa-image text-lg hover:text-[#d70018] transition-colors"></i>
              </label>
              <input type="file" id="ai-image-upload" accept="image/*" style="display: none;">
              <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Nhập tin nhắn hay tải ảnh...">
              <button class="ai-chat-send" id="ai-chat-send">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>`;

code = code.replace(oldHtml, newHtml);
fs.writeFileSync('D:/GDDA/frontend/components/ai-chatbot.js', code);
console.log("UI HTML updated");
