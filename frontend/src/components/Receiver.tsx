import { useEffect, useRef } from "react";

export function Receiver() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8080");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "receiver" }));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // --- ICE ---
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            ws.send(JSON.stringify({ type: "iceCandidate", candidate: e.candidate }));
          }
        };

        // --- Show sender's stream on remote video (NOT muted so audio plays) ---
        pc.ontrack = (e) => {
          if (remoteVideoRef.current) {
            if (!remoteVideoRef.current.srcObject) {
              remoteVideoRef.current.srcObject = new MediaStream();
            }
            (remoteVideoRef.current.srcObject as MediaStream).addTrack(e.track);
          }
        };

        // Set remote description first (offer from sender)
        await pc.setRemoteDescription({ type: "offer", sdp: message.sdp });

        // Capture receiver's own camera + mic for two-way call
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Add our tracks so sender receives receiver's video/audio
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Create answer (includes both sides' tracks)
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "createAnswer", sdp: pc.localDescription?.sdp }));

      } else if (message.type === "iceCandidate") {
        pcRef.current?.addIceCandidate(message.candidate);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <h2 style={{ color: "#fff", margin: 0 }}>Receiver</h2>
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
    </div>
  );
}