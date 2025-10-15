const button = document.querySelector('.button-draw');
const container = document.getElementById('draw-heart');

button.addEventListener('click', (e) => {
  // Lấy tọa độ click tương đối trong vùng chứa
  const rect = container.getBoundingClientRect();
  const x = Math.random() * (rect.width - 40);
  const y = Math.random() * (rect.height - 40);

  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;

  // Màu ngẫu nhiên
  heart.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
  heart.style.setProperty('--heart-color', heart.style.background);

  container.appendChild(heart);
});