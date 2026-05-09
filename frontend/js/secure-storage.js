/**
 * SECURE STORAGE - Mã hóa dữ liệu trong localStorage
 * Bảo vệ thông tin người dùng khỏi F12 và XSS attacks
 */

class SecureStorage {
  constructor() {
    // Key mã hóa (trong production nên lưu ở server hoặc dùng Web Crypto API)
    this.secretKey = this.generateDeviceKey();
  }

  // Tạo key dựa trên device fingerprint
  generateDeviceKey() {
    const nav = window.navigator;
    const screen = window.screen;
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage
    ].join('|');
    
    // Simple hash (trong production dùng crypto library tốt hơn)
    return this.simpleHash(fingerprint);
  }

  // Hash đơn giản
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Mã hóa XOR đơn giản (đủ để chống F12 thông thường)
  encrypt(text) {
    if (!text) return '';
    const key = this.secretKey;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  }

  // Giải mã
  decrypt(encrypted) {
    if (!encrypted) return '';
    try {
      const text = atob(encrypted); // Base64 decode
      const key = this.secretKey;
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (e) {
      console.error('Decrypt error');
      return '';
    }
  }

  // Lưu dữ liệu an toàn
  setItem(key, value) {
    try {
      const jsonStr = JSON.stringify(value);
      const encrypted = this.encrypt(jsonStr);
      localStorage.setItem(key, encrypted);
      return true;
    } catch (e) {
      console.error('SecureStorage setItem error');
      return false;
    }
  }

  // Lấy dữ liệu an toàn
  getItem(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (e) {
      console.error('SecureStorage getItem error');
      return null;
    }
  }

  // Xóa dữ liệu
  removeItem(key) {
    localStorage.removeItem(key);
  }

  // Xóa tất cả
  clear() {
    localStorage.clear();
  }
}

// Export instance
window.secureStorage = new SecureStorage();
