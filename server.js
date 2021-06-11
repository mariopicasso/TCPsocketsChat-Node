const { Server } = require("net");

const END = "END";
const host = "0.0.0.0"; //any ipv4 address (only ipv4)

const connections = new Map();

const error = (message) => {
    console.error(message);
    process.exit(1);
};

//send the message to everyone except the origin
const sendMessage = (message, origin) => {
    for(const socket of connections.keys()){
        if(socket !== origin){
            socket.write(message);
        }
    }
};

const listen = (port) => {
    const server = new Server();
    //when a client socket connect to this socket
    server.on("connection", (socket) => {
        const remoteSocket = socket.remoteAddress + ":" + socket.remotePort; // catch client id
        console.log(`New connection from ${remoteSocket}`);
        socket.setEncoding("utf-8"); //transform bytes to letters

        //recieves client data
        socket.on("data", (message) => {
            console.log(remoteSocket + " -> " + message);
            //first message of a user
            if (!connections.has(socket)) {
                console.log(
                    `Username ${message} set for connection ${remoteSocket}`
                );
                connections.set(socket, message);
            }

            //the user decide to end his connection
            else if (message === END) {
                connections.delete(socket);
                socket.end();
            } else {
                const fullMessage = `[${connections.get(socket)}]: ${message}`;
                console.log(`${remoteSocket} -> ${fullMessage}`);
                sendMessage(fullMessage, socket);
            }
        });

        socket.on("close", () =>
            console.log(remoteSocket + " ends his connection.")
        );

        socket.on("error", (err) => error(err.message));
    });

    // Start the server
    server.listen({ port, host }, () => {
        console.log("Listening on port 8000");
    });

    // Handle a server error. For example when a port is already used
    server.on("error", (err) => error(err.message));
};

//INIT: control arguments of the command line execution
const main = () => {
    if (process.argv.length !== 3) {
        error(`Usage: node ${__filename} port`);
    }
    let port = process.argv[2];
    if (isNaN(port)) {
        error(`Invalid port ${port}`);
    }
    port = Number(port);
    listen(port);
};

if (require.main === module) {
    // this module was run directly from the command line as in node xxx.js
    main();
}
