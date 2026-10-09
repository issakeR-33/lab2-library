import { Modal } from 'bootstrap';
import { Validation } from '../utils/validators';
import { h } from './dom';

type SubmitHandler = (value: string) => string | null;

/**
 * Сповіщення користувача через модальні вікна Bootstrap (замість alert).
 * Вікна показуються по черзі: наступне з'являється після закриття попереднього.
 */
export class NotificationService {
  private queue: Promise<void> = Promise.resolve();

  notify(message: string, buttonLabel = 'Закрити'): Promise<void> {
    return this.enqueue(() => this.showMessage(message, buttonLabel));
  }

  /**
   * Запитує ID користувача. `submit` повертає текст помилки (вікно лишається відкритим)
   * або null, якщо значення прийнято.
   */
  askUserId(title: string, submit: SubmitHandler): Promise<void> {
    return this.enqueue(() => this.showUserIdPrompt(title, submit));
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const next = this.queue.then(task);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private showMessage(message: string, buttonLabel: string): Promise<void> {
    const button = h('button', {
      className: 'btn btn-primary',
      text: buttonLabel,
      attrs: { type: 'button', 'data-bs-dismiss': 'modal' },
    });
    const root = this.createModal([h('div', { className: 'modal-body', text: message })], [button]);

    return this.open(root);
  }

  private showUserIdPrompt(title: string, submit: SubmitHandler): Promise<void> {
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
    const root = this.createModal([header, body], [cancel, save]);

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

    return this.open(root);
  }

  private createModal(content: HTMLElement[], buttons: HTMLElement[]): HTMLElement {
    const footer = h('div', { className: 'modal-footer' }, buttons);
    const dialog = h('div', { className: 'modal-dialog modal-dialog-centered' }, [
      h('div', { className: 'modal-content' }, [...content, footer]),
    ]);

    return h('div', { className: 'modal fade', attrs: { tabindex: '-1', 'aria-hidden': 'true' } }, [
      dialog,
    ]);
  }

  private open(root: HTMLElement): Promise<void> {
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
}
