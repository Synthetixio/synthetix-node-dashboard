export async function safeImport(importer, { RETRY_DELAY = 2000, RETRY_LIMIT = 10 } = {}) {
  if (window?.localStorage?.UNSAFE_IMPORT === 'true') {
    return importer();
  }

  for (let step = 0; step < RETRY_LIMIT; step++) {
    try {
      return await importer();
    } catch (error) {
      console.error(error);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  // We went over the limit, did not return the import result successfully so need a full reload
  document.location.reload();
}
