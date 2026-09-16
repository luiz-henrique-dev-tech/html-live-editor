export const LIVE_CHANNEL_NAME = 'html-live-editor:live-preview';

export type LiveMessage = { type: 'update'; html: string } | { type: 'request' };

export const createLiveChannel = (): BroadcastChannel => new BroadcastChannel(LIVE_CHANNEL_NAME);
