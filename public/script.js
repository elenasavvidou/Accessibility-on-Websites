// ---- Signature using Canvas.js -----
var sign = false;
var draw = false;
var canvas = document.getElementById('canvas').getContext("2d");
$('#canvas').on('click', function(){
    sign = true;
})

//on mousedown event
var x,y
$('#canvas').on('mousedown', function(e){
    console.log("mousedown");
    draw = true;

    canvas.lineWidth = 3.5;
    canvas.strokeStyle = 'orange'
    x = e.offsetX
    y = e.offsetY
})

//on mouse move event
$('#canvas').on('mousemove', function(e){
    console.log("mousemove!", draw);
    if (draw == true) {
        sign = true;
        canvas.moveTo(x,y)
        console.log(x,y);
        canvas.lineTo(e.pageX - $('canvas').offset().left, e.pageY - $('canvas').offset().top);
        x = e.offsetX
        y = e.offsetY
        canvas.stroke();
    }
})

$(document).on('mouseup', function(){
    draw = false;
    console.log('mouseup!');
    var data = document.getElementById('canvas').toDataURL()
    if (sign) {
        $("input[type=hidden]").val(data);
    }
})
