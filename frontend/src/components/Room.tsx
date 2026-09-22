import { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Copy, Check, Wifi, MessageSquare, MonitorUp
} from "lucide-react";
import { motion } from "motion/react";
import WorldMap from "@/components/ui/world-map";
import { Liquid } from "@/components/ui/button-1";
import { VoiceChatDisclosure, type VoiceUser } from "@/components/ui/voice-chat-disclosure";

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
function PeerVideo({ stream, label, spanAll }: { stream: MediaStream | null; label: string; spanAll?: boolean }) {
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

  const initials = label ? label.slice(0, 2).toUpperCase() : "?";

  return (
    <div
      className="tile-in"
      style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        background: "#1e2435",
        gridColumn: spanAll ? "1 / -1" : "auto",
        height: "100%", width: "auto", maxWidth: "100%", aspectRatio: "4/3",
        border: "1.5px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* Avatar while connecting */}
      {!hasVideo && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          background: "linear-gradient(135deg, #1e2435 0%, #151a28 100%)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(59,130,246,0.3))",
            border: "2px solid rgba(99,102,241,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.5px",
          }}>
            {initials}
          </div>
          <span style={{
            color: "rgba(255,255,255,0.3)", fontSize: 12,
            fontWeight: 500, letterSpacing: "0.03em"
          }}>Connecting…</span>
        </div>
      )}

      {/* Actual video */}
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", display: "block",
          objectFit: "cover",
          opacity: hasVideo ? 1 : 0, transition: "opacity 0.5s ease",
        }}
      />

      {/* Bottom gradient overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Name + mic badge — bottom left */}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
          color: "#fff", fontSize: 12, fontWeight: 600,
          padding: "4px 10px 4px 8px", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Mic size={11} style={{ opacity: 0.75 }} />
          {label}
        </span>
      </div>

      {/* Mute icon — top right (simulated; peers don't broadcast mute state yet) */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
        borderRadius: 8, padding: "5px 6px", lineHeight: 0,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Mic size={13} style={{ opacity: 0.55, color: "#fff" }} />
      </div>
    </div>
  );
}

