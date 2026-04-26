const fs = require('fs');
let code = fs.readFileSync('D:/GDDA/frontend/components/ai-chatbot.js', 'utf8');

const regex = /if \(removeImageBtn\) \{\s*removeImageBtn\.addEventListener\('click',\s*removePreviewImage\);\s*\}\s*if \(!historyLoaded\s*\|\|\s*userChanged\)/;

const replacement = `if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removePreviewImage);
      }

      currentUserId = getUserId();

      chatBtn.addEventListener('click', async () => {
        chatWindow.classList.toggle('active');

        if (chatWindow.classList.contains('active')) {
          window.dispatchEvent(new CustomEvent('chatbot-opened'));

          const userChanged = checkUserChanged();

          if (!historyLoaded || userChanged)`;

code = code.replace(regex, replacement);

fs.writeFileSync('D:/GDDA/frontend/components/ai-chatbot.js', code);
console.log('Successfully patched the file');