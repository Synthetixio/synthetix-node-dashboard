export function validateNamespace(namespace) {
  // TODO: validation requirements are needed

  const errors = [];

  if (!namespace || namespace.trim() === '') {
    errors.push('Namespace cannot be empty.');
  }

  if (namespace.length < 3 || namespace.length > 30) {
    errors.push('Namespace must be between 3 and 30 characters long.');
  }

  if (!/^[a-zA-Z0-9-]+$/.test(namespace)) {
    errors.push('Namespace can only contain letters, numbers, and hyphens (-).');
  }

  if (/^-|-$/.test(namespace)) {
    errors.push('Namespace cannot start or end with a hyphen (-).');
  }

  return errors;
}
