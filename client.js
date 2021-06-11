const { Socket } = require("net");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

const error = (message) => {
    console.error(message);
    process.exit(1);
};

const END = "END";

const connect = (host, port) => {
    console.log(`Connecting to ${host}:${port}`);

    const socket = new Socket();
    //connect to the server socket
    socket.connect({ host, port });
    socket.setEncoding("utf-8");

    socket.on("connect", () => {
        console.log("Connected");

        //first time connected. Select the username and send to the server
        readline.question("Choose your username: ", (username) => {
            socket.write(username);
            console.log(`Type any message to send it, type ${END} to finish`);
        });

        //send the command line text to the server
        readline.on("line", (line) => {
            socket.write(line);
            if (line === END) {
                socket.end();
            }
        });

        socket.on('data', (data) => console.log(data))
    });


    //handle error on socket
    socket.on("error", (err) => error(err.message));

    //when the socket is closed the client expires
    socket.on("close", () => {
        console.log("Disconnected");
        process.exit(0);
    });
};

const main = () => {
    if (process.argv.length !== 4) {
        error(`Usage: node ${__filename} localhost port`);
    }
    let [, , host, port] = process.argv;
    if (isNaN(port)) {
        error(`Invalid port ${port}`);
    }
    port = Number(port);

    connect(host, port);
};

if (require.main === module) {
    // this module was run directly from the command line as in node xxx.js
    main();
}
