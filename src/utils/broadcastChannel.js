// Cross-tab / Dual-screen BroadcastChannel synchronizer
const CHANNEL_NAME = 'spl_auction_live_channel';

class AuctionBroadcastBus {
  constructor() {
    this.channel = null;
    this.listeners = new Set();
    this.initChannel();
  }

  initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.listeners.forEach((listener) => listener(event.data));
      };
    }
  }

  publish(type, payload) {
    const message = { type, payload, timestamp: Date.now() };
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback using LocalStorage event if BroadcastChannel is unavailable
      localStorage.setItem('spl_broadcast_event', JSON.stringify(message));
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

export const broadcastBus = new AuctionBroadcastBus();
