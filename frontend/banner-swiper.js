// SwiperJS Banner Init - Hiệu ứng chuyên nghiệp như trang thương mại
// Requires SwiperJS CDN
// https://unpkg.com/swiper@11/swiper-bundle.min.js

document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.swiper', {
    loop: true,
    effect: 'creative', // Hiệu ứng sáng tạo, mượt mà
    speed: 1000, // Tốc độ chuyển động mượt
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true, // Dừng khi hover
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true, // Bullets động đẹp hơn
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    // Hiệu ứng creative - trượt và fade kết hợp
    creativeEffect: {
      prev: {
        translate: ['-120%', 0, -500],
        opacity: 0,
      },
      next: {
        translate: ['120%', 0, -500],
        opacity: 0,
      },
    },
    // Thêm parallax cho mượt mà hơn
    parallax: true,
    // Lazy loading ảnh
    lazy: {
      loadPrevNext: true,
    },
    // Tối ưu performance
    watchSlidesProgress: true,
    // Keyboard control
    keyboard: {
      enabled: true,
    },
  });
});
