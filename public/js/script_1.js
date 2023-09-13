// ****************************
// extension of script_3.js of car-racing-2 folder
// ******** front end all working and perfect ********


// getting out player cars as variable
const car1 = document.getElementById("car1");
const car2 = document.getElementById("car2");
const car2_img = document.getElementById("car2_img");
const car1_img = document.getElementById("car1_img");
const control_board = document.getElementById("control-board");
const controller = document.getElementById("controller");
const tyres = document.getElementById("tyres");
const player1_score = document.getElementById("player1_score");
const player2_score = document.getElementById("player2_score");
const start_btn = document.getElementById("start_btn");
const socket = io();

// --- for controller events ---
let state = {
    mousedown: false
}

// required game variables
// it should be a const variable to no one can change it at front end
let maxSpeed = 4;
let game_started = false;
let running_game;
let rounds_to_win = 3;

function set_intial_values(car,car_img) {

    // values for the movement
    car.vertical = 0;
    car.horizontal = 0;

    // values for completing a circle
    car.quadrant_completed = {
        first: false, second: false, third: false, fourth: false,
    }
    car.score = 0;
    player1_score.innerText=0;
    player2_score.innerText=0;

    car1.style.left = `${(window.innerWidth / 2) - 93}px`;
    car2.style.left = `${(window.innerWidth / 2) - 63}px`;
    car.style.top = `50%`;
    car_img.style.transform = `rotateZ(0deg)`;
}
set_intial_values(car1,car1_img);
set_intial_values(car2,car2_img);

// these above values wil be updated by window venet touch and socket.io
car1.player = 1;
car2.player = 2;

// ---- contoller and control_board stuff ---
control_board_coordinates = control_board.getBoundingClientRect();
let controller_coordinates = controller.getBoundingClientRect();
let range_overall = (control_board_coordinates.width / 2) - (controller_coordinates.width / 2);

// --- tyres ----
let tyres_coordinates = tyres.getBoundingClientRect();

// car controlled by front-end is assigned to main_car
// let main_car = car1;
if (main_car.player==1) {
    start_btn.classList += " player1";
    control_board.classList += " player1";
} else {
    start_btn.classList += " player2";
    control_board.classList += " player2";
}

// --- start logic ----
start_btn.addEventListener("click",(e)=>{
    socket.emit("ready");
});

let secondary_car;
if (main_car.player==1) {
    secondary_car=car2;
} else secondary_car = car1;

