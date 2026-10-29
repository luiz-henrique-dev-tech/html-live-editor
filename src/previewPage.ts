import { createLiveChannel, type LiveMessage } from './liveChannel';
import { onSandboxReady, sendToSandbox, SANDBOX_URL } from './sandboxChannel';

const frame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
frame.src = SANDBOX_URL;
const channel = createLiveChannel();

// Buffers the latest content in case it arrives over BroadcastChannel before
// the local sandboxed iframe has announced it's ready to receive it.
let latestHtml: string | null = null;

channel.onmessage = (event: MessageEvent<LiveMessage>) => {
  if (event.data.type === 'update') {
    latestHtml = event.data.html;
    sendToSandbox(frame, latestHtml);
  }
};

onSandboxReady(frame, () => {
  if (latestHtml !== null) sendToSandbox(frame, latestHtml);
});

const request: LiveMessage = { type: 'request' };
channel.postMessage(request);
