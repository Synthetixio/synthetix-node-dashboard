export function validateNamespace({ namespace, namespaces, generatedKeys }) {
  const errors = [];

  if (!namespace) {
    errors.push('Namespace cannot be empty.');
  }

  if (namespace.length < 3 || namespace.length > 30) {
    errors.push('Namespace must be between 3 and 30 characters long.');
  }

  if (!/^[a-z0-9-_]+$/.test(namespace)) {
    errors.push(
      'Namespace must be DNS-compatible: lowercase letters, numbers, dashes (-), or underscores (_).'
    );
  }

  if (/^-|-$/.test(namespace)) {
    errors.push('Namespace cannot start or end with a dash (-).');
  }

  if (/^_|_$/.test(namespace)) {
    errors.push('Namespace cannot start or end with an underscore (_).');
  }

  if (namespaces?.includes(namespace)) {
    errors.push('Namespace already exists.');
  }

  if (generatedKeys?.includes(namespace)) {
    errors.push('Keypair already exists.');
  }

  return errors;
}
