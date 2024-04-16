window.onload = function(){
    let cursor_x = 0;
    let cursor_y = 0;
    //get canvas
    let canvas = document.getElementById("node-canvas");
    render();
    function render() {
        const dimensions = getObjectFitSize(
            true,
            window.innerWidth,
            window.innerHeight,
            canvas.width,
            canvas.height
        );

        canvas.width = dimensions.width*0.98;
        canvas.height = dimensions.height*0.98;
    }

    function getObjectFitSize(
        contains,
        containerWidth,
        containerHeight,
        width,
        height
    ) {
        let doRatio = width / height;
        let cRatio = containerWidth / containerHeight;
        let targetWidth;
        let targetHeight;
        let test = contains ? doRatio > cRatio : doRatio < cRatio;

        if (test) {
            targetWidth = containerWidth;
            targetHeight = targetWidth / doRatio;
        } else {
            targetHeight = containerHeight;
            targetWidth = targetHeight * doRatio;
        }

        return {
            width: targetWidth,
            height: targetHeight,
            x: (containerWidth - targetWidth) / 2,
            y: (containerHeight - targetHeight) / 2
        };
    }

    class Node{
        constructor(x, y, direction) {
            this._x = x;
            this._y = y;
            this._direction = direction;
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
    }


    //report the mouse position on move
    window.addEventListener("mousemove", function (evt) {
        let mousePos = getMousePos(canvas, evt);
        cursor_x = mousePos.x;
        cursor_y = mousePos.y;
        
    }, false);

    //add node on mouseclick
    window.addEventListener("mousedown", function (evt) {
        if(number_of_nodes < 1000){
            let mousePos = getMousePos(canvas, evt);
            cursor_x = mousePos.x;
            cursor_y = mousePos.y;
            number_of_nodes++;
            nodes.push(new Node(cursor_x, cursor_y, getRandomDirection()));
        }
    }, false);


    document.addEventListener("resize", render, true);


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
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#34d8eb";
    let number_of_nodes = 200;
    let nodes = [];
    let speed = 0.8;
    let max_turn = 1/30;
    let reaction_proximity = 100;
    let connections = 7;
    let modifier = 1;
    let node;
    let distance_to_cursor;
    for(let i = 0;i<number_of_nodes;i++){
        //nodes.push(new Node(0.5*canvas.width, 0.5*canvas.height, i*2 * Math.PI*(1/number_of_nodes)));
        nodes.push(new Node(Math.random()*canvas.width, Math.random()*canvas.height, getRandomDirection()));
    } 
    
    function draw(){
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let lines = [];
        for(let n = 0;n<number_of_nodes;n++){
            node = nodes[n];
            distance_to_cursor = Math.sqrt((node.x - cursor_x)**2 + (node.y - cursor_y)**2);
            if(distance_to_cursor > reaction_proximity){
                let sign = Math.random() < 0.5 ? -1 : 1;
                node.direction = node.direction + (Math.random()* max_turn * Math.PI)*sign;
                modifier = 1;
            }else{
                if((node.y === cursor_y) && (node.x === cursor_x)){
                    node.direction = getRandomDirection();
                }else{
                    node.direction = Math.atan2((node.y - cursor_y), (node.x - cursor_x));
                }
                modifier = 2;
            }

            if(node.x > canvas.width || node.x < 0){
                node.direction = Math.PI - node.direction;
            }
            if(node.y > canvas.height || node.y < 0){
                node.direction = 2*Math.PI - node.direction;
            }
            node.x = node.x + (modifier*speed*Math.cos(node.direction));
            node.y = node.y + (modifier*speed*Math.sin(node.direction));

            //draw the nodes (unnecessary if showing connections)
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1, 0, 2 * Math.PI);
            ctx.stroke();
            let distances = [];
            let distance;
            let other_node;
            for(let k = 0;k<number_of_nodes;k++){
                if(k !== n){
                    other_node = nodes[k];
                    distance = Math.sqrt((node.x - other_node.x)**2 + (node.y - other_node.y)**2);

                    if(distances.length < connections || distance < distances[distances.length-1][1]){
                        distances.push([other_node, distance]);
                        distances.sort(function(a,b){return a[1] - b[1];});
                        if(distances.length > connections){
                            distances.pop()
                        }
                    }
                }
            }
            for(let c=0;c<connections;c++){
                other_node = distances[c][0];
                lines.push([[node.x,node.y],[other_node.x, other_node.y]])
            }
        }
        ctx.beginPath()
        for (let line=0;line<lines.length;line++){
            ctx.moveTo(lines[line][0][0], lines[line][0][1]);
            ctx.lineTo(lines[line][1][0], lines[line][1][1]);
        }
        ctx.stroke();

        window.requestAnimationFrame(draw);

    }
    draw();
}
