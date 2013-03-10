/* this is the audio context, used to play, buffer, and control all sounds*/
var ad_context; 
/* buffer loader object */
var buffer_loader; 
/* list of playable buffers */
var buffer_list_playable;
/* buffer player for local player */
var local_buffer_player;
/* buffer player for background beats */
var background_buffer_player;
var local_sound_interval_timeout;
var local_sound_choice = 4;
var local_gain_node;
/* the volume of local sound */
var local_gain_value = 1;
var beat_speed = 170;
/* the time that the local player should fire for the next sound */
var beat_next_time; 
/* background beat's speed factor */
var bg_factor = 4;
// sound source has all the sounds for the app
var sound_source = [];
var sound_type = ["drums","bell","woody","syntklocka_stab","corny","8bit_stab","bass","bassdist","bziaou"];
var sound_freq = ["0.3","0.3","0.3","0.3","0.3","0.5","0.5","0.5","0.7"];

for(var i=0; i<sound_type.length;i++){
  for(var c=16; c>0; c--){
    sound_source.push("sound/"+sound_type[i]+"_"+c+".ogg");
  }
}
sound_source.push("sound_bg/drumming3.ogg");
var total_sound_num = sound_type.length;
var document_height,document_width;
var mouse_doc_x, mouse_doc_y;
var mouse_down;
var socket;
var my_id = Math.random().toString(36).substring(7);

// for other players connected to the game
var other_player_info = {}; // contains information for other players including sound choice, time interval, buffer player, and mouse coord

function create_audio_context(){
  try {
    ad_context = new webkitAudioContext();
    console.log("Audio context initiated");
    buffer_loader = new BufferLoader(ad_context,sound_source,buffer_loading_finished);
    buffer_loader.load();
    console.log("Buffer loader finished loading");
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser and no sound will be played');
  }
}

// trigger then buffer of all audio clips are loaded completely
function buffer_loading_finished(bufferList) {
  console.log("Buffer loader compplete - loaded " + sound_source.length + " sounds");
  buffer_list_playable = bufferList;
  initialize_socket();
  attach_mouse_events();
  attach_key_events();

  // set beat timstamp to sync with local sound
  setInterval(function(){
    beat_next_time = (new Date()).getTime()+beat_speed;
  },beat_speed); 
  // set beat background sound
  setInterval(function(){
    play_background_beats(buffer_list_playable,16*total_sound_num);
  },beat_speed*bg_factor); 
}

function show_tutorial(){
  $('img').mousedown(function(){return false});
  var duration = 5000;
  var time = duration;
  $("#t1").fadeIn();
  $("#progressbar").animate({"width":"350"},duration);
  setTimeout(function(){
    $("#progressbar").animate({"width":"0"},0);
    $("#t1").hide();
    $("#t2").fadeIn();
    $("#progressbar").animate({"width":"350"},duration);
  },time)
  time += duration;
  setTimeout(function(){
    $("#progressbar").animate({"width":"0"},0);
    $("#t2").hide();
    $("#t3").fadeIn();
    $("#progressbar").animate({"width":"350"},duration);
  },time)
  time += duration;
  setTimeout(function(){
    $("#progressbar").fadeOut();
    $("#t3").fadeOut();
  },time)
}

// play a particular sound clip with a playlist, and the index in the playlist
function local_play(playlist,index){
  if(typeof local_buffer_player !== "undefined"){
    local_buffer_player.stop(0);
  }

  var compressor=ad_context.createDynamicsCompressor();
  local_buffer_player = ad_context.createBufferSource();
  local_buffer_player.buffer = playlist[index];
  // connect with gain mode
  local_gain_node = ad_context.createGainNode();
  local_buffer_player.connect(local_gain_node);
  local_gain_node.gain.value = local_gain_value * 0.5;
  local_gain_node.connect(compressor);
  compressor.connect(ad_context.destination);
  local_buffer_player.start(0);

  // echo effect
  // var time = ad_context.currentTime;
  // var g = local_gain_value;
  // for (var i = 0; i < 2; i++) {
  //   var source = makeSource(playlist[index],g);
  //   g = g * 0.5;
  //   source.start(time + 0.3 + i * 0.1);
  // }
}

function makeSource(buffer,g){
  var source=ad_context.createBufferSource();
  var compressor=ad_context.createDynamicsCompressor();
  var gain=ad_context.createGainNode();
  gain.gain.value=g;
  source.buffer=buffer;
  source.connect(gain);
  gain.connect(compressor);
  compressor.connect(ad_context.destination);
  return source;
};

