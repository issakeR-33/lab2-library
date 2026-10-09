import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

import { LibraryService } from './services/LibraryService';
import { Storage } from './services/Storage';
import { App } from './ui/App';
import { NotificationService } from './ui/Modal';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Елемент #app не знайдено в index.html');
}

const service = new LibraryService(new Storage());
new App(root, service, new NotificationService()).mount();
