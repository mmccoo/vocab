
console.log("loading get_def")
if (typeof(inVocabContentScript) === 'undefined') {
    inVocabContentScript = 0;
}

function get_def(word, srclang, tgtlang,
                 callback) {
    //console.log("get def: " + word);

    if (localStorage["def." + word]) {        
        //console.log("get def: " + word + " local");
        callback(localStorage["def." + word]);
    } else if (inVocabContentScript) {
        chrome.extension.sendRequest({
            action:'getDef',
            word:word,
            srclang:srclang,
            tgtlang:tgtlang
        }, callback);
    } else {
        //console.log("get def: " + word + " json");
        jQuery.getJSON("http://mmccoo.com/vocab/get_def.php?word=" + 
                       word + "&src=" + srclang + "&tgt=" + tgtlang + "&callback=?",
                       function(data) {
                           callback(data.def);
                           //console.log("word " + word + " def " + data.def);
                           localStorage["def." + word] = data.def;
                       });
    }
}

function is_known(word, callback) {
    if (localStorage["known." + word] && (localStorage["known." + word] == '1')) {
        console.log("is known local " + word);
        callback(1);
    } else if (inVocabContentScript) {
        console.log("calling get known " + word);
        chrome.extension.sendRequest({action:'isKnown', word:word}, function(known) {
            localStorage["known." + word] = known;
            callback(known);
        });
    }
    callback(0);
}

function set_known(word) {
    localStorage["known." + word] = 1;

    if (inVocabContentScript) {
        console.log("calling set known");
        chrome.extension.sendRequest({action:'setKnown', word:word});
    }
}
                  
function get_wordlist(callback) {
    if (inVocabContentScript) {
        console.log("calling get wordlist");
        chrome.extension.sendRequest({action:'getWordList'}, callback);
        return;
    }

    var words = [];
    for (var i=0; i<localStorage.length; i++) {
        var elt = localStorage.key(i);
        if (!elt.match(/^wordlist\./)) { continue; }
        if (localStorage[elt] != '1') { continue; }
        elt = elt.replace(/^wordlist\./, "");
        words.push(elt);
    }
    callback(words);
}

function set_wordlist_word(word, state) {
    if (inVocabContentScript) {
        chrome.extension.sendRequest({action:'setWordlistWord',
                                      word:word,
                                      state:state
                                     });
        return;
    }
                                      

    localStorage["wordlist." + word] = state;
}
