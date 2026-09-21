import { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Users, Copy, Check, Wifi, MessageSquare, MonitorUp
} from "lucide-react";
import { motion } from "motion/react";
import WorldMap from "@/components/ui/world-map";
import { Liquid } from "@/components/ui/button-1";

const COLORS = {
  color1: '#FFFFFF',
  color2: '#1E10C5',
  color3: '#9089E2',
  color4: '#FCFCFE',
  color5: '#F9F9FD',
  color6: '#B2B8E7',
  color7: '#0E2DCB',
  color8: '#0017E9',
  color9: '#4743EF',
  color10: '#7D7BF4',
  color11: '#0B06FC',
  color12: '#C5C1EA',
  color13: '#1403DE',
  color14: '#B6BAF6',
  color15: '#C1BEEB',
  color16: '#290ECB',
  color17: '#3F4CC0',
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exit = setTimeout(() => setLeaving(true), 2600);
    const done = setTimeout(onDone, 3000);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={leaving ? "toast-out" : "toast-in"}
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        background: "rgba(30,30,30,0.92)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff", padding: "10px 16px", borderRadius: 12,
        fontSize: 13, fontWeight: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", gap: 8,
      }}
    >
      <Wifi size={14} style={{ opacity: 0.6 }} />
      {message}
    </div>
  );
}

