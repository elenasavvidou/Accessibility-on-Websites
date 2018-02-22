// ---- when user types, image blurs ----

$("#input1").on('click', function(){
    console.log('clicked');
$('.image').css({
    "-webkit-filter": "blur(0px) brightness(1)"
   })
})

$("#input2").on('click', function(){
    console.log('clicked');
 $('.image').css({
     "filter": "blur(2px) brightness(1)"
     })
})

$("#input3").on('click', function(){
 $('.image').css({
     "-webkit-filter": "blur(3px) brightness(1)"
    })
 })

$("#input4").on('click', function(){
$('.image').css({
    "-webkit-filter": "blur(5px) brightness(1)"
    })
 })

$("#input5").on('click', function(){
 $('.image').css({
     "-webkit-filter": "blur(6px) brightness(1)"
    })
 })

 $("#access").on('click', function(){
  $('.image').css({
      "-webkit-filter": "blur(0px) brightness(1)"
     })
  })
