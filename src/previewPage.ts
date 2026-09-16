import { createLiveChannel, type LiveMessage } from './liveChannel';

const frame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
const channel = createLiveChannel();

channel.onmessage = (event: MessageEvent<LiveMessage>) => {
  if (event.data.type === 'update') {
    frame.srcdoc = event.data.html;
  }
};

const request: LiveMessage = { type: 'request' };
channel.postMessage(request);
