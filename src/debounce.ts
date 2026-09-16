export const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args): void => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
};
