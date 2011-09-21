function onRequest(request, sender, callback) {
    if (request.action == 'getJSON') {
        $.getJSON(request.url, callback);
        //$.getJSON(request.url, function(data) { alert("here"); });
    }
    if (request.action == 'ajax') {
        $.ajax({
            type : request.type,    
            url : request.url,
            async : async,
            success : callback
        });
    }
    if (request.action == 'get') {
        $.get(request.url, callback);
    }
    
    if (request.action == 'post') {
        $.post(request.url, request.data, callback);
    }
}

chrome.extension.onRequest.addListener(onRequest);