// --- game logic---
function gameEngine() {
    // ---- rotation of car img -----
    function rotateCar(car, car_img) {
        let ratio = car.horizontal / car.vertical;
        let radian = Math.atan(ratio);
        let deg = radian * (180 / Math.PI);
        // console.log(deg);
        if (car.vertical > 0) {
            car_img.style.transform = `rotateZ(${deg}deg)`;
        } else if (car.vertical < 0) {
            car_img.style.transform = `rotateZ(${deg + 180}deg)`;
        } else {
            car_img.style.transform = `rotateZ(${deg}deg)`;
        }
    }
    rotateCar(car1, car1_img);
    rotateCar(car2, car2_img);

    // ----- move car ---------
    function moveCar(car) {
        car.coordinates = car.getBoundingClientRect();

        // --- moving up 
        if (car.vertical > 0) {
            // --- if not reached to roof
            if (!(car.coordinates.y < 10)) {

                //if in x range of tyres 
                if (in_x_range_tyre(car, 0)) {

                    // if not in y range of  tyres
                    if (in_y_range_tyre(car, 0)) {

                        // means now car is going up in tyre box
                        // if car is upside of tyre box then it can go
                        if (in_upside_of_tyre(car)) {
                            car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                        }

                    } else {
                        car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                    }
                } else {
                    car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                }
            }
        }
        // moving down
        else {
            // if not reached bottom
            if (!(car.coordinates.y > (window.innerHeight - 40))) {

                // //if in x range of tyres 
                if (in_x_range_tyre(car, 0)) {

                    // if in y range of  tyres
                    if (in_y_range_tyre(car, 0)) {

                        // means now car is down in tyre box
                        // if car is downside of tyre box then it can go
                        if (!in_upside_of_tyre(car)) {
                            car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                        }

                    } else {
                        car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                    }
                } else {
                    car.style.top = `${car.coordinates.top - (car.vertical * maxSpeed)}px`;
                }
            }
        }


        // moving right
        if (car.horizontal > 0) {
            // if not reached right wall
            if (!(car.coordinates.x > (window.innerWidth - 36))) {

                // if car is the y range of tyre
                if (in_y_range_tyre(car, 8)) {

                    // if car is in x range of tyre
                    if (in_x_range_tyre(car, 4)) {

                        // and car is at the right side of tyres box
                        if (!in_left_of_tyre(car)) {
                            car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                        }
                    } else {
                        car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                    }

                } else {
                    car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                }
            }
        }

        // moving left
        else {
            // if not reached left wall
            if (!(car.coordinates.x < 10)) {

                // if car is in the y range of tyre
                if (in_y_range_tyre(car, 8)) {

                    // if car is in x range of tyre
                    if (in_x_range_tyre(car, 4)) {

                        // if car is at the left side of tyre box
                        if (in_left_of_tyre(car)) {
                            car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                        }
                    } else {
                        car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                    }

                } else {
                    car.style.left = `${car.coordinates.left + (car.horizontal * maxSpeed)}px`;
                }
            }
        }
    }
    moveCar(car1);
    moveCar(car2);

    // score will be updated on the basis of angle not leght or hitting the end ;ine
    // else u will keep hitting end line without competing circle nd keep getting score
    function score(car) {


        // --- car is above x axis ----
        if (in_upside_of_tyre(car)) {

            // car is in 1st quadrant
            if (in_left_of_tyre(car)) {
                if (car.quadrant_completed.fourth) { // came via fourth quadrant
                    car.score++;
                    car.quadrant_completed.fourth = false;
                    if (car.player == 1) {
                        player1_score.innerText = car.score;
                    } else player2_score.innerText = car.score;
                    if (car.score>(rounds_to_win-1)) {
                        socket.emit("win",car.player);
                    }
                }
                if (car.quadrant_completed.second) { // came via second quandrant
                    car.quadrant_completed.second = false;
                }
                car.quadrant_completed.first = true;
            }

            // car is in 2nd quadrant
            else {
                car.quadrant_completed.second = true;
                if (car.quadrant_completed.first) { // came vie first
                    car.quadrant_completed.first = false;
                }
                if (car.quadrant_completed.third) { // came vie third
                    car.quadrant_completed.third = false;
                }
            }
        }

        // ---- car is below x axis ---
        else {

            // car is in 4th quadrant
            if (in_left_of_tyre(car)) {
                if (car.quadrant_completed.third) { // came via third quadrant
                    car.quadrant_completed.third = false;
                    car.quadrant_completed.fourth = true;
                }
            }

            // car is in 3rd quadrant
            else {
                car.quadrant_completed.third = true;
                if (car.quadrant_completed.fourth) {  // came via fourth
                    car.quadrant_completed.fourth = false;
                }
                if (car.quadrant_completed.second) {  // came via second
                    car.quadrant_completed.second = false;
                }
            }
        }


    }
    score(car2);
    score(car1);

    if (game_started) {
        requestAnimationFrame(gameEngine);
    }
}


// -------- Touch and mouse events to trigger the values of horizontal and vertical of car 
window.addEventListener('mousedown', start);
window.addEventListener('mousemove', controller_fun);
window.addEventListener('mouseup', end);
window.addEventListener('touchstart', start);
window.addEventListener('touchmove', controller_fun);
window.addEventListener('touchend', end);

