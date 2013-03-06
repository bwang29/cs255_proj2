function initializeTabs() {
    var divs = document.getElementsByTagName('DIV');
    for (i in divs) {
	if (/\btabsContainer\b/.test(divs[i].className) && !divs[i].initialized) {
	    var tabs = null;
	    var panels = [];
	    var c = divs[i].children;
	    for (var j = 0; j < c.length; j++) {
		if (c[j].tagName == 'UL') {
		    tabs = c[j];
		}
		else if (c[j].tagName == 'DIV') {
		    panels.push(c[j]);
		}
	    }

	    var tabctrl = [];
	    if (tabs) {
		var l = tabs.children;
		for (var k = 0; k < l.length; k++) {
		    if (l[k].tagName == 'LI') {
			// round the top corners with NiftyCorners
			// technique 
			l[k].innerHTML = '<b class="rtop">'
			    + '<b class="r1"></b>'
			    + '<b class="r2"></b>'
			    + '<b class="r3"></b></b>' 
			    + l[k].innerHTML; 
			tabctrl.push(l[k]);
		    }
		}
	    }
	    tabs.ctrls = tabctrl;
	    tabs.panels = panels;

	    var activated = false;
	    for (var m in tabctrl) {
		tabctrl[m].index = m;
		tabctrl[m].onclick = function() { // onclick handler
		    var className = this.className;

		    // do nothing if the tab is already active
		    if (/\bactive\b/.test(className)) {
			return;
		    }

		    // remove active class from current tab
		    var ctrls = this.parentNode.ctrls;
		    for (var n in ctrls) {
			if (/\bactive\b/.test(ctrls[n].className)) {
			    ctrls[n].className = ctrls[n].className.replace(/\b\s*active\b/, '');
			    break;
			}
		    }

		    // set current tab active
		    this.className = className ?
			className + ' active' :
			'active';

		    // activate current panel
		    var panels = this.parentNode.panels;
		    for (var n in panels) {
			panels[n].style.display = (this.index == n) ?
			    '' : 'none';
		    }
		}

		// any tab currently active?
		if (/\bactive\b/.test(tabctrl[m].className)) {
		    if (!activated) {
			activated = true;
			for (var n in tabs.panels) {
			    tabs.panels[n].style.display = (m == n) ? '':'none';
			}
		    }
		    else {
			tabctrl[m].className = tabctrl[m]
			    .className
			    .replace(/\b\s*active\b/, '');
		    }
		}
	    }

	    // if none active, activate first tab
	    if (!activated) {
		if (tabctrl.length > 0) {
		    var activeTab = tabctrl[0];
		    var className = activeTab.className;
		    activeTab.className = className ?
			className + ' active' :
			'active';
		    var panels = activeTab.parentNode.panels;
		    for (var n in panels) {
			panels[n].style.display = (n == 0) ? '' : 'none';
		    }
		}
	    }

	    divs[i].initialized = true;
	}
    }
}

function $(id) {
    return document.getElementById(id);
}

function openPreview() {
    $("post-form").style.display = 'none';
    $("post-preview").style.display = 'block';
}

function closePreview() {
    $("post-form").style.display = 'block';
    $("post-preview").style.display = 'none';
}

function showComments(button, noteid, page) {
    var cmtDiv = $('comment-' + noteid);
    if (! cmtDiv) {
	return;
    }

    if ((!button) || (typeof(button.shown) == 'undefined')) {
	var url = 'notes/comment/show/' + noteid + '/' + (page ? 'p,' + page + '/' : ''); 
	var response = ajaxGet(url);
	cmtDiv.innerHTML = response.data[0];
	cmtDiv.style.display = 'block';
	if (button) {
	    button.innerHTML = '<img src="/media2/img/hide.png" width="51" height="24" align="absmiddle" title="Show">';
	    button.shown = true;
	}
    }
    else if (button.shown) {
	button.innerHTML = '<img src="/media2/img/show.png" width="51" height="24" align="absmiddle" title="Show">';
	button.shown = false;
	cmtDiv.style.display = 'none';
    }
    else {
	cmtDiv.style.display = 'block';
	button.innerHTML = '<img src="/media2/img/hide.png" width="51" height="24" align="absmiddle" title="Show">';
	button.shown = true;
    }
}

function mark(noteid) {
    ajaxGet('notes/mark/' + noteid + '/',
	function(markResp) {
	    $('mark-' + noteid).innerHTML = markResp.data[0];
	    $('markit-' + noteid).innerHTML = markResp.data[1];
	}
    ); 
}

