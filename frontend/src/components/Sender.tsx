import { useState, useEffect, useRef } from "react";

export function Sender() {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [status, setStatus] = useState<"idle" | "calling" | "connected">("idle");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
    };
    return () => ws.close();
  }, []);

  async function startCall() {
    if (!socket) return;
    setStatus("calling");

    const pc = new RTCPeerConnection();

    // --- ICE ---
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.send(JSON.stringify({ type: "iceCandidate", candidate: e.candidate }));
      }
    };

    // --- Receive remote stream from Receiver (two-way) ---
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = new MediaStream();
        }
        (remoteVideoRef.current.srcObject as MediaStream).addTrack(e.track);
      }
    };

    // --- Handle answer + ICE from Receiver ---
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
        setStatus("connected");
      } else if (data.type === "iceCandidate") {
        pc.addIceCandidate(data.candidate);
      }
    };

    // Register onnegotiationneeded BEFORE adding tracks to avoid race
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: "createOffer", sdp: pc.localDescription?.sdp }));
    };

    // Get local camera + mic, show preview (muted to prevent echo)
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }

  const statusText = status === "connected" ? "Connected" : status === "calling" ? "Calling…" : "";

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <h2 style={{ color: "#fff", margin: 0 }}>Sender</h2>
      {statusText && <p style={{ color: "#fff", margin: 0, fontSize: "13px" }}>{statusText}</p>}

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#fff", fontSize: "13px" }}>You</span>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "360px", height: "270px", background: "#111", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#fff", fontSize: "13px" }}>Remote</span>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "360px", height: "270px", background: "#111", objectFit: "cover" }} />
        </div>
      </div>

      {status === "idle" && (
        <button onClick={startCall} style={{ padding: "8px 24px", fontSize: "15px", cursor: "pointer" }}>
          Start Call
        </button>
      )}
    </div>
  );
}
