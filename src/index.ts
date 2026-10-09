import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

import { LibraryService } from './services/LibraryService';
import { NotificationService } from './services/NotificationService';
import { Storage } from './services/Storage';
import { createModalPresenter } from './ui/components/Modal';
import { App } from './ui/render';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Елемент #app не знайдено в index.html');
}

const notifications = new NotificationService();
notifications.setPresenter(createModalPresenter());

const service = new LibraryService(new Storage());
new App(root, service, notifications).mount();
