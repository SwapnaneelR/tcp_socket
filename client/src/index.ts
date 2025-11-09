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

client.on("data", (data) => {
  const msg = data.toString().trim();
  const [cmd, ...args] = msg.split(" ");
  if (cmd === "OK") {
    console.log("OK");
    return;
  }
  if (cmd === "ERR") {
    console.log(msg);
    return;
  }

  if (cmd === "MSG") {
    const sender = args.shift();
    const text = args.join(" ");
    if (sender === username) return;
    console.log(`MSG ${sender}: ${text}`);
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
  if (trimmed.startsWith("LOGIN "))
    username = trimmed.split(" ")[1];
  client.write(trimmed + "\n");
  /*
      The input gets printed again if the following is not added .
  */
  readline.moveCursor(process.stdout, 0, -1);  
  readline.clearLine(process.stdout, 1);
});