// data: {
//    id: <DOM element id where rating is placed>,
//    rating: <current rating>,
//    on_img:  <URL of active star image>,
//    off_img: <URL of inactive star image>,
//    callback: callback function when rating is selected.
//    readonly: true for read only control
// }
function RatingControl(data) {
    var elem = document.getElementById(data.elemid);
    if (! elem) { return; }

    while (elem.hasChildNodes()) {
	elem.removeChild(elem.firstChild);
    }

    var current_rating = parseInt(data.rating);
    if (isNaN(current_rating)) {
	current_rating = 0;
    }

    var ratings_title = [0, 'Poor', 'Fair', 'Good', 'Excellent', 'Super!'];
    for (var i = 1; i <= 5; i++) {
	var sp = document.createElement('SPAN');
	sp.id = data.elemid + 'star-' + i;
	elem.appendChild(sp);
	if (data.readonly) {
	    var img = document.createElement('IMG');
	    img.src = (current_rating >= i) ? data.on_img : data.off_img;
	    img.align = 'absmiddle';
	    img.title = ratings_title[i];
	    sp.appendChild(img);
	}
	else {
	    sp.stars = i;
	    sp.onmouseover = function() { showRating(this.stars); }

	    var onimg = document.createElement('IMG');
	    onimg.src = data.on_img;
	    onimg.align = 'absmiddle';
	    onimg.title = ratings_title[i];
	    onimg.stars = i;
	    onimg.onclick = function() { setRating(this.stars); }

	    var offimg = document.createElement('IMG');
	    offimg.src = data.off_img;
	    offimg.align = 'absmiddle';
	    offimg.title = ratings_title[i];
						
	    sp.appendChild(onimg);
	    sp.appendChild(offimg);
	}
    }

    if (data.description) {
	var description = document.createElement('SPAN');
	description.innerHTML = '&nbsp;' + data.description;
	elem.appendChild(description);
    }

    if (! data.readonly) {
	if (document.all) {
	    elem.onmouseleave = function() { showRating(current_rating); }
	}
	else {
	    elem.onmouseout = function() { showRating(current_rating); }
	}
	showRating(current_rating);
    }

    function showRating(rating) {
	for (var i = 1; i <= 5; i++) {
	    var on = document.getElementById(data.elemid + 'star-' + i).firstChild;
	    var off = on.nextSibling;
	    on.style.display = (i <= rating) ? '' : 'none';
	    off.style.display = (i <= rating) ? 'none' : '';
	}
    }

    function setRating(rating) {
	current_rating = rating;
	if (typeof(data.callback) == 'function') {
	    data.callback(rating);
	}
    }
}

function setRating(rating) {
    var id = this.id;
    ajaxGet('notes/rateit/' + id + '/' + rating + '/',
	function(rateResp) {
	    new RatingControl({elemid: 'rating-' + id,
				rating: rateResp.avgRating,
				description: rateResp.description,
				on_img: '/media2/img/purple-star.gif',
				off_img: '/media2/img/gray-star.gif',
				readonly: true});
	}
    );
}

function showTagsInput(note_id, display) {
    var ti = $("tags-input" + note_id);
    var ctrl = $("add-tag-ctrl" + note_id);
    if (ti && ctrl) {
	if (display) {
	    ctrl.innerHTML = '<a class="add-tag">Add tags:</a>';
	    ti.style.display = '';
	}
	else {
	    ctrl.innerHTML = '<a class="add-tag" href="#" onclick="showTagsInput('
			   + note_id + ', true);return false;">Add tags&raquo;</a>';
	    ti.style.display = 'none';
	}
    }
    window.Tags_show_input = display;
}

function addTags(note_id) {
    var tags = $("tags" + note_id);
    var response = ajaxGet('notes/tags/' + note_id + '/' + encodeURIComponent(tags.value) + '/');
    $("tags-container-" + note_id).innerHTML = response.data[0];
    window.Tags_show_input = false;
}

function deleteTag(note_id, tag_id) {
    var tag = $('tag' + note_id + '.' + tag_id).value;
    var response = ajaxGet('notes/tags/delete/' + note_id + '/' + encodeURIComponent(tag) + '/');
    $("tags-container-" + note_id).innerHTML = response.data[0];
    window.Tags_show_input = false;
}

function showTags(e, note_id) {
    e = e || window.event;
    var tagsId = "tags-container-" + note_id;
    var tagsDiv = $(tagsId);
    if (! tagsDiv) {
	var response = ajaxGet('notes/tags/' + note_id + '/');
	tagsDiv = document.createElement("DIV");
	document.body.appendChild(tagsDiv);
	tagsDiv.id = tagsId;
	tagsDiv.className = "tags-container";
	tagsDiv.innerHTML = response.data[0];
    }

    showTagsInput(note_id, window.Tags_show_input);
    showTooltip(e, tagsDiv);
}

function closeTags(note_id) {
    $("tags-container-" + note_id).style.display = 'none';
}

