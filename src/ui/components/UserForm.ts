import type { LibraryService } from '../../services/LibraryService';
import { Validation } from '../../utils/validators';
import { createFormCard } from './FormCard';

export function createUserForm(service: LibraryService, onChange: () => void): HTMLElement {
  return createFormCard({
    title: 'Додати Користувача',
    submitLabel: 'Додати Користувача',
    fields: [
      { name: 'name', placeholder: "Ім'я" },
      { name: 'email', placeholder: 'Email', inputMode: 'email' },
    ],
    validate: (values) => {
      const { errors } = Validation.validateUser(values);
      if (!errors.email && service.isEmailTaken(values.email)) {
        errors.email = Validation.MESSAGES.emailTaken;
      }
      return errors;
    },
    onSubmit: (values) => {
      service.addUser(values);
      onChange();
    },
  });
}