// ─── ControlButton ────────────────────────────────────────────────────────────
function CtrlBtn({
  onClick, active, danger, title, badge, children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  title?: string;
  badge?: string | number;
  children: React.ReactNode;
}) {
  const bg = danger
    ? "rgba(239,68,68,0.9)"
    : active
      ? "rgba(255,255,255,0.15)"
      : "rgba(255,255,255,0.08)";
  const border = danger
    ? "1.5px solid rgba(239,68,68,0.5)"
    : active
      ? "1.5px solid rgba(255,255,255,0.22)"
      : "1.5px solid rgba(255,255,255,0.1)";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        title={title}
        style={{
          width: 48, height: 48,
          borderRadius: "50%",
          background: bg,
          border,
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.18s, transform 0.12s, border-color 0.18s",
          backdropFilter: "blur(8px)",
          boxShadow: danger ? "0 0 16px rgba(239,68,68,0.35)" : "none",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = danger
            ? "rgba(239,68,68,1)"
            : "rgba(255,255,255,0.22)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = bg;
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {children}
      </button>
      {badge !== undefined && (
        <span style={{
          position: "absolute", top: -2, right: -2,
          background: "#ef4444", color: "#fff",
          fontSize: 10, fontWeight: 700,
          width: 18, height: 18, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #1a2035",
        }}>
          {typeof badge === 'number' && badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
  );
}

// ─── Room ─────────────────────────────────────────────────────────────────────
export function Room() {
  const [roomInput, setRoomInput] = useState("");
  const [userNameInput, setUserNameInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [peers, setPeers] = useState<{ userId: string; stream: MediaStream | null; userName: string }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: string, text: string, time: number, isMe?: boolean }[]>([]);
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
        return [...prev, { userId: remoteId, stream, userName: "Unknown" }];
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
    const name = userNameInput.trim();
    if (!id || !name) {
      setError("Please enter both a name and a room ID.");
      return;
    }
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

    const ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8080");
    socketRef.current = ws;
    ws.onopen = () => send({ type: "join", roomId: id, userId: userId.current, userName: name });

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "joined":
          setJoined(true);
          setPeers(msg.peers.map((p: any) => ({
            userId: typeof p === 'string' ? p : p.userId,
            userName: typeof p === 'string' ? "Unknown" : p.userName,
            stream: null
          })));
          break;
        case "peer-joined": {
          const remoteId: string = msg.userId;
          const remoteName: string = msg.userName;
          setToastMsg(`${remoteName || remoteId} joined`);
          setPeers(prev => [...prev, { userId: remoteId, userName: remoteName, stream: null }]);
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
          const leftPeer = peers.find(p => p.userId === msg.userId);
          setToastMsg(`${leftPeer?.userName || msg.userId} left`);
          removePC(msg.userId);
          break;
        case "chat": {
          // If we receive a message from a peer, use their display name
          const peerName = peers.find(p => p.userId === msg.from)?.userName || msg.from;
          setMessages(prev => [...prev, { from: peerName, text: msg.text, time: msg.time, isMe: false }]);
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
    setMessages(prev => [...prev, { from: userNameInput || "You", text, time: msg.time, isMe: true }]);
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
              Enter your name and the room ID to join.
            </p>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={userNameInput}
              onChange={e => setUserNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && joinRoom()}
              placeholder="Your Name…"
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
            <input
              value={roomInput}
              onChange={e => setRoomInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && joinRoom()}
              placeholder="Room ID…"
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
    <div style={{
      height: "100vh", overflow: "hidden",
      background: "linear-gradient(160deg, #141927 0%, #0e1420 50%, #0a1018 100%)",
      display: "flex", flexDirection: "column", position: "relative",
    }}>

      {/* Toast notification */}
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
        background: "rgba(10,16,24,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        {/* Left: logo + room name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          <span style={{
            color: "#fff", fontWeight: 700, fontSize: 15,
            letterSpacing: "-0.01em",
          }}>
            {roomId.current}
          </span>
          <button
            onClick={copyRoomId}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.3)", padding: 4, lineHeight: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            title="Copy room ID"
          >
            {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative", overflow: "hidden" }}>
        {/* ── Video Grid ── */}
        <main style={{
          flex: 1, padding: "12px 12px 0 12px",
          paddingRight: chatOpen ? 340 + 12 : 12,
          transition: "padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, auto))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: 10, flex: 1, minHeight: 0,
            alignItems: "center",
            justifyItems: "center",
            justifyContent: "center",
          }}>
            {/* Local tile */}
            <div
              className="tile-in"
              style={{
                position: "relative", borderRadius: 14, overflow: "hidden",
                background: "#1e2435",
                height: "100%", width: "auto", maxWidth: "100%", aspectRatio: "4/3",
                border: "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay muted playsInline
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", display: "block",
                  objectFit: "cover",
                  opacity: camOn ? 1 : 0, transition: "opacity 0.3s",
                }}
              />

              {/* Camera-off avatar */}
              {!camOn && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 10,
                  background: "linear-gradient(135deg, #1e2435 0%, #151a28 100%)",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(59,130,246,0.3))",
                    border: "2px solid rgba(99,102,241,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)",
                  }}>
                    {userNameInput.slice(0, 2).toUpperCase() || "ME"}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500 }}>Camera off</span>
                </div>
              )}

              {/* Bottom gradient */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              {/* Name badge bottom-left */}
              <div style={{
                position: "absolute", bottom: 10, left: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
                  color: "#fff", fontSize: 12, fontWeight: 600,
                  padding: "4px 10px 4px 8px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Mic size={11} style={{ opacity: micOn ? 0.8 : 0.3, color: micOn ? "#4ade80" : "#fff" }} />
                  {userNameInput || "You"}
                </span>
              </div>

              {/* Mute badge top-right */}
              {!micOn && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(220,38,38,0.85)", backdropFilter: "blur(8px)",
                  borderRadius: 8, padding: "5px 6px", lineHeight: 0,
                  border: "1px solid rgba(255,100,100,0.3)",
                }}>
                  <MicOff size={13} color="#fff" />
                </div>
              )}
            </div>

            {/* Remote peers */}
            {peers.map((peer, i) => (
              <PeerVideo 
                key={peer.userId} 
                stream={peer.stream} 
                label={peer.userName || peer.userId} 
                spanAll={total === 3 && i === peers.length - 1}
              />
            ))}
          </div>


        </main>

        {/* ── Chat Sidebar ── */}
        <div style={{
          position: "absolute", top: 0, right: chatOpen ? 0 : -340,
          width: 340, height: "100%",
          background: "linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(8,11,20,0.98) 100%)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transition: "right 0.35s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 50,
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 14px rgba(79,70,229,0.4)",
              }}>
                <MessageSquare size={15} color="#fff" />
              </div>
              <div>
                <h3 style={{ color: "#fff", margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Room Chat</h3>
                <p style={{ color: "rgba(255,255,255,0.35)", margin: 0, fontSize: 11, fontWeight: 500 }}>
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.5)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              ✕
            </button>
          </div>

          {/* Messages area */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: 10,
            scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}>
            {messages.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", gap: 12,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(79,70,229,0.12)",
                  border: "1px solid rgba(79,70,229,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageSquare size={22} color="rgba(99,102,241,0.7)" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 4px", fontWeight: 600 }}>No messages yet</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>Say hello to the room! 👋</p>
                </div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isMe = m.isMe ?? false;
                const showSender = i === 0 || messages[i - 1].from !== m.from;
                return (
                  <div key={i} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 3 }}>
                    {showSender && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        flexDirection: isMe ? "row-reverse" : "row",
                        marginBottom: 2,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isMe ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.5)" }}>
                          {m.from}
                        </span>
                      </div>
                    )}
                    <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 3 }}>
                      <div style={{
                        background: isMe
                          ? "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)"
                          : "rgba(255,255,255,0.07)",
                        padding: "9px 13px",
                        borderRadius: 16,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                        color: "#fff", fontSize: 13, lineHeight: 1.55,
                        wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-wrap",
                        border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: isMe ? "0 4px 16px rgba(79,70,229,0.3)" : "none",
                      }}>
                        {m.text}
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", padding: "0 4px" }}>
                        {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={sendMessage} style={{
            padding: "12px 14px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
            display: "flex", gap: 8, alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Message the room…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 22, padding: "10px 16px",
                  color: "#fff", fontSize: 13, outline: "none",
                  transition: "border-color 0.2s, background 0.2s",
                  caretColor: "#6366f1",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              />
            </div>
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                background: chatInput.trim() ? "linear-gradient(135deg, #4f46e5, #2563eb)" : "rgba(255,255,255,0.07)",
                color: "#fff", border: "none", borderRadius: "50%",
                width: 40, height: 40, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: chatInput.trim() ? "pointer" : "default",
                opacity: chatInput.trim() ? 1 : 0.4,
                transition: "all 0.2s",
                boxShadow: chatInput.trim() ? "0 4px 14px rgba(79,70,229,0.4)" : "none",
              }}
              onMouseEnter={e => { if (chatInput.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

      </div>

      {/* ── VoiceChatDisclosure — bottom right, above footer ── */}
      <div style={{
        position: "absolute", bottom: 120, right: chatOpen ? 340 + 16 : 16,
        zIndex: 55, transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <VoiceChatDisclosure
          title="Participants"
          users={[
            { id: "me", name: userNameInput || "You", active: micOn },
            ...peers.map(p => ({ id: p.userId, name: p.userName || p.userId, active: true } as VoiceUser)),
          ]}
        />
      </div>

      {/* ── Controls bar ── */}
      <footer style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "14px 0 18px",
        background: "rgba(10,16,24,0.85)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        position: "relative", zIndex: 60,
        gap: 0,
      }}>
        {/* Pill container */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 40, padding: "6px 12px",
          backdropFilter: "blur(16px)",
        }}>
          <CtrlBtn onClick={toggleMic} active={micOn} title={micOn ? "Mute mic" : "Unmute mic"}>
            {micOn ? <Mic size={19} /> : <MicOff size={19} color="#f87171" />}
          </CtrlBtn>

          <CtrlBtn onClick={toggleCam} active={camOn} title={camOn ? "Turn off camera" : "Turn on camera"}>
            {camOn ? <Video size={19} /> : <VideoOff size={19} color="#f87171" />}
          </CtrlBtn>

          <CtrlBtn onClick={toggleScreenShare} active={screenOn} title={screenOn ? "Stop sharing" : "Share screen"}>
            <MonitorUp size={19} />
          </CtrlBtn>

          <CtrlBtn
            onClick={toggleChat}
            active={chatOpen}
            title="Toggle chat"
            badge={!chatOpen && unread > 0 ? unread : undefined}
          >
            <MessageSquare size={19} />
          </CtrlBtn>

          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

          <CtrlBtn onClick={leaveRoom} danger title="Leave room">
            <PhoneOff size={19} />
          </CtrlBtn>
        </div>
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

