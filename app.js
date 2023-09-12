const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("./public"));

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'));

let data = {
    player1 : false,
    player2 : false
}
let game_ready = false;
app.get("/", (req, res) => {
    if (!data.player1) {
        res.render("index", {
            player: 1
        });
    } else if (!data.player2) {
        res.render("index", {
            player: 2
        });
    } else res.render("full");
});

const server = app.listen(port, () => {
    console.log(`listening to ${port}...`);
})

const io = require("socket.io")(server);
console.log("started....");

io.on("connection", socket => {
    console.log("someone joined.....with id : " + socket.id);
    if (!data.player1) {
        data.player1 = socket.id;
    } else data.player2 = socket.id;

    socket.on("disconnect", () => {
        if (data.player1==socket.id) { // player 1 left
            data.player1 = false;
            console.log(`player 1 left with socket id -> ${socket.id}`);
        } else {      // player 2 left
            data.player2 = false;
            console.log(`player 2 left with socket id -> ${socket.id}`);
        }
    });


    // --- game logic 
    socket.on("myCar",data=>{
        socket.broadcast.emit("updateCar",data);
    });
    socket.on("win",player=>{
        io.sockets.emit("restart_game",player);
    })

    socket.on("ready", () => {
        if(game_ready){   // anyopne player is ready
            if(!(game_ready==socket.id)){  // different player is clicking the ready
                game_ready= false;
                io.sockets.emit("game_start");
            }
        } else {
            game_ready=socket.id;
            socket.emit("wait");
        }
    });
});