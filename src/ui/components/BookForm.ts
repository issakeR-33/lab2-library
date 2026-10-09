import type { LibraryService } from '../../services/LibraryService';
import { Validation } from '../../utils/validators';
import { createFormCard } from './FormCard';

export function createBookForm(service: LibraryService, onChange: () => void): HTMLElement {
  return createFormCard({
    title: 'Додати Книгу',
    submitLabel: 'Додати Книгу',
    fields: [
      { name: 'title', placeholder: 'Назва книги' },
      { name: 'author', placeholder: 'Автор' },
      { name: 'year', placeholder: 'Рік видання', inputMode: 'numeric' },
    ],
    validate: (values) => Validation.validateBook(values).errors,
    onSubmit: (values) => {
      service.addBook({ ...values, year: Number(values.year) });
      onChange();
    },
  });
}
