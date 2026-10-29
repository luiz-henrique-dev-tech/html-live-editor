export type SandboxMessage = { type: 'update'; html: string } | { type: 'ready' };

// A plain iframe src="/sandbox.html" is not an asset reference Vite rewrites
// for a non-root base (GitHub Pages serves this app under /html-live-editor/),
// so the path is built from the configured base at runtime instead.
export const SANDBOX_URL = `${import.meta.env.BASE_URL}sandbox.html`;

export const sendToSandbox = (frame: HTMLIFrameElement, html: string): void => {
  const message: SandboxMessage = { type: 'update', html };
  frame.contentWindow?.postMessage(message, '*');
};

// The sandboxed iframe has an opaque origin, so the parent cannot name it as
// a postMessage targetOrigin; comparing event.source against the frame's own
// contentWindow identifies it unambiguously instead.
export const onSandboxReady = (frame: HTMLIFrameElement, onReady: () => void): void => {
  window.addEventListener('message', (event: MessageEvent<SandboxMessage>) => {
    if (event.source === frame.contentWindow && event.data?.type === 'ready') {
      onReady();
    }
  });
};
