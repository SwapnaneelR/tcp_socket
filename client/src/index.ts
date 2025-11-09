import net from "net";
import readline from "readline";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let username = "";

const client = net.createConnection({ port: PORT }, () => console.log("Connected to server"));

client.on("data", (data) => {
  const msg = data.toString().trim();
  const [cmd, ...args] = msg.split(" "); 
  if (cmd.startsWith("LOGIN")) return; 
  if (cmd === "OK") return console.log(cmd);
  if (cmd === "ERR") return console.log(args.join(" "));

  if (cmd === "MSG") {
    const sender = args.shift();
    const text = args.join(" ");
    if (sender === username) return;
    console.log(`${sender}: ${text}`);
    return;
  }
  console.log(msg);
});

client.on("close", () => {
  console.log("Disconnected from server");
  process.exit(0);
});

client.on("error", (err) => console.error("Error:", err.message));

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("LOGIN ")) username = trimmed.split(" ")[1];
  client.write(trimmed + "\n");
});
