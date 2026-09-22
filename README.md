# WebRTC Video Calling Demonstration

## Project Overview

This project serves as a comprehensive, practical demonstration of WebRTC (Web Real-Time Communication) capabilities for browser-native audio, video, and data exchange. It highlights the fundamental concepts of establishing direct peer-to-peer connections across the web without relying on a central server for media relay. 

By functioning entirely in the browser, the platform achieves sub-100ms latency, offering high-definition video calls that automatically adapt to network conditions. The project is designed as a foundational blueprint for developers looking to understand the mechanics of WebRTC session establishment and peer-to-peer architecture.

---

## Signaling Server Architecture

The backend of this application functions exclusively as a **Signaling Server**. WebRTC relies on direct peer-to-peer communication for media, but peers must first discover each other and negotiate connection parameters before they can connect directly. The signaling server facilitates this initial handshake.

Once the handshake is successfully completed, the signaling server steps out of the media path entirely, allowing clients to stream high-definition media directly to one another.

### State Management

The signaling server is built using Node.js and the `ws` library for WebSocket communication. It manages transient connection state in memory without relying on external databases, optimizing for speed and simplicity:

* **Room Topologies**: Clients can join specific rooms. Rooms are capped at a maximum of 5 participants to ensure optimal peer-to-peer mesh performance (a full mesh topology requires every participant to maintain a direct connection with every other participant).
* **Client Registry**: The server maintains active WebSocket connections and associates them with unique user identifiers and room assignments.
* **Lifecycle Events**: The server handles connection closures gracefully by cleaning up memory state and notifying remaining room participants to close redundant connections.

---

## The WebRTC Handshake Lifecycle

The signaling server acts as a low-latency message router for the WebRTC signaling sequence.

### Detailed Sequence Breakdown

1. **Initialization and Discovery**: A client joins a room via a WebSocket connection. The server registers the client and notifies existing peers in the room of the new arrival.
2. **Offer Generation**: An existing peer generates an SDP (Session Description Protocol) offer via `RTCPeerConnection.createOffer()`. The peer registers this locally using `setLocalDescription(offer)` and transmits the offer payload to the signaling server.
3. **Offer Routing**: The signaling server forwards the offer to the targeted new peer.
4. **Answer Generation**: The receiving peer processes the incoming offer using `setRemoteDescription(offer)`. It then generates a corresponding answer via `createAnswer()`, sets it locally with `setLocalDescription(answer)`, and sends it back to the signaling server.
5. **Answer Routing**: The signaling server routes the answer back to the original peer, who completes the session establishment via `setRemoteDescription(answer)`.
6. **Network Traversal (ICE Exchange)**: Concurrently with the SDP exchange, peers gather network routing information (ICE candidates). These candidates are exchanged through the signaling server to traverse NATs and firewalls, establishing the optimal direct media path.
7. **Auxiliary Data Delivery**: Text chat messages are broadcast to all other peers in the specific room via the signaling server.

---

## Diagnostic and Testing Tooling

When working with complex WebRTC implementations, standard browser-native and community diagnostic tools are vital to inspect the peer-to-peer lifecycle. This project leverages the following methodologies for debugging and validation:

### 1. Browser Native Inspection
* **WebRTC Internals**: Accessible via `chrome://webrtc-internals`, this built-in Chromium tool provides comprehensive connection state dumps, diagnostic audio recordings, and packet-level inspection. It is heavily used to monitor packet loss, bitrate adaptation, and candidate pair selection.

### 2. Network Traversal Validation
* **Trickle ICE Diagnostics**: Utilities hosted by the WebRTC project (such as the `trickle-ice` sample utility) are used to verify candidate gathering processes and validate STUN/TURN infrastructure independently of the application logic.

### 3. Isolated Prototyping
* **Minimal Reproductions**: Pure JavaScript implementations and minimal reproductions (often hosted on JSFiddle or similar platforms) are used to test core API functionality in isolation, ensuring that signaling architecture changes do not interfere with standard WebRTC spec compliance.
