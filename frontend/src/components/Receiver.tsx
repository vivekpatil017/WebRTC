import { useState, useEffect } from "react";

export function Receiver() {

  const [Socket, setSocket] = useState<null | WebSocket>(null);

  useEffect(() => {
    const Socket = new WebSocket("ws://localhost:8080");
    setSocket(Socket);
    Socket.onopen = () => {
      Socket.send(JSON.stringify({
        type: "receiver"
      }))
    }

    Socket.onmessage = async (event) => {

      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        await pc.setRemoteDescription({ type: "offer", sdp: message.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        Socket.send(JSON.stringify({
          type: "createAnswer",
          sdp: pc.localDescription?.sdp
        }));
      }
    }
  }, []);

  return (
    <>
      receiver
    </>
  )
}