function showLinks(e, note_id) {
    e = e || window.event;
    var linksId = "links-container-" + note_id;
    var linksDiv = $(linksId);
    if (! linksDiv) {
        var response = ajaxGet('notes/links/' + note_id + '/');
	linksDiv = document.createElement('DIV');
	document.body.appendChild(linksDiv);
	linksDiv.id = linksId;
	linksDiv.className = "links-container";
	linksDiv.innerHTML = response.data[0];
    }
    showTooltip(e, linksDiv);
}

function closeLinks(note_id) {
    $("links-container-" + note_id).style.display = 'none';
}

function showTooltip(e, tt) {
    if (window.xinotes_tt) {
	window.xinotes_tt.style.display = 'none';
    }

    tt.style.display = '';
    tt.style.position = 'absolute';
    var xOffset = 4;
    var yOffset = 14;
    var clientX = e.clientX || e.pageX;
    var clientY = e.clientY || e.pageY;

    var scrollLeft = document.body.scrollLeft;
    var scrollTop = document.body.scrollTop;
    if (document.documentElement && document.documentElement.scrollTop) {
        scrollLeft = document.documentElement.scrollLeft;
	scrollTop = document.documentElement.scrollTop;
    }

    var left = scrollLeft + clientX - xOffset - tt.offsetWidth;
    if (left < 0) {
        left = scrollLeft + clientX + xOffset;
    }
    tt.style.left = left + 'px';
    tt.style.top = scrollTop + clientY - yOffset - tt.offsetHeight + 'px';

    window.xinotes_tt = tt;
}

function loadTagCloud(path, upfx) {
    ajaxGet('notes/'+upfx+'tag_cloud/'+path+'/',
	function(tag_cloud) {
	    var searchtxt = $('search-txt');
	    if (! searchtxt) {
		return;
	    }
	    var div = $('tag_cloud');
	    div.innerHTML = tag_cloud.data[0];
	}
    );
}

function onloadHandler() {
    var ordering = $('notes_order_id');
    var filter = $('notes_filter_id');

    if (ordering) {
	ordering.onchange = function() { 
	    if (filter && filter.selectedIndex > 0) {
		window.location = this.form.action + this.value + filter.value;
	    }
	    else {
		window.location = this.form.action + this.value; 
	    }
	}
    }

    if (filter) {
	filter.onchange = function() { 
	    if (ordering && ordering.selectedIndex > 0) {
		window.location = this.form.action + ordering.value + this.value;
	    }
	    else {
		window.location = this.form.action + this.value; 
	    }
	}
    }
}

function deleteNote(noteId) {
    var sure = confirm('Are you sure you want to delete this note?');
    if (sure) {
	window.location = 'notes/delete/' + noteId + '/';
    }

    return false;
}

function dismissNewDiv() {
    var d = $('new-here');
    if (d) {
        d.style.display = 'none';
    }
}

OpenIDAuth = {
    google: {
        initAuth: function(e) {
	    $('openid').value = 'https://www.google.com/accounts/o8/id';
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    yahoo: {
        initAuth: function(e) {
	    $('openid').value = 'http://yahoo.com/';
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    flickr: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'Flickr username', this.sendAuth);
	},
	sendAuth: function(id) {
	    $('openid').value = 'www.flickr.com/' + id;
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    myspace: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'Myspace username', this.sendAuth);
	},
	sendAuth: function(id) {
            $('openid').value = 'www.myspace.com/' + id;
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    livejournal: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'Livejournal username', this.sendAuth);
	},
	sendAuth: function(id) {
            $('openid').value = id + '.livejournal.com';
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    wordpress: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'Wordpress username', this.sendAuth);
	},
	sendAuth: function(id) {
            $('openid').value = id + '.wordpress.com';
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    blogger: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'Blogger blogname', this.sendAuth);
	},
	sendAuth: function(id) {
            $('openid').value = id + '.blogspot.com';
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    },
    aol: {
        initAuth: function(e) {
	    displayOpenIDDialog(e, 'AOL screenname', this.sendAuth);
	},
	sendAuth: function(id) {
            $('openid').value = 'openid.aol.com/' + id;
	    window.setTimeout('document.forms[0].submit()', 500);
	}
    }
};

function openid_auth(event, provider) {
    var e = event || window.event;
    OpenIDAuth[provider].initAuth(e);
}

function displayOpenIDDialog(e, accountType, callBack) {
    $('openIdPrompt').innerHTML = 'Please enter your ' + accountType + ':';
    showTooltip(e, $('openIdDialog'));
    $('openid_username').focus();
    $('openIdSubmit').onclick = function() {
        var v = $('openid_username').value;
	if (v != '') {
            callBack(v);
 	    closeOpenIDDialog();
	}
	else {
            $('openid_username').focus();
	}
	return false;
    };
}

function closeOpenIDDialog() {
    $('openIdDialog').style.display = 'none';
}
