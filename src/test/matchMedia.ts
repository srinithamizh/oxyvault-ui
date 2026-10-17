type Listener = (event: { matches: boolean }) => void;

let prefersDark = false;
const listeners = new Set<Listener>();

/** jsdom has no matchMedia; this installs a controllable stand-in (light OS by default). */
export function installMatchMedia() {
  prefersDark = false;
  listeners.clear();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query.includes("prefers-color-scheme: dark") ? prefersDark : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
    addListener: (listener: Listener) => listeners.add(listener),
    removeListener: (listener: Listener) => listeners.delete(listener),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/** Simulates the user switching their operating system between light and dark. */
export function setSystemPrefersDark(value: boolean) {
  prefersDark = value;
  listeners.forEach((listener) => listener({ matches: value }));
}
