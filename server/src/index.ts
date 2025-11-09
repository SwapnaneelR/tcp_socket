import dotenv from "dotenv";
dotenv.config();
import net from "net";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const clients = new Map<net.Socket, string>();

const server = net.createServer((socket) => {
    socket.write("Welcome! Please log in with: LOGIN <username>\n");


  socket.on("data", (data) => {
    const msg = data.toString().trim();
    const [cmd, ...args] = msg.split(" ");
    const username = clients.get(socket);

    if (!username) {
      if (cmd === "LOGIN") {
        const name = args[0];
        if ([...clients.values()].includes(name)) {
          socket.write("ERR username-taken\n");
          return;
        }
        clients.set(socket, name);
        socket.write("OK\n");
        broadcast(`INFO ${name} joined\n`, socket);
      }
      else {
        socket.write("Please login \n!")
      }
      return;
    }

    if (cmd === "MSG") {
      const text = args.join(" ");
      broadcast(`MSG ${username} ${text}\n`, socket);
    } else if (cmd === "WHO") {
      clients.forEach((u) => socket.write(`USER ${u}\n`));
    }
  });

  socket.on("close", () => {
    const name = clients.get(socket);
    if (name) {
      clients.delete(socket);
      broadcast(`INFO ${name} disconnected\n`);
    }
  });

  socket.on("error", () => socket.destroy());
});

function broadcast(message: string, except?: net.Socket) {
  for (const [client] of clients) {
    if (client !== except) client.write(message);
  }
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
