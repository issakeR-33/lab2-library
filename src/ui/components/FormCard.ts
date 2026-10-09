import type { Validation } from '../utils/validators';
import { h } from './dom';

export interface FieldConfig<K extends string> {
  name: K;
  placeholder: string;
  inputMode?: 'text' | 'numeric' | 'email';
}

export interface FormConfig<K extends string> {
  title: string;
  submitLabel: string;
  fields: FieldConfig<K>[];
  validate(values: Record<K, string>): Validation.Errors<K>;
  onSubmit(values: Record<K, string>): void;
}

export function createCard(title: string, content: Node[]): HTMLElement {
  return h('section', { className: 'card shadow-sm mb-3' }, [
    h('div', { className: 'card-body' }, [
      h('h2', { className: 'h4 fw-bold mb-3', text: title }),
      ...content,
    ]),
  ]);
}

/** Картка з формою: показує під полями повідомлення про помилки валідації. */
export function createFormCard<K extends string>(config: FormConfig<K>): HTMLElement {
  const inputs = new Map<K, HTMLInputElement>();
  const errors = new Map<K, HTMLElement>();

  const form = h('form', { attrs: { novalidate: '' } });

  for (const field of config.fields) {
    const input = h('input', {
      className: 'form-control',
      attrs: {
        type: 'text',
        name: field.name,
        placeholder: field.placeholder,
        inputmode: field.inputMode ?? 'text',
        autocomplete: 'off',
      },
    });
    const error = h('div', { className: 'text-danger small mt-1' });
    inputs.set(field.name, input);
    errors.set(field.name, error);
    form.append(h('div', { className: 'mb-2' }, [input, error]));
  }

  form.append(
    h('button', {
      className: 'btn btn-success',
      text: config.submitLabel,
      attrs: { type: 'submit' },
    }),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const values = {} as Record<K, string>;
    inputs.forEach((input, name) => {
      values[name] = input.value;
    });

    const found = config.validate(values);
    errors.forEach((element, name) => {
      element.textContent = found[name] ?? '';
    });
    if (Object.keys(found).length > 0) {
      return;
    }

    config.onSubmit(values);
    form.reset();
  });

  return createCard(config.title, [form]);
}