function play_background_beats(playlist,index){
  if(typeof background_buffer_player !== "undefined"){
    background_buffer_player.stop(0);
  }
  background_buffer_player = ad_context.createBufferSource();
  background_buffer_player.buffer = playlist[index];
  background_buffer_player.connect(ad_context.destination);
  background_buffer_player.start(0);
}

// play a particular sound clip for a remote player with a playlist, and the index in the playlist
function remote_play(player_id, playlist,index,volume){
  if(typeof other_player_info[player_id].player !== "undefined"){
    other_player_info[player_id].player.stop(0);
  }
  var compressor=ad_context.createDynamicsCompressor();
  other_player_info[player_id].player = ad_context.createBufferSource();
  other_player_info[player_id].player.buffer = playlist[index];
  // connect with gain node
  other_player_info[player_id].gain = ad_context.createGainNode();
  other_player_info[player_id].player.connect(other_player_info[player_id].gain);
  other_player_info[player_id].gain.connect(compressor);
  compressor.connect(ad_context.destination);
  other_player_info[player_id].gain.gain.value = volume * 0.5;
  other_player_info[player_id].player.start(0);
}

// play the music stream for local player
function local_player_play_stream(){
  // first play once then setup interval to avoid delay
  setTimeout(function(){
    local_play(buffer_list_playable,local_sound_choice*16+Math.floor(16*get_y_doc_range((mouse_doc_y)/document_height)));
  },beat_next_time - (new Date()).getTime());
  local_sound_interval_timeout = setInterval(function(){
    // wait until it is the right time to play
    setTimeout(function(){
      var rand = Math.random();
      if(rand > sound_freq[local_sound_choice]){
        local_play(buffer_list_playable,local_sound_choice*16+Math.floor(16*get_y_doc_range((mouse_doc_y)/document_height)));
      }
    },beat_next_time - (new Date()).getTime());
  },beat_speed);
}

// clear music
function clear_local_sound_time_out(){
  window.clearInterval(local_sound_interval_timeout);
}

