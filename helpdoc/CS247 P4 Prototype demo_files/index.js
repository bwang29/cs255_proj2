var log = [];
var log_interval_handle;
var emotion = "U";
$(document).ready(function(){
    create_audio_context();
    init_vis_canvas();
    init_leap();
});

function start_log(){
	return;
	// wait 5 seconds and start logging
	setTimeout(function(){
		console.log("Start logging..");
		log_interval_handle = setInterval(function(){
			log.push({t:ad_context.currentTime,
				i:local_sound_choice,
				v:local_gain_value,
				x:mouse_doc_x,
				y:mouse_doc_y,
				c:my_cat,
				e:emotion
			});
		},100);
	},15000);
}

// fire this function in console or press shift and L for log

function d_log(){
	clearInterval(log_interval_handle);
	window.open("data:text/json;charset=utf-8," + escape(JSON.stringify(log)));
}

