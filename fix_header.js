const fs = require('fs');
let content = fs.readFileSync('d:/GDDA/frontend/components/header.js', 'utf8');

content = content.replace(/if\s*\(loginBtn\)\s*loginBtn\.classList\.add\('hidden'\);[\s\n]*if\s*\(userInfo\)\s*userInfo\.classList\.remove\('hidden'\);/g, 
  "if (loginBtn) { loginBtn.classList.add('hidden'); loginBtn.style.setProperty('display', 'none', 'important'); }\n" +
  "      if (userInfo) { userInfo.classList.remove('hidden'); userInfo.style.setProperty('display', 'block', 'important'); }"
);

content = content.replace(/if\s*\(loginBtn\)\s*loginBtn\.classList\.remove\('hidden'\);[\s\n]*if\s*\(userInfo\)\s*userInfo\.classList\.add\('hidden'\);/g, 
  "if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.style.removeProperty('display'); }\n" +
  "      if (userInfo) { userInfo.classList.add('hidden'); userInfo.style.setProperty('display', 'none', 'important'); }"
);

fs.writeFileSync('d:/GDDA/frontend/components/header.js', content, 'utf8');
console.log('Fixed checkUserLogin logic');
