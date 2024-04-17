
let flock_canvas = document.getElementById("flock-canvas");
let flock_canvas_height = document.documentElement.clientHeight;
let flock_canvas_width = document.documentElement.clientWidth;
let birds = [];

function render() {
    flock_canvas.width = document.documentElement.clientWidth;
    flock_canvas.height = document.documentElement.clientHeight;
    let width_change = flock_canvas.width/flock_canvas_width;
    let height_change = flock_canvas.height/flock_canvas_height;
    birds.forEach(
        function (node){
            node.x *= width_change;
            node.y *= height_change;
        });
    flock_canvas_width = flock_canvas.width;
    flock_canvas_height = flock_canvas.height;
}


class Bird{
    constructor(x, y, dx, dy) {
        this._x = x;
        this._y = y;
        this._dx = dx;
        this._dy = dy;
    }

    get dx() {
        return this._dx;
    }

    set dx(value) {
        this._dx = value;
    }

    get dy() {
        return this._dy;
    }

    set dy(value) {
        this._dy = value;
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

    align_and_cohere(){
        let x_align = 0;
        let y_align = 0;
        let x_cohere = 0;
        let y_cohere = 0;
        let bird_quantity = 0;
        for(let b=0;b<birds.length;b++){
            if(getDistance(this, birds[b])<=view_distance&&this!==birds[b]){
                bird_quantity++;
                x_align += birds[b].dx;
                y_align += birds[b].dy;
                x_cohere += birds[b].x;
                y_cohere += birds[b].y;
            }
        }
        if(bird_quantity) {
            this._dx += alignment * ((x_align / bird_quantity)-this._dx);
            this._dy += alignment * ((y_align / bird_quantity)-this._dy);
            this._dx += coherence * (((x_cohere) / bird_quantity)-this._x)
            this._dy += coherence * (((y_cohere) / bird_quantity)-this._y)
        }
    }

    separate(){
        let goal_x = 0;
        let goal_y = 0;
        let bird_quantity = 0;
        for(let b=0;b<birds.length;b++){
            if(getDistance(this, birds[b])<personal_space && birds[b]!==this){
                goal_x += this._x - birds[b].x;
                goal_y += this._y - birds[b].y;
                bird_quantity++;
            }
        }
        if(bird_quantity >0){
            this.dx += goal_x*separation;
            this.dy += goal_y*separation;
        }
    }

    avoidEdge() {
        if (this._x < margin) {
            this._dx += turn_intensity;
        } else if (this._x > flock_canvas.width - margin) {
            this._dx -= turn_intensity;
        }
        if (this._y < margin) {
            this._dy += turn_intensity;
        } else if (this._y > flock_canvas.height - margin) {
            this._dy -= turn_intensity;
        }
    }



}


function getDistance(bird1, bird2){
    return Math.sqrt((bird2.x-bird1.x)**2 + (bird2.y-bird1.y)**2);
}

//draw
let flock_ctx = flock_canvas.getContext("2d");
let bird_colour = "#000000";
let number_of_birds = 600;
let max_speed = 10;
let coherence = 0.005;
let separation = 0.04;
let alignment = 0.05;
let personal_space = 20;
let view_distance = 80;
let bird;
let bird_length = 6;
let bird_width = 6;
let margin = -70;
let turn_intensity = 1;

function draw(){
    if (birds.length===0){
        for(let i = 0;i<number_of_birds;i++){
            birds.push(new Bird(Math.random()*flock_canvas.width, Math.random()*flock_canvas.height, (Math.random()-0.5)*2*max_speed, (Math.random()-0.5)*2*max_speed));
        }
    }
    flock_ctx.strokeStyle = bird_colour;
    flock_ctx.fillStyle = bird_colour;
    flock_ctx.clearRect(0, 0, flock_canvas.width, flock_canvas.height);
    for(let n = 0;n<number_of_birds;n++) {
        bird = birds[n];

         bird.align_and_cohere();
         bird.separate();
         bird.avoidEdge();

        let speed = (Math.sqrt(bird.dx**2 + bird.dy**2));
        if(speed  > max_speed){
            bird.dx *= max_speed/speed;
            bird.dy *= max_speed/speed;
        }
        bird.x += bird.dx;
        bird.y += bird.dy;


        flock_ctx.save(); // Save the current canvas state
        flock_ctx.translate(bird.x, bird.y); // Move the origin to the bird's position
        flock_ctx.rotate(Math.atan2(bird.dy, bird.dx)); // Rotate based on bird's velocity
        flock_ctx.beginPath();
        flock_ctx.moveTo(0, 0); // Start at the origin (center of the bird)
        flock_ctx.lineTo(-bird_length/2, bird_width/2); // Draw the left side of the triangle
        flock_ctx.lineTo(-bird_length/2, -bird_width/2); // Draw the right side of the triangle
        flock_ctx.closePath();
        flock_ctx.fill();
        flock_ctx.stroke();
        flock_ctx.restore();
    }
    window.requestAnimationFrame(draw);
}

function stop_birds(){
    window.cancelAnimationFrame(draw);
    window.removeEventListener("resize", function(){render();draw();}, true);
    birds=[];
}

function start_birds(){
    window.addEventListener("resize", function(){render();draw();}, true);
    render();

    draw();
}


