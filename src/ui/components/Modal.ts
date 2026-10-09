import { Modal } from 'bootstrap';
import type {
  NotificationRequest,
  Presenter,
  SubmitHandler,
} from '../../services/NotificationService';
import { Validation } from '../../utils/validators';
import { h } from '../dom';

function createModal(content: HTMLElement[], buttons: HTMLElement[]): HTMLElement {
  const footer = h('div', { className: 'modal-footer' }, buttons);
  const dialog = h('div', { className: 'modal-dialog modal-dialog-centered' }, [
    h('div', { className: 'modal-content' }, [...content, footer]),
  ]);

  return h('div', { className: 'modal fade', attrs: { tabindex: '-1', 'aria-hidden': 'true' } }, [
    dialog,
  ]);
}

/** Показує модальне вікно Bootstrap; проміс виконується після його закриття. */
function open(root: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    document.body.append(root);
    const modal = new Modal(root);
    root.addEventListener('hidden.bs.modal', () => {
      modal.dispose();
      root.remove();
      resolve();
    });
    modal.show();
  });
}

function showMessage(message: string, buttonLabel: string): Promise<void> {
  const button = h('button', {
    className: 'btn btn-primary',
    text: buttonLabel,
    attrs: { type: 'button', 'data-bs-dismiss': 'modal' },
  });
  const root = createModal([h('div', { className: 'modal-body', text: message })], [button]);

  return open(root);
}

function showUserIdPrompt(title: string, submit: SubmitHandler): Promise<void> {
  const input = h('input', {
    className: 'form-control form-control-lg',
    attrs: { type: 'text', placeholder: 'ID', inputmode: 'numeric', autocomplete: 'off' },
  });
  const error = h('div', { className: 'text-danger small mt-1' });
  const cancel = h('button', {
    className: 'btn btn-secondary',
    text: 'Скасувати',
    attrs: { type: 'button', 'data-bs-dismiss': 'modal' },
  });
  const save = h('button', {
    className: 'btn btn-primary',
    text: 'Зберегти',
    attrs: { type: 'button' },
  });

  const header = h('div', { className: 'modal-header' }, [
    h('h5', { className: 'modal-title', text: title }),
    h('button', {
      className: 'btn-close',
      attrs: { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Закрити' },
    }),
  ]);
  const body = h('div', { className: 'modal-body' }, [input, error]);
  const root = createModal([header, body], [cancel, save]);

  const submitValue = (): void => {
    const value = input.value.trim();
    const message = Validation.validateUserId(value) ?? submit(value);
    error.textContent = message ?? '';
    if (message === null) {
      Modal.getInstance(root)?.hide();
    }
  };
  save.addEventListener('click', submitValue);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submitValue();
    }
  });
  root.addEventListener('shown.bs.modal', () => input.focus());

  return open(root);
}

/** Презентер для `NotificationService`: показує сповіщення модальними вікнами (замість alert). */
export function createModalPresenter(): Presenter {
  return (request: NotificationRequest): Promise<void> =>
    request.kind === 'message'
      ? showMessage(request.message, request.buttonLabel)
      : showUserIdPrompt(request.title, request.submit);
}