// attach mouse events to the dom
function attach_mouse_events(){
  document_height = $(document).height();
  document_width = $(document).width();
  $(document).mousemove(function(e){
    //$('#status').html(e.pageX +', '+ e.pageY);
    mouse_doc_x = e.pageX;
    mouse_doc_y = e.pageY;
    $("#my_circle").css({top:mouse_doc_y-10,left:mouse_doc_x-10});
    socket.emit('user-motion', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
    // socket.emit('user-select-cat', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
  });
  $(document).mousedown(function(e){
    console.log("mouse down");
    local_gain_value = 1;
    socket.emit('user-mousedown', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
    local_player_play_stream();
    mouse_down = true;
  });
  $(document).mouseup(function(e){
    console.log("mouse up");
    socket.emit('user-mouseup', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
    clear_local_sound_time_out();
    mouse_down = false;
  });
}

// leap functions
function leap_start_sound(){
  console.log("leap start");
  socket.emit('user-mousedown', {id:my_id,x:leap_screen_x,y:leap_screen_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
  local_player_play_stream();
}
function leap_stop_sound(){
  console.log("leap stop");
  socket.emit('user-mouseup', {id:my_id,x:leap_screen_x,y:leap_screen_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
  clear_local_sound_time_out();
}
function leap_move(){
  // override mouse position
  mouse_doc_x = leap_screen_x;
  mouse_doc_y = leap_screen_y;
  socket.emit('user-motion', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
  //socket.emit('user-select-cat', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice,g:local_gain_value,a:my_cat});
}

// attach keyboard event to the dom
function attach_key_events(){
  $(document).keypress(function(e) {
    console.log("Key pressed: " + e.which);
    if(e.which>=49 && e.which<49+total_sound_num){
      $(".select_sound").removeClass("sel_highlighted");
      local_sound_choice = e.which - 49;
      $("#sound_"+(local_sound_choice+1)).addClass("sel_highlighted");
    }else if(e.which == 76){
      d_log(); // output log
    }else if(e.which == 72){
      emotion = "H";
    }else if(e.which == 83){
      emotion = "S";
    }else if(e.which == 65){
      emotion = "A";
    }
  });
}

// direction negative means incrementing sound
// function leap_select_sound(direction){
//     if(direction < 0){
//       if(local_sound_choice < total_sound_num - 1){
//         local_sound_choice += 1;
//       }
//     }else{
//       if(local_sound_choice > 0){
//         local_sound_choice -= 1;
//       }
//     }
//     $(".select_sound").removeClass("sel_highlighted");
//     $("#sound_"+(local_sound_choice+1)).addClass("sel_highlighted");
// }

function leap_select_sound(x){
    if(x>60){
      local_sound_choice = 8;
    }else if(x>45){
      local_sound_choice = 7;
    }else if(x>30){
      local_sound_choice = 6;
    }else if(x>15){
      local_sound_choice = 5;
    }else if(x>0){
      local_sound_choice = 4;
    }else if(x>-15){
      local_sound_choice = 3;
    }else if(x>-30){
      local_sound_choice = 2;
    }else if(x>-45){
      local_sound_choice = 1;
    }else{
      local_sound_choice = 0;
    }
    $(".select_sound").removeClass("sel_highlighted");
    $("#sound_"+(local_sound_choice+1)).addClass("sel_highlighted");
}

// initialize web socket to listen to actions from other users
function initialize_socket(){
  socket = io.connect('/game');
  socket.on('other-motion', function (data) {
    if($("#"+data.id).length == 0){
      $("body").append("<div id='"+data.id+"' class='other_circle'><img src='images/nyan.gif' width='100px'></div>");
    }

    if(typeof other_player_info[data.id] === "undefined"){
      other_player_info[data.id] = {};
      other_player_info[data.id].a = data.a;
    }

    // need to improve effeciency
    $('#'+data.id + ' img').attr('src', 'images/cats/' + cats[data.a][0]);
    $('#'+data.id + ' img').attr('margin-top', cats[data.a][1]+'px');

    other_player_info[data.id].x = data.x;
    other_player_info[data.id].y = data.y;
    other_player_info[data.id].c = data.c;
    other_player_info[data.id].g = data.g;
    $("#"+data.id).css({top:data.y,left:data.x});
  });
  socket.on('other-disconnect', function (data) {
    // data is the id here
    $("#"+data).fadeOut();
    delete other_player_info[data];
  });
  socket.on('other-mousedown', function (data) {
    if(typeof other_player_info[data.id] === "undefined"){
      other_player_info[data.id] = {};
    }
    other_player_info[data.id].c = data.c;
    other_player_info[data.id].g = data.g;
    other_player_info[data.id].mousedown = true;
    
    // wait until the next appropriate time to play
    setTimeout(function(){
      remote_play(data.id,buffer_list_playable,other_player_info[data.id].c*16+Math.floor(16*get_y_doc_range(other_player_info[data.id].y/document_height)),other_player_info[data.id].g);
    },beat_next_time - (new Date()).getTime());
    other_player_info[data.id].interval = setInterval(function(){
      setTimeout(function(){
        var rand = Math.random();
        if(rand > sound_freq[other_player_info[data.id].c]){
          remote_play(data.id,buffer_list_playable,other_player_info[data.id].c*16+Math.floor(16*get_y_doc_range(other_player_info[data.id].y/document_height)),other_player_info[data.id].g);
        }
      },beat_next_time - (new Date()).getTime());
    },beat_speed);

  });
  socket.on('other-mouseup', function (data) {
    window.clearInterval(other_player_info[data.id].interval);
    other_player_info[data.id].mousedown = false;
  });
  // socket.on('other-select-cat', function (data) {
  //     if (other_player_info[data.id].a == null) {
  //         other_player_info[data.id].a = data.a;
  //         $('#'+data.id + ' img').attr('src', 'images/cats/' + cats[data.a][0]);
  //         $('#'+data.id + ' img').attr('margin-top', cats[data.a][1]+'px');
  //     }
  // });
}

// get document range y
function get_y_doc_range(x){
  if(x>1){
    return 0.99; // correct offset 
  }else if(x<0){
    return 0;
  }else{
    return x;
  }
}

//generate random color
function get_random_color(){
  var letters = '0123456789ABCDEF'.split('');
  var color = '#00';
  for (var i = 0; i < 4; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

// buffer loader class
function BufferLoader(context,urlList,callback){this.context=context;this.urlList=urlList;this.onload=callback;this.bufferList=new Array();this.loadCount=0;}
BufferLoader.prototype.loadBuffer=function(url,index){var request=new XMLHttpRequest();request.open("GET",url,true);request.responseType="arraybuffer";var loader=this;request.onload=function(){loader.context.decodeAudioData(request.response,function(buffer){if(!buffer){alert('error decoding file data: '+url);return;}
loader.bufferList[index]=buffer;if(++loader.loadCount==loader.urlList.length)
loader.onload(loader.bufferList);},function(error){console.error('decodeAudioData error',error);});}
request.onerror=function(){alert('BufferLoader: XHR error');}
request.send();}
BufferLoader.prototype.load=function(){for(var i=0;i<this.urlList.length;++i)
this.loadBuffer(this.urlList[i],i);}