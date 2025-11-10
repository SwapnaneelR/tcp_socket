import dotenv from "dotenv";
dotenv.config();
import net from "net";
import readline from "readline";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let username = "";

const client = net.createConnection({ port: PORT }, () =>
  console.log("Connected to server")
);

let lastActivity = Date.now();
const IDLE_LIMIT = 60000;
const PING_INTERVAL = 15000;

const heartbeat = setInterval(() => {
  const idleTime = Date.now() - lastActivity;
  if (idleTime >= IDLE_LIMIT) {
    console.log("Disconnected due to inactivity.");
    client.end();
    clearInterval(heartbeat);
    process.exit(0);
  } else {
    client.write("PING\n");
  }
}, PING_INTERVAL);

client.on("data", (data) => {
  const msg = data.toString().trim();
  const [cmd, ...args] = msg.split(" ");

  if (cmd === "PONG") {
    lastActivity = Date.now();
    return;
  }

  if (cmd === "OK") {
    console.log("OK");
    lastActivity = Date.now();
    return;
  }
  if (cmd === "ERR") {
    console.log(msg);
    lastActivity = Date.now();
    return;
  }

  if (cmd === "MSG") {
    const sender = args.shift();
    const text = args.join(" ");
    if (sender === username) return;
    console.log(`MSG ${sender}: ${text}`);
    lastActivity = Date.now();
    return;
  }

  console.log(msg);
  lastActivity = Date.now();
});

client.on("close", () => {
  console.log("Disconnected from server");
  clearInterval(heartbeat);
  process.exit(0);
});

client.on("error", (err) => console.error("Error:", err.message));

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("LOGIN ")) username = trimmed.split(" ")[1];
  client.write(trimmed + "\n");
  lastActivity = Date.now();
  readline.moveCursor(process.stdout, 0, -1);
  readline.clearLine(process.stdout, 1);
});
