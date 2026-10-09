import { expect } from 'chai';
import type { NotificationRequest } from '../src/services/NotificationService';
import { NotificationService } from '../src/services/NotificationService';

describe('NotificationService', () => {
  it('shows notifications one after another, in the order they were requested', async () => {
    const service = new NotificationService();
    const events: string[] = [];

    service.setPresenter(async (request: NotificationRequest) => {
      const label = request.kind === 'message' ? request.message : request.title;
      events.push(`open ${label}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      events.push(`close ${label}`);
    });

    await Promise.all([service.notify('first'), service.notify('second')]);

    expect(events).to.deep.equal(['open first', 'close first', 'open second', 'close second']);
  });

  it('uses "Закрити" as the default button label', async () => {
    const service = new NotificationService();
    const requests: NotificationRequest[] = [];
    service.setPresenter((request) => {
      requests.push(request);
      return Promise.resolve();
    });

    await service.notify('hello');
    await service.notify('hello', 'Зрозуміло!');

    expect(requests).to.deep.equal([
      { kind: 'message', message: 'hello', buttonLabel: 'Закрити' },
      { kind: 'message', message: 'hello', buttonLabel: 'Зрозуміло!' },
    ]);
  });

  it('passes the submit handler of a user id prompt to the presenter', async () => {
    const service = new NotificationService();
    let answer: string | null = 'not called';
    service.setPresenter((request) => {
      if (request.kind === 'userIdPrompt') {
        answer = request.submit('42');
      }
      return Promise.resolve();
    });

    await service.askUserId('ID?', (value) => (value === '42' ? null : 'wrong'));

    expect(answer).to.equal(null);
  });

  it('keeps working after one notification fails', async () => {
    const service = new NotificationService();
    let calls = 0;
    service.setPresenter(() => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error('boom')) : Promise.resolve();
    });

    let failed = false;
    await service.notify('first').catch(() => {
      failed = true;
    });
    await service.notify('second');

    expect(failed).to.equal(true);
    expect(calls).to.equal(2);
  });

  it('rejects when no presenter is set', async () => {
    const service = new NotificationService();

    let message = '';
    await service.notify('hello').catch((error: Error) => {
      message = error.message;
    });

    expect(message).to.contain('презентер');
  });
});
