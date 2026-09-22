import FlowArt, { FlowSection } from '@/components/ui/story-scroll';

export function AboutSection() {
  return (
    <div id="about-section">
      <FlowArt aria-label="WebRTC Platform Overview">

      {/* ── 01 What is this ───────────────────────────────────────── */}
      <FlowSection
        aria-label="What is this platform"
        style={{ backgroundColor: '#0a0a0a', color: '#fff' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">01 — What is this</p>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div>
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Connect
            <br />
            Without
            <br />
            Servers
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed text-white/70">
          A fully browser-native video calling platform built on the WebRTC standard. No downloads,
          no accounts, no intermediaries — just a room ID between you and the people you want to connect with.
        </p>
      </FlowSection>

      {/* ── 02 HD Video — image ────────────────────────────────────── */}
      <FlowSection
        aria-label="HD Video Calls"
        style={{ backgroundColor: '#111118', color: '#fff' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">02 — HD Video Calls</p>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[4vw] items-start">
          <div className="flex-1">
            <h2 className="text-[clamp(3.5rem,10vw,11rem)] font-bold leading-[0.85] uppercase tracking-tight">
              See
              <br />
              Every
              <br />
              Detail
            </h2>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 self-center">
            <video
              src="/see_this_bro_i_want_that_ui_ex.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block object-cover"
            />
          </div>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-wrap gap-[3vw]">
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Crystal clear</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Up to 1080p video streamed directly between peers with no re-encoding overhead.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Up to 5 people</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Host standups, interviews, or casual catch-ups with up to 5 participants.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Adaptive quality</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              WebRTC automatically adjusts bitrate to keep calls smooth on any connection.
            </p>
          </div>
        </div>
      </FlowSection>

      {/* ── 03 P2P encryption — image ──────────────────────────────── */}
      <FlowSection
        aria-label="Peer to peer and encrypted"
        style={{ backgroundColor: '#04040f', color: '#fff' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">03 — Peer-to-Peer</p>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-[4vw] items-start">
          <div className="flex-1">
            <h2 className="text-[clamp(3.5rem,10vw,11rem)] font-bold leading-[0.85] uppercase tracking-tight">
              Direct.
              <br />
              Private.
              <br />
              Fast.
            </h2>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 self-center">
            <video
              src="/prooject%20stuff.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block object-cover"
            />
          </div>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-wrap gap-[3vw]">
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">No middlemen</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Your audio and video never touch our servers. Connections go browser-to-browser.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">DTLS / SRTP</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              All media is end-to-end encrypted by the WebRTC spec — not optional, mandatory.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Sub-100ms latency</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Direct paths between peers cut out relay hops for near-instant communication.
            </p>
          </div>
        </div>
      </FlowSection>

      {/* ── 04 Chat & Screen share — image ────────────────────────── */}
      <FlowSection
        aria-label="Chat and screen sharing"
        style={{ backgroundColor: '#080814', color: '#fff' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">04 — Collaborate</p>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[4vw] items-start">
          <div className="flex-1">
            <h2 className="text-[clamp(3.5rem,10vw,11rem)] font-bold leading-[0.85] uppercase tracking-tight">
              Chat.
              <br />
              Share.
              <br />
              Present.
            </h2>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 self-center">
            <img
              src="/team-sync.png"
              alt="Live chat sidebar alongside screen sharing in a video call"
              className="w-full h-auto block object-cover"
            />
          </div>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-wrap gap-[3vw]">
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Live chat</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Slide open the chat panel mid-call. Messages stay scoped to your room.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Screen sharing</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Share your full screen or any window with a single click. Built right in.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">Mic & camera controls</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Mute, disable camera, or toggle screen share on the fly from the controls bar.
            </p>
          </div>
        </div>
      </FlowSection>

      {/* ── 05 Get started ────────────────────────────────────────── */}
      <FlowSection
        aria-label="Get started"
        style={{ backgroundColor: '#000', color: '#fff' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">05 — Get started</p>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div>
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Ready
            <br />
            To
            <br />
            Call?
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="flex flex-wrap gap-[3vw]">
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">01 — Pick a room ID</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Any string works — a name, a number, a random phrase. No registration needed.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">02 — Share it</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Send the room ID to whoever you want to join. They open the link and enter.
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider">03 — You're live</p>
            <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
              Camera on, mic open, connection direct. No install. No waiting. Under 10 seconds.
            </p>
          </div>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/10" />
        <div className="mt-auto flex justify-between items-end w-full gap-4">
          <p className="max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed text-white/70">
            Open source · No data stored · Browser-native WebRTC · End-to-end encrypted
          </p>
          <img 
            src="/vivek%20logo.jpeg" 
            alt="Vivek Logo" 
            className="w-24 md:w-40 lg:w-48 h-auto object-contain rounded-md" 
          />
        </div>
      </FlowSection>

    </FlowArt>
    </div>
  );
}
