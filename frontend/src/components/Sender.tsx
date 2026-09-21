import { useState, useEffect } from "react";

export function Sender() {

  const [Socket, setSocket] = useState<null | WebSocket>(null);

  useEffect(() => {
    const Socket = new WebSocket("ws://localhost:8080");
    setSocket(Socket);
    Socket.onopen = () => {
      Socket.send(JSON.stringify({
        type: "sender"
      }))
    }
  }, []);


  async function startVideo() {
    if (!Socket) {
      return;
    }

    const pc = new RTCPeerConnection()

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    Socket?.send(JSON.stringify({
      type: "createOffer",
      sdp: pc.localDescription?.sdp
    }));

    Socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
      }

    }

  }


  return (
    <>
      sender
      <button onClick={startVideo}>send video</button>
    </>
  )
}