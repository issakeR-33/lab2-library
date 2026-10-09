export type SubmitHandler = (value: string) => string | null;

export type NotificationRequest =
  | { kind: 'message'; message: string; buttonLabel: string }
  | { kind: 'userIdPrompt'; title: string; submit: SubmitHandler };

/** Показує одне сповіщення й повертає проміс, який виконується після його закриття. */
export type Presenter = (request: NotificationRequest) => Promise<void>;

/**
 * Черга сповіщень без залежності від DOM: сервіс вирішує, що і в якому порядку показати,
 * а як саме це намалювати (модальні вікна тощо), знає презентер із шару `ui`.
 */
export class NotificationService {
  private queue: Promise<void> = Promise.resolve();
  private presenter: Presenter | null = null;

  setPresenter(presenter: Presenter): void {
    this.presenter = presenter;
  }

  notify(message: string, buttonLabel = 'Закрити'): Promise<void> {
    return this.enqueue({ kind: 'message', message, buttonLabel });
  }

  /**
   * Запитує ID користувача. `submit` повертає текст помилки (вікно лишається відкритим)
   * або null, якщо значення прийнято.
   */
  askUserId(title: string, submit: SubmitHandler): Promise<void> {
    return this.enqueue({ kind: 'userIdPrompt', title, submit });
  }

  private enqueue(request: NotificationRequest): Promise<void> {
    const next = this.queue.then(() => this.present(request));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private present(request: NotificationRequest): Promise<void> {
    if (!this.presenter) {
      return Promise.reject(new Error('Для сповіщень не задано презентер'));
    }
    return this.presenter(request);
  }
}
