// ----- Brightness change on click -----

$("#canvas").on('click', function(){
 $('#overlay').css({
     "filter": "blur(500px) brightness(100)"
    })
 })

 $("#canvas").on('mouseup', function(){
  $('#thankstxt').css({
      "visibility": "visible"
     })
  })
