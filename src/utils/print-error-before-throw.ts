export function printErrorBeforeThrow(action: () => void) {
  try {
    action();
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
    throw e;
  }
}
