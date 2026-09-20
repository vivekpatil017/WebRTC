import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 8080
})

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws: WebSocket) {
    // ws.on("error", (e:Error)=>console.log(e));
    ws.on("message", function message(data: any){
        const message = JSON.parse(data);
        console.log(message)
        
    })
    ws.send("something");

})