function start(event) {
    event.preventDefault();
    state.mousedown = true;

    controller_fun(event);
}
function end(event) {
    event.preventDefault();
    state.mousedown = false;
    // controller_fun(event);
    controller.style.left = `0px`;
    controller.style.top = `0px`;
    main_car.horizontal = 0;
    main_car.vertical = 0;

    socket.emit("myCar",{
        horizontal : 0,
        vertical : 0
    });
}


function controller_fun(event) {
    if (state.mousedown) {

        // --- x and y of touch ---
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        // ---- x and y of center of control_board 
        let offsetX = clientX - window.innerWidth / 2;
        let offsetY = clientY - control_board_coordinates.y - control_board_coordinates.height / 2;

        // 80 is the width of control_board and half of it is 40
        // 14 is the width of coller itself 
        // so movement range should be 40-14 = 26px
        let rangeX = offsetX / (control_board_coordinates.width / 2);
        let rangeY = offsetY / (control_board_coordinates.height / 2);
        if (rangeX > 1) rangeX = 1;
        if (rangeY > 1) rangeY = 1;
        if (rangeX < -1) rangeX = -1;
        if (rangeY < -1) rangeY = -1;
        controller.style.left = `${rangeX * range_overall}px`;
        controller.style.top = `${rangeY * range_overall}px`;

        main_car.horizontal = rangeX;
        main_car.vertical = -rangeY;

        if(game_started){
            socket.emit("myCar",{
                horizontal : main_car.horizontal,
                vertical : main_car.vertical
            });
        }
    }
}

// ======================
// == Helper Functions ==
// ======================
function in_x_range_tyre(car, margin) { // margin = 4 for horizontal and 0 for vertical
    return (car.coordinates.x > (tyres_coordinates.x - tyres_coordinates.width - margin) && car.coordinates.x < (tyres_coordinates.x + tyres_coordinates.width + margin));
}
function in_y_range_tyre(car, margin) { // margin = 8 for horizontal and 0 for vertical
    return (car.coordinates.y < (tyres_coordinates.y + tyres_coordinates.height - margin) && car.coordinates.y > (tyres_coordinates.y - car.coordinates.height + margin));
}
function in_left_of_tyre(car) { // return true if car is at left side of tyres
    return (car.coordinates.x < tyres_coordinates.x - (tyres_coordinates.width / 2));
}
function in_upside_of_tyre(car) { // return true if car is at left side of tyres
    return (car.coordinates.y < tyres_coordinates.y + (tyres_coordinates.height / 2));
}

socket.on("wait",()=>{
    start_btn.innerText = "Waiting for other player..."
})

socket.on("updateCar",data=>{
    secondary_car.horizontal = data.horizontal;
    secondary_car.vertical = data.vertical;
});

socket.on("game_start",game_start);
socket.on("restart_game",restart_game);


function game_start() {
    start_btn.style.display = "none";
    const timmer = document.getElementById("timmer");
    timmer.style.display = "inline";
    timmer.className = "timmer";
    game_started= true;
    setTimeout(() => {
        timmer.innerText = "2";
        setTimeout(() => {
            timmer.innerText = "1";
            setTimeout(() => {
                timmer.innerText = "start";
                setTimeout(() => {
                    setTimeout(() => {
                        timmer.style.display = "none";
                        timmer.className = "";
                        running_game = requestAnimationFrame(gameEngine);
                    }, 500);
                }, 500);
            }, 1000);
        }, 1000);
    }, 1000);
}

function restart_game(winner){
    cancelAnimationFrame(running_game);
    game_started = false;
    set_intial_values(car1,car1_img);
    set_intial_values(car2,car2_img);
    if (main_car.player==winner) {
        start_btn.innerText = "You Won !!! Click to play again";
    } else start_btn.innerText = "You Lost !!! Click to play again";
    start_btn.style.display = "block";
}

window.addEventListener("load",()=>{
    start_btn.style.display = 'inline-block';
})