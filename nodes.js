
let cursor_x = 0;
let cursor_y = 0;
//get canvas
let canvas = document.getElementById("node-canvas");
let canvas_height = document.documentElement.clientHeight;
let canvas_width = document.documentElement.clientWidth;
let ctx = canvas.getContext("2d");
let continue_animating = true;
let nodes = [];
let colour = "#34d8eb";
let number_of_nodes = 200;
let speed = 0.8;
let max_turn = 1/30;
let reaction_proximity = 100;
let connections = 7;
let modifier = 1;
let node;
let distance_to_cursor;
let previous_time_nodes;




function render_nodes() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    let width_change = canvas.width/canvas_width;
    let height_change = canvas.height/canvas_height;
    nodes.forEach(
        function (node){
            node.x *= width_change;
            node.y *= height_change;
        });
    canvas_width = canvas.width;
    canvas_height = canvas.height;
}

//report the mouse position on move
window.addEventListener("mousemove", function (evt) {
    let mousePos = getMousePos(canvas, evt);
    cursor_x = mousePos.x;
    cursor_y = mousePos.y;

}, false);



document.getElementById("node-count").onchange = function (){
    let node_count = parseInt(document.getElementById("node-count").value);
    console.log(node_count);
    if(node_count<=number_of_nodes){
        number_of_nodes = node_count;
        nodes = nodes.slice(0, number_of_nodes)
    }else{
        while(node_count > number_of_nodes){
            add_node();
        }
    }
    let connection_slider = document.getElementById("connection-count");
    connection_slider.max=number_of_nodes/10;
    if(connections>number_of_nodes/10){
        connections=number_of_nodes/10;
        connection_slider.value = number_of_nodes/10;
    }
}

document.getElementById("connection-count").onchange = function (){
    let connection_count = parseInt(document.getElementById("connection-count").value);
    if(connection_count <=(number_of_nodes/10)){
        connections = connection_count
    }
}

let node_speed_slider = document.getElementById("node-speed");
node_speed_slider.onchange = function (){
    speed = parseInt(node_speed_slider.value);
}
let node_straightness_slider = document.getElementById("node-path-straightness");
node_straightness_slider.onchange = function (){
    max_turn = ((1000-parseInt(node_straightness_slider.value))/1000.0);
}

function add_node (x = Math.random()*canvas.width, y=Math.random()*canvas.height){
    if(number_of_nodes < 1000) {
        number_of_nodes++;
        nodes.push(new Node(x, y, getRandomDirection()));
        document.getElementById("node-count").value = number_of_nodes;
    }
}

class Node{
    constructor(x, y, direction) {
        this._x = x;
        this._y = y;
        this._direction = direction;
        this._connections = [];
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get direction() {
        return this._direction;
    }
    set direction(value) {
        this._direction = value;
    }
    get connections(){
        return this._connections;
    }
    set connections(value){
        this._connections = value;
    }
}


//Get Mouse Position
function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getRandomDirection() {
    return Math.random() * 2 * Math.PI;
}

//draw


function draw_nodes(current_time_nodes){
    ctx.strokeStyle = colour;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(nodes.length < 1){
        for(let i = 0;i<number_of_nodes;i++){
            //nodes.push(new Node(0.5*canvas.width, 0.5*canvas.height, i*2 * Math.PI*(1/number_of_nodes)));
            nodes.push(new Node(Math.random()*canvas.width, Math.random()*canvas.height, getRandomDirection()));
        }
    }
    let node_delta_time = current_time_nodes - previous_time_nodes
    previous_time_nodes = current_time_nodes
    for(let n = 0;n<number_of_nodes;n++) {
        node = nodes[n];
        distance_to_cursor = Math.sqrt((node.x - cursor_x) ** 2 + (node.y - cursor_y) ** 2);
        if (distance_to_cursor > reaction_proximity) {
            let sign = Math.random() < 0.5 ? -1 : 1;
            node.direction = node.direction + (Math.random() * max_turn * Math.PI) * sign;
            modifier = 1;
        } else {
            if ((node.y === cursor_y) && (node.x === cursor_x)) {
                node.direction = getRandomDirection();
            } else {
                node.direction = Math.atan2((node.y - cursor_y), (node.x - cursor_x));
            }
            modifier = 2;
        }

        if (node.x > canvas.width || node.x < 0) {
            node.direction = Math.PI - node.direction;
            if(node.x < 0){
                node.x = 1;
            } else{
                node.x = canvas.width - 1;
            }
        }
        if (node.y > canvas.height || node.y < 0) {
            node.direction = 2 * Math.PI - node.direction;
            if(node.y < 0){
                node.y = 1;
            } else{
                node.y = canvas.height - 1;
            }
        }
        node.x = node.x + (modifier * speed * Math.cos(node.direction)*node_delta_time*0.1);
        node.y = node.y + (modifier * speed * Math.sin(node.direction)*node_delta_time*0.1);

        //draw the nodes (unnecessary if showing connections)
        // ctx.beginPath();
        // ctx.arc(node.x, node.y, 1, 0, 2 * Math.PI);
        // ctx.stroke();
        let distances = [];
        let distance;
        let other_node;
        for (let k = 0; k < number_of_nodes; k++) {
            if (k !== n) {
                other_node = nodes[k];
                distance = Math.sqrt((node.x - other_node.x) ** 2 + (node.y - other_node.y) ** 2);
                if (distances.length < connections || distance < distances[distances.length - 1][1]) {
                    distances.push([other_node, distance]);
                    distances.sort(function (a, b) {
                        return a[1] - b[1];
                    });
                    if (distances.length > connections) {
                        distances.pop();
                    }
                }
            }
        }
        node.connections = distances;

    }
    ctx.beginPath()
    for (let n=0;n<nodes.length;n++){
        let connected = nodes[n].connections;
        for(let c=0;c<connected.length;c++){
            ctx.moveTo(nodes[n].x, nodes[n].y);
            ctx.lineTo(connected[c][0].x, connected[c][0].y);
        }
    }
    ctx.stroke();
    if(continue_animating) {
        window.requestAnimationFrame(draw_nodes);
    }
}

function add_node_at_mouse(evt){
    let mousePos = getMousePos(canvas, evt);
    add_node(mousePos.x, mousePos.y);
}
function start_nodes(){
    continue_animating = true;
    document.getElementById("node-options-container").style.visibility = "visible";
    window.addEventListener("resize", function(){render_nodes();}, true);
    //add node on mouseclick
    window.addEventListener("mousedown", add_node_at_mouse, false);
    render_nodes();
    previous_time_nodes = performance.now();
    window.requestAnimationFrame(draw_nodes);
}
function stop_nodes(){
    continue_animating = false;
    document.getElementById("node-options-container").style.visibility = "hidden";

}
