var ctx;
var canvas;
var refresh_interval = 25;
var line_num = 16 - 1;
var circle_speed_x = 10;
var circle_r = 5;
var note_r = 60;
var note_speed_x = 8;
var circles = new Array();
var notes = new Array();
var colors = ["#ff5a57","#ff8d43","#fcf777","#e7fc7a","#a1fb96","#7ef1d7","#95daff","#beceff","#e6c3ff"];
var cats = [
        ["cat.gif",-50]
        // ["GBG.gif",-50],
        // ["GBauthentic.gif",-50],
        // ["america.gif",-50],
        // ["bday.gif",-130],
        // ["easter.gif",-50],
        // ["fat.gif",-50],
        // ["ganja.gif",-50],
        // ["j5.gif",-50],
        // ["jazz.gif",-50],
        // ["melon.gif",-50],
        // ["mexinyan.gif",-60],
        // ["mummy.gif",-50],
        // ["newyear.gif",-50],
        // ["nyaninja.gif",-40],
        // ["patty.gif",-110],
        // ["pikanyan.gif",-50],
        // ["pumpkin.gif",-50],
        // ["sad.gif",-50],
        // ["smurf.gif",-50],
        // ["vday.gif",-50],
        // ["xmas.gif",-50]
];
var count_down_interval;
var count_down_val = 5;
var tutorial_img_interval;

var bg_colors = gen_gradient("2c2c2d","464f71"); //["#141415","#1b1b1d","#1d1e21","#202025","#232428","#25262b","#28292f","#2b2c34","#2d2f37","#32353f","#393d4d","#3b4155","#424861","#444c68","#485173"," #4a547a"];
var bg_color_num = bg_colors.length;
var my_cat_flow;
var my_cat;
var bg_img;

// function Circle(x, y, r, filled, color_id) {
//     this.x = x;
//     this.y = y;
//     this.r = r;
//     this.color = colors[color_id];
//     this.filled = filled;
// }

// function add_circle(x, y, r, fill, color_id) {
//     var circle = new Circle(x, y, r, fill, color_id);
//     circles.push(circle);
// }


// function add_circles(x, y, n) {
//     add_circle(x, y, circle_r * (Math.random() + 0.5));
//     for (i = 1; i < n; i++) {
//         setTimeout(function(){
//             add_circle(x, y, circle_r * (Math.random() + 0.5));
//         }, refresh_interval * i);
//     }
// }

// function remove_circle(circle) {
//     var index = circles.indexOf(circle);
//     if (index >= 0) {
//         circles.splice(index, 1);
//     }
//     else {
//         console.log("failed to find circle");
//         console.log(circle);
//     }
// }

function init_vis_canvas() {
//    for (i = 1; i <= 9; i++) {
//        $('#sound_'+i).css('background', colors[i-1]);
//    }
    bg_img = new Image();
    bg_img.src = "images/bg.jpg";
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        $(canvas).attr("width",$(window).width());
        $(canvas).attr("height",$(window).height() - $(canvas).position().top);
        ctx = canvas.getContext("2d");
        ctx.translate(0.5, 0.5);
        setInterval(draw, refresh_interval);
    }
    show_cat_select();
    
    
}


function draw_rect(y0,width,height,color){
    ctx.fillStyle = color;
    ctx.fillRect (0,y0,width,height);
}

function draw_line(x0, y0, x1, y1) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

// function draw_circle(circle) {
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = circle.color;
//     ctx.beginPath();
//     ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI*2, true);
//     if (circle.filled) {
//         ctx.fillStyle = circle.color;
//         ctx.fill();
//     }
//     ctx.stroke();
// }

// function update_circle(circle) {
//     circle.x -= circle_speed_x;
//     if (circle.x < 0) {
//         remove_circle(circle);
//     }
// }

