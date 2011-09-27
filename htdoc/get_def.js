
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


function show_word_list() {
    if (inVocabContentScript) {
        chrome.extension.sendRequest({action:'showWordlist'});
        return;
    }

    var win=window.open('','','width=600,height=600')

    var b = win.document.createElement("button");
    b.appendChild(document.createTextNode("Print"));
    win.document.body.appendChild(b);
    $(b).click(function() { win.print() });

    var t = win.document.createElement("table"); 
    t.setAttribute("border", "1px");
    t.style.borderSpacing = "0px";
    t.style.width = "100%";
    t.style.heigth = "90%";

    get_wordlist(function(words) {
        var num = 0;
        var row = win.document.createElement("tr");

        for(var w in words) {
            (function(word) {
                var td = win.document.createElement("td");
                td.style.width = "30%";

                var but = document.createElement("input");
                but.setAttribute("type", "checkbox");
                td.appendChild(but);

                $(but).click(function() {
                    set_wordlist_word(word, 0);
                    td.parentNode.removeChild(td);
                });

                var b = win.document.createElement("b");
                b.appendChild(win.document.createTextNode(word));
                td.appendChild(b);

                var def = localStorage["def." + word]
                if (def) {
                    td.appendChild(win.document.createTextNode(":" + def));
                }
                row.appendChild(td);
                num++;
                if ((num%3) == 0) {
                    t.appendChild(row);
                    row = win.document.createElement("tr");
                }
            })(words[w]);

        }

        t.appendChild(row);
        row = win.document.createElement("tr");        

        win.document.body.appendChild(t);
    });
}
