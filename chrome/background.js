function onRequest(request, sender, callback) {
    if (request.action == 'getDef') {
        get_def(request.word, 
                request.srclang,
                request.tgtlang,
                callback);
    }
    if (request.action == 'isKnown') {
        is_known(request.word, callback);
    }

    if (request.action == 'setKnown') {
        set_known(request.word);
    }

    if (request.action == 'clearStorage') {
        localStorage.clear();
    }
        
    if (request.action == 'setWordlistWord') {
        set_wordlist_word(request.word, request.state);
    }

    if (request.action == 'getWordList') {
        get_wordlist(callback);
    }

    if (request.action == 'showWordlist') {
        show_word_list();
    }

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

