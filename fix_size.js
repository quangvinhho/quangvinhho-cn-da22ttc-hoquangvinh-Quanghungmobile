const fs = require('fs');
let content = fs.readFileSync('d:\\GDDA\\frontend\\index.html', 'utf8');

content = content.replace(/<div class="product-card-hover rounded-xl p-5 relative group flex flex-col justify-between h-full bg-white border border-gray-100 hover:border-red-400">/g, '<div class="product-card-hover rounded-xl p-3 relative group flex flex-col justify-between h-full bg-white border border-gray-100 hover:border-red-400">');

content = content.replace(/<div class="relative h-60 mb-4 overflow-hidden p-0/g, '<div class="relative h-44 sm:h-52 mb-3 overflow-hidden p-0');
content = content.replace(/text-\\[10px\\] font-bold px-3 py-1.5/g, 'text-[9px] font-bold px-2 py-1');

content = content.replace(/<div class="flex flex-col gap-2 mt-auto">/g, '<div class="flex flex-col gap-1.5 mt-auto">');
content = content.replace(/<h3 class="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 min-h-\\[44px\\] leading-snug">/g, '<h3 class="font-bold text-[13px] sm:text-[14px] text-gray-800 line-clamp-2 min-h-[40px] leading-snug">');

content = content.replace(/<div class="price-block flex items-end gap-3 mt-1">/g, '<div class="price-block flex items-end gap-2 mt-1">');
content = content.replace(/<div class="text-xl font-black text-red-600 leading-none">/g, '<div class="text-base sm:text-lg font-black text-[#d70018] leading-none">');
content = content.replace(/<div class="text-xs text-gray-400 line-through mb-1">/g, '<div class="text-[11px] text-gray-400 line-through mb-0.5">');

content = content.replace(/<div class="flex items-center justify-between mt-2">/g, '<div class="flex items-center justify-between mt-1">');
content = content.replace(/<div class="flex items-center gap-1 text-yellow-400 text-xs">/g, '<div class="flex items-center gap-1 text-yellow-400 text-[10px]">');
content = content.replace(/<div class="text-xs text-gray-500">\\(/g, '<div class="text-[11px] text-gray-500 hidden sm:block">(');


content = content.replace(/<div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">/g, '<div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">');
content = content.replace(/text-sm font-semibold py-2\\.5 px-3/g, 'text-[13px] font-semibold py-2 px-2');
content = content.replace(/justify-center gap-2 shadow-sm/g, 'justify-center gap-1.5 shadow-sm');
content = content.replace(/text-sm font-semibold py-2\\.5 px-4/g, 'text-[13px] font-semibold py-2 px-3');

fs.writeFileSync('d:\\GDDA\\frontend\\index.html', content);
console.log('Update Sizes');
