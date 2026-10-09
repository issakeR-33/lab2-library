import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import 'bootstrap';

const root = document.getElementById('app');

if (root) {
  const title = document.createElement('h1');
  title.className = 'text-center my-3';
  title.textContent = 'Система Управління Бібліотекою';
  root.appendChild(title);
}
