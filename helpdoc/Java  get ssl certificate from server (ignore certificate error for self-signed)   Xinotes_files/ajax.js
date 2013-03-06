function ajaxGet(url, ajaxCallback) {
    if (typeof ajaxCallback == 'function') {
	httpGet(url, ajaxProcess);
    }
    else {
	return ajaxProcess(httpGet(url));
    }

    function ajaxProcess(xmldom) {
	var resp = xmldom.firstChild;
	while (resp) {
		if (resp.nodeName == 'ajax-response') {
			break;
		}
		resp = resp.nextSibling;
	}

	var retVal = new Object();
	if (resp) {
	    var attributes = resp.attributes;
	    for (var i = 0; i < attributes.length; i++) {
		var attr = attributes.item(i);
		retVal[attr.name] = attr.value;
	    }

	    retVal.data = [];
	    var child = resp.firstChild;
	    while (child) {
		if (child.nodeName == '#cdata-section') {
			retVal.data.push(child.data);
		}
		child = child.nextSibling;
	    }
	}

	if (typeof ajaxCallback == 'function') {
	    ajaxCallback(retVal);
	}
	else {
	    return retVal;
	}
    }
}

function httpGet(url, asyncCallback) {
    var http = getXMLHTTP();
    if (typeof asyncCallback == 'function') {
	http.open("GET", url, true);
	http.onreadystatechange = function() {
	    if (http.readyState == 4) {
		if (! isStatusGood(http.status)) {
		    throw "Failed to get " + url + ", status: " + http.status;
		}

		var xml = http.responseXML;
		if (xml && xml.firstChild) {
		    asyncCallback(xml);
		}
		else {
		    asyncCallback(http.responseText);
		}
	    }
	};
	http.send(null);
    }
    else {
	http.open("GET", url, false);
	http.send(null);
	if (! isStatusGood(http.status)) {
	    throw "Failed to get " + url + ", status: " + http.status;
	}

	var xml = http.responseXML;
	if (xml && xml.firstChild) {
	    return xml;
	}
	else {
	    return http.responseText;
	}
    }
}

function isStatusGood(status) {
    // OK, or not-modified. When using Ajax, IE 6.0 fakes 200 when 304
    // is the actual status. Opera 8.0 returns 304 as is. Firefox
    // 1.5 doesn't even go back to server when requested URL is
    // cached. You should stop browser caching if content requested through
    // Ajax is dynamic.
    return (status == 200) || (status == 304);
}

function getXMLHTTP() {
    var xmlhttp;
    try {
	xmlhttp = new XMLHttpRequest();
    }
    catch (e) {
	try {
	    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	catch (e) {
	    throw "Unable to create an HTTP Request object";
	}
    }
    return xmlhttp;
}