function draw() {
    var w = $(canvas).width();
    var h = $(canvas).height();
    ctx.clearRect(0, 0, w, h);
    // ctx.fillStyle = "#000";
    // ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bg_img, 0, 0,w,h);
    // var gap = $(canvas).height() / bg_color_num-1 ;
    // for(var i=0; i<bg_color_num; i++){
    //     draw_rect(i*gap,$(window).width(),gap,bg_colors[bg_color_num-1-i]);
    // }
    // for (i = 0; i < line_num; i++) {
    //     var y = (i+1) * gap;
    //     draw_line(0, y, w, y);
    // }
    // add_circle(mouse_doc_x - $(canvas).position().left,
    //     mouse_doc_y - $(canvas).position().top,
    //     circle_r * (Math.random() + 0.5),
    //     mouse_down||leap_trigger,
    //     local_sound_choice);

    // for (var id in other_player_info) {
    //     add_circle(other_player_info[id].x,
    //         other_player_info[id].y,
    //         circle_r * (Math.random() + 0.5),
    //         other_player_info[id].mousedown,
    //         other_player_info[id].c);
    // }

    // for (i = 0; i < circles.length; i++) {
    //     draw_circle(circles[i]);
    //     update_circle(circles[i]);
    // }
    var rand = Math.random();
    if(rand > 0.5){
        add_note(mouse_doc_x - $(canvas).position().left,
            mouse_doc_y - $(canvas).position().top,
            note_r * (Math.random() + 0.5),
            mouse_down||leap_trigger,
            local_sound_choice,
            make_note(),
            Math.random());
    }

    for (var id in other_player_info) {
        add_note(other_player_info[id].x,
            other_player_info[id].y,
            note_r * (Math.random() + 0.5),
            other_player_info[id].mousedown,
            other_player_info[id].c,
            make_note(),
            Math.random());
    }

    for (i = 0; i < notes.length; i++) {
        draw_note(notes[i]);
        update_note(notes[i]);
    }
}

//*****************************
//
// Notes section
//
// r represent note size
function Note(x, y, r, filled, color_id,text,alpha) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.t = text;
    this.a = alpha;
    this.color = colors[color_id];
    this.filled = filled;
}

function add_note(x, y, r, fill, color_id,text,alpha) {
    var note = new Note(x, y, r, fill, color_id,text,alpha);
    notes.push(note);
}

function remove_note(note) {
    var index = notes.indexOf(note);
    if (index >= 0) {
        notes.splice(index, 1);
    }
    else {
        console.log("failed to find note");
        console.log(note);
    }
}

function draw_note(note) {
    if(note.filled){
        ctx.globalAlpha = note.a;
        ctx.fillStyle = note.color;
    }else{
        ctx.globalAlpha = note.a * 0.5;
        ctx.fillStyle = "#000";
    }
    ctx.font = 'italic bold '+ note.r+'px Notes';
    ctx.textBaseline = 'middle';
    ctx.fillText(note.t, note.x, note.y);
    ctx.globalAlpha = 1.0;
}

function update_note(note) {
    note.x -= note_speed_x;
    note.y += Math.round((0.5-Math.random())*2);
    if (note.x < -30) {
        remove_note(note);
    }
}

function make_note(){
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < 1; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

// helper functions
function gen_gradient(c_a,c_b){
    var numberOfItems = 16;
    var rainbow = new Rainbow(); 
    rainbow.setNumberRange(1, numberOfItems);
    rainbow.setSpectrum(c_a, c_b);
    var s = [];
    for (var i = 1; i <= numberOfItems; i++) {
        var hexColour = rainbow.colourAt(i);
        s.push('#' + hexColour);
    }
    return s;
}

function show_cat_select(){
    my_cat_flow = new ContentFlow('cat_select', {});
    for (cat in cats) {
        $('.ContentFlow .flow').append('<img class="item" href="javascript:cat_selected()" src="/images/cats/' + cats[cat][0] + '"/>');
    }
    setTimeout(function(){start_count_down();},2000);
}

function cat_selected(){
    my_cat=get_active_cat();
    $(".cat_img img").attr("src","images/cats/"+cats[my_cat][0]);
    $(".cat_img img").css("margin-top",cats[my_cat][1]+"px");
    $("#cat_select").hide();
    $("#loading").fadeOut();
    $("#my_circle").show();
    // show_tutorial();
    // tutorial_img_interval = setInterval(function(){
    //     $(".tutorial_img").hide().fadeIn(600);
    // },600);
    // setTimeout(function(){
    //     $(".tutorial_img").fadeOut();
    //     clearInterval(tutorial_img_interval);
    // },3600);
    start_log();
}

function start_count_down(){
  count_down_interval = setInterval(function(){
    $("#loading").html("Choose a cat [" + count_down_val+"]");
    count_down_val -= 1;
    if(count_down_val == -1){
      clearInterval(count_down_interval);
      cat_selected();
      cat_selection = false;
    }
  },900);
}

function get_active_cat(){
    var img_path = $('#cat_select .active canvas').attr('src');
    var segments = img_path.split('/');
    var img_name = segments[segments.length - 1];
    for (i = 0; i < cats.length; i++) {
        if (img_name == cats[i][0])
            return i;
    }
    return -1;
}
