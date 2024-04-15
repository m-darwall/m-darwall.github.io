window.onload = function(){
    let cursor_x = 0;
    let cursor_y = 0;
    //get canvas
    let canvas = document.getElementById("mesh");
    render();
    function render() {
        const dimensions = getObjectFitSize(
            true,
            window.innerWidth,
            window.innerHeight,
            canvas.width,
            canvas.height
        );

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
    }

    function getObjectFitSize(
        contains,
        containerWidth,
        containerHeight,
        width,
        height
    ) {
        var doRatio = width / height;
        var cRatio = containerWidth / containerHeight;
        var targetWidth = 0;
        var targetHeight = 0;
        var test = contains ? doRatio > cRatio : doRatio < cRatio;

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


    //report the mouse position on click
    canvas.addEventListener("mousemove", function (evt) {
        var mousePos = getMousePos(canvas, evt);
        cursor_x = mousePos.x;
        cursor_y = mousePos.y;
        
    }, false);
    

    document.addEventListener("resize", render(), true);

    //Get Mouse Position
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }


    //draw
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#34d8eb";
    let number_of_nodes = 200;
    let nodes = [];
    let speed = 0.8;
    let max_turn = 1/30;
    let reaction_proximity = 100;
    let connections = 7;
    let modifier = 1;
    for(i = 0;i<number_of_nodes;i++){
        nodes.push([0.5*canvas.width, 0.5*canvas.height, i*2 * Math.PI*(1/number_of_nodes)]);
        //nodes.push([Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*2 * Math.PI]);
    } 
    
    function draw(){
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(n = 0;n<number_of_nodes;n++){
            node = nodes[n];
            distance_to_cursor = Math.sqrt((node[0] - cursor_x)**2 + (node[1] - cursor_y)**2);
            if(distance_to_cursor > reaction_proximity){
                var sign = Math.random() < 0.5 ? -1 : 1;
                node[2] = node[2] + (Math.random()* max_turn * Math.PI)*sign;
                modifier = 1;
            }else{
                node[2] = Math.atan2((node[1] - cursor_y), (node[0] - cursor_x));
                modifier = 2;
            }

            if(node[0] > canvas.width || node[0] < 0){
                node[2] = Math.PI - node[2];
            }
            if(node[1] > canvas.height || node[1] < 0){
                node[2] = 2*Math.PI - node[2];
            }
            node[0] = node[0] + (modifier*speed*Math.cos(node[2]));
            node[1] = node[1] + (modifier*speed*Math.sin(node[2]));

            
            ctx.beginPath();
            ctx.arc(node[0], node[1], 1, 0, 2 * Math.PI);
            ctx.stroke();
            nodes[n] = node;
        }
        for(n = 0;n<number_of_nodes;n++){
            let x = nodes[n][0];
            let y = nodes[n][1];
            let distances = [];
            for(k = 0;k<number_of_nodes;k++){
                if(k != n){
                    distance = Math.sqrt((x - nodes[k][0])**2 + (y - nodes[k][1])**2);
                    distances.push([k, distance]);
                }
            }
            distances.sort(function(a,b){return a[1] - b[1];});
            for(c=0;c<connections;c++){
                node = nodes[distances[c][0]];
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(node[0], node[1]);
                ctx.stroke();
            }
        }
        window.requestAnimationFrame(draw);

    }
    draw();
}