// ─── PeerVideo ────────────────────────────────────────────────────────────────
function PeerVideo({ stream, label }: { stream: MediaStream | null; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream;
    setHasVideo(false);
    if (stream) {
      ref.current.onloadedmetadata = () => setHasVideo(true);
    }
  }, [stream]);

  const initials = label.slice(0, 2).toUpperCase();

  return (
    <div
      className="tile-in pulse-ring"
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        background: "#111", width: "100%", height: "100%",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Shimmer skeleton while connecting */}
      {!hasVideo && (
        <div
          className="shimmer-bg"
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.3)",
          }}>
            {initials}
          </div>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Connecting…</span>
        </div>
      )}

      {/* Actual video */}
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: hasVideo ? 1 : 0, transition: "opacity 0.4s ease",
        }}
      />

      {/* Name badge */}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
        color: "#fff", fontSize: 11, fontWeight: 500,
        padding: "4px 10px", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {label}
      </div>

      {/* Hover ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 16,
        border: "1px solid rgba(255,255,255,0)",
        transition: "border-color 0.3s",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── ControlButton ────────────────────────────────────────────────────────────
function CtrlBtn({
  onClick, active, danger, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const cls = danger ? "ctrl-btn leave" : active ? "ctrl-btn on" : "ctrl-btn off";
  return (
    <button className={cls} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

// ─── Room ─────────────────────────────────────────────────────────────────────
export function Room() {
  const [roomInput, setRoomInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [peers, setPeers] = useState<{ userId: string; stream: MediaStream | null }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{from: string, text: string, time: number}[]>([]);
  const [unread, setUnread] = useState(0);
  const [screenOn, setScreenOn] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const userId = useRef("user-" + Math.random().toString(36).slice(2, 7));
  const roomId = useRef("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pcMap = useRef<Map<string, RTCPeerConnection>>(new Map());
  const icePending = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Attach local stream to video element once joined
  useEffect(() => {
    if (joined && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [joined]);

  // ── helpers ──────────────────────────────────────────────────────────────

  function send(obj: object) {
    socketRef.current?.send(JSON.stringify(obj));
  }

  async function flushICE(remoteId: string, pc: RTCPeerConnection) {
    for (const c of icePending.current.get(remoteId) ?? []) await pc.addIceCandidate(c);
    icePending.current.delete(remoteId);
  }

  function getPC(remoteId: string): RTCPeerConnection {
    if (pcMap.current.has(remoteId)) return pcMap.current.get(remoteId)!;
    const pc = new RTCPeerConnection(ICE_CONFIG);

    localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));

    pc.onicecandidate = (e) => {
      if (e.candidate) send({ type: "ice-candidate", to: remoteId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      setPeers(prev => {
        const found = prev.find(p => p.userId === remoteId);
        if (found) return found.stream ? prev : prev.map(p => p.userId === remoteId ? { ...p, stream } : p);
        return [...prev, { userId: remoteId, stream }];
      });
    };

    pcMap.current.set(remoteId, pc);
    return pc;
  }

  function removePC(remoteId: string) {
    pcMap.current.get(remoteId)?.close();
    pcMap.current.delete(remoteId);
    icePending.current.delete(remoteId);
    setPeers(prev => prev.filter(p => p.userId !== remoteId));
  }

  // ── join ─────────────────────────────────────────────────────────────────

  async function joinRoom() {
    const id = roomInput.trim();
    if (!id) return;
    setError("");
    roomId.current = id;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch {
      setError("Camera/mic permission denied. Please allow and try again.");
      return;
    }

    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;
    ws.onopen = () => send({ type: "join", roomId: id, userId: userId.current });

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "joined":
          setJoined(true);
          setPeers(msg.peers.map((uid: string) => ({ userId: uid, stream: null })));
          break;
        case "peer-joined": {
          const remoteId: string = msg.userId;
          setToastMsg(`${remoteId} joined`);
          setPeers(prev => [...prev, { userId: remoteId, stream: null }]);
          const pc = getPC(remoteId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ type: "offer", to: remoteId, sdp: pc.localDescription?.sdp });
          break;
        }
        case "offer": {
          const { from, sdp } = msg;
          const pc = getPC(from);
          await pc.setRemoteDescription({ type: "offer", sdp });
          await flushICE(from, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send({ type: "answer", to: from, sdp: pc.localDescription?.sdp });
          break;
        }
        case "answer": {
          const pc = pcMap.current.get(msg.from);
          if (pc) { await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp }); await flushICE(msg.from, pc); }
          break;
        }
        case "ice-candidate": {
          const { from, candidate } = msg;
          const pc = pcMap.current.get(from);
          if (pc && pc.remoteDescription) { await pc.addIceCandidate(candidate); }
          else { const q = icePending.current.get(from) ?? []; q.push(candidate); icePending.current.set(from, q); }
          break;
        }
        case "peer-left":
          setToastMsg(`${msg.userId} left`);
          removePC(msg.userId);
          break;
        case "chat": {
          setMessages(prev => [...prev, { from: msg.from, text: msg.text, time: msg.time }]);
          if (!chatOpen) setUnread(u => u + 1);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          break;
        }
        case "error":
          setError(msg.message);
          break;
      }
    };

    ws.onclose = () => { if (joined) setError("Disconnected from server."); };
  }

  // ── controls ─────────────────────────────────────────────────────────────

  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  }
  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  }

  async function toggleScreenShare() {
    if (screenOn && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setScreenOn(false);
      // Restore camera track
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        pcMap.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];
        setScreenOn(true);

        screenTrack.onended = () => {
          toggleScreenShare(); // revert when stopped via browser UI
        };

        pcMap.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Screen share failed", err);
      }
    }
  }

  function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const msg = { type: "chat", text, time: Date.now() };
    send(msg);
    setMessages(prev => [...prev, { from: "You", text, time: msg.time }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function toggleChat() {
    setChatOpen(!chatOpen);
    if (!chatOpen) setUnread(0);
  }

  function leaveRoom() {
    pcMap.current.forEach(pc => pc.close());
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.close();
    setPeers([]); setJoined(false); roomId.current = "";
  }
  function copyRoomId() {
    navigator.clipboard.writeText(roomId.current);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    return () => {
      pcMap.current.forEach(pc => pc.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socketRef.current?.close();
    };
  }, []);

  // ── join screen ───────────────────────────────────────────────────────────

  if (!joined) {
    return (
      <div style={{
        minHeight: "100vh", background: "#000",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>

        <div style={{
          position: "absolute", top: "20%", left: "30%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          animation: "pulseRing 3s infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
          animation: "pulseRing 4s infinite 1.5s",
          pointerEvents: "none",
        }} />

        {/* World Map on top */}
        <div style={{ width: "100%", maxWidth: "1000px", padding: "20px 0" }}>
          <WorldMap
            dots={[
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } },
              { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
              { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } },
            ]}
          />
        </div>

        <div className="join-fade" style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 20, width: "100%", maxWidth: 360, padding: "0 24px",
          position: "relative", zIndex: 10
        }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 4,
          }}>
            <Video size={28} color="rgba(255,255,255,0.7)" />
          </div>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
              Join a Room
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
              Your ID: <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{userId.current}</span>
            </p>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={roomInput}
              onChange={e => setRoomInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && joinRoom()}
              placeholder="Enter room ID…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", borderRadius: 12, padding: "13px 16px",
                fontSize: 14, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
            <button
              onClick={joinRoom}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative inline-block w-full h-[3.5em] group dark:bg-black bg-white dark:border-white border-black border-2 rounded-lg cursor-pointer transition-transform active:scale-95"
            >
              <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70">
                <span className="absolute inset-0 rounded-lg bg-[#d9d9d9] filter blur-[6.5px]"></span>
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Liquid isHovered={isHovered} colors={COLORS} />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-lg bg-[#010128] filter blur-[7.3px]"></div>
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <span className="absolute inset-0 rounded-lg bg-[#d9d9d9]"></span>
                <span className="absolute inset-0 rounded-lg bg-black"></span>
                <Liquid isHovered={isHovered} colors={COLORS} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`absolute inset-0 rounded-lg border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'}`}
                  ></span>
                ))}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg filter blur-[15px] bg-[#006]"></span>
              </div>
              <span className="absolute inset-0 flex items-center justify-center rounded-lg group-hover:text-yellow-400 text-white text-[15px] font-semibold tracking-wide z-10 pointer-events-none">
                Join
              </span>
            </button>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0, textAlign: "center" }}>{error}</p>
          )}
        </div>

        {/* Remote Connectivity Text section */}
        <div style={{ width: "100%", marginTop: "40px", position: "relative", zIndex: 10 }}>
          <RemoteConnectivityText />
        </div>
      </div>
    );
  }

  // ── room screen ───────────────────────────────────────────────────────────

  const total = peers.length + 1;
  const cols = total === 1 ? 1 : total === 2 ? 2 : total <= 4 ? 2 : 3;
  const rows = Math.ceil(total / cols);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#0a0a0a", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Toast notification */}
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Live indicator */}
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 6px #22c55e", flexShrink: 0,
          }} className="pulse-ring" />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{roomId.current}</span>
          <button
            onClick={copyRoomId}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.35)", padding: 4, lineHeight: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            title="Copy room ID"
          >
            {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.45)", fontSize: 13,
        }}>
          <Users size={14} />
          <span>{total} / 5</span>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative", overflow: "hidden" }}>
        {/* ── Video Grid ── */}
      <main style={{
        flex: 1, padding: 16,
        paddingRight: chatOpen ? 320 + 16 : 16,
        transition: "padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 12, flex: 1, minHeight: 0
        }}>
          {/* Local tile */}
          <div
            className="tile-in"
            style={{
              position: "relative", borderRadius: 16, overflow: "hidden",
              background: "#111", width: "100%", height: "100%",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay muted playsInline
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                opacity: camOn ? 1 : 0, transition: "opacity 0.3s",
              }}
            />

            {/* Camera-off avatar */}
            {!camOn && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.4)",
                }}>
                  {userId.current.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Camera off</span>
              </div>
            )}

            {/* Badges */}
            <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{
                background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
                color: "#fff", fontSize: 11, fontWeight: 500,
                padding: "4px 10px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                You · {userId.current}
              </span>
              {!micOn && (
                <span style={{
                  background: "rgba(220,38,38,0.8)", backdropFilter: "blur(8px)",
                  padding: "4px 6px", borderRadius: 8, lineHeight: 0,
                }}>
                  <MicOff size={11} color="#fff" />
                </span>
              )}
            </div>
          </div>

          {/* Remote peers */}
          {peers.map(peer => (
            <PeerVideo key={peer.userId} stream={peer.stream} label={peer.userId} />
          ))}
        </div>

        {/* Waiting state */}
        {peers.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 14, marginTop: 32,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="dot-bounce"
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    animationDelay: `${delay}ms`,
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
              Waiting for others… share room ID:{" "}
              <span style={{ color: "rgba(255,255,255,0.65)", fontFamily: "monospace" }}>
                {roomId.current}
              </span>
            </p>
          </div>
        )}
      </main>

      {/* ── Chat Sidebar ── */}
      <div style={{
        position: "absolute", top: 0, right: chatOpen ? 0 : -320,
        width: 320, height: "100%", background: "rgba(20,20,20,0.95)",
        backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,255,255,0.08)",
        transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 50,
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ color: "#fff", margin: 0, fontSize: 16, fontWeight: 600 }}>Room Chat</h3>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", fontSize: 13, marginTop: 40 }}>
              No messages yet.<br/>Say hello!
            </p>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === "You" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, textAlign: m.from === "You" ? "right" : "left" }}>
                  {m.from} · {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{
                  background: m.from === "You" ? "#2563eb" : "rgba(255,255,255,0.1)",
                  padding: "8px 12px", borderRadius: 12, color: "#fff", fontSize: 13, lineHeight: 1.4,
                  borderBottomRightRadius: m.from === "You" ? 4 : 12,
                  borderBottomLeftRadius: m.from !== "You" ? 4 : 12,
                  wordBreak: "break-word"
                }}>
                  {m.text}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendMessage} style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type a message…"
            style={{
              flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "8px 14px", color: "#fff", fontSize: 13, outline: "none"
            }}
          />
          <button type="submit" disabled={!chatInput.trim()} style={{
            background: chatInput.trim() ? "#2563eb" : "rgba(255,255,255,0.1)", color: "#fff",
            border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: chatInput.trim() ? "pointer" : "default",
            opacity: chatInput.trim() ? 1 : 0.5, transition: "background 0.2s"
          }}>
            ↑
          </button>
        </form>
      </div>
      </div>

      {/* ── Controls bar ── */}
      <footer style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "16px 0",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
        position: "relative", zIndex: 60
      }}>
        <CtrlBtn onClick={toggleMic} active={micOn} title={micOn ? "Mute mic" : "Unmute mic"}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </CtrlBtn>

        <CtrlBtn onClick={toggleCam} active={camOn} title={camOn ? "Turn off camera" : "Turn on camera"}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </CtrlBtn>

        <CtrlBtn onClick={toggleScreenShare} active={screenOn} title={screenOn ? "Stop sharing" : "Share screen"}>
          <MonitorUp size={20} />
        </CtrlBtn>

        <div style={{ position: "relative" }}>
          <CtrlBtn onClick={toggleChat} active={chatOpen} title="Toggle chat">
            <MessageSquare size={20} />
          </CtrlBtn>
          {unread > 0 && !chatOpen && (
            <span style={{
              position: "absolute", top: -2, right: -2, background: "#ef4444", color: "#fff",
              fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #000"
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>

        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

        <CtrlBtn onClick={leaveRoom} danger title="Leave room">
          <PhoneOff size={20} />
        </CtrlBtn>
      </footer>
    </div>
  );
}

export function RemoteConnectivityText() {
  return (
    <div className="py-8 w-full">
      <div className="max-w-7xl mx-auto text-center px-4">
        <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
          Remote{" "}
          <span className="text-neutral-400">
            {"Connectivity".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
          Break free from traditional boundaries. Work from anywhere, at the
          comfort of your own studio apartment. Perfect for Nomads and
          Travellers.
        </p>
      </div>
    </div>
  );
}

