
if (typeof(window.console) === 'undefined') {
    window.console = {
        log: function(str) {}
    };
}

function vocab_init(src, tgt, sections) {
    console.log("calling Vocab init");

      $(document).ready(function() {
          var v = new Vocab(sections);

          moveBody();
          v.set_from_lang(src);
          v.set_to_lang(tgt);
          v.create_sidebar_table();
          v.add_p_defs();
          v.add_common_defs();         
      });
}

function nocase_compare(x,y) {
    return x.toString().toUpperCase().localeCompare(y.toString().toUpperCase());
} 

jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
};

function keys(obj)
{
    var keys = [];

    for(var key in obj) {
        keys.push(key);
    }

    return keys;
}


function Vocab(sections_in) {
    var x = 10;
    var word_rows = {};
    var word_order = [];
    var word_checked = {};
    var word_buttons = {};
    var word_list = {};
    var current_sections = [];
    var top_p;
    var bottom_p;

    var sidebar;
    var vobj = this;

    var srclang = "de";
    var tgtlang = "en";

    var console;

    var common_words;
    var common_div;

    this.keypress = function(event) {
	alert("key");
    }
    $(document).bind('keydown', 'p', function(event) { 
	vobj.add_p_defs(1);
    });
    $(document).bind('keydown', 'n', function(event) {
	vobj.add_p_defs(0);
	
    });

    $(document).bind('keydown', 'k', function(event) {
	vobj.set_known();
    });

    var sections;
    
    if (sections_in) {
        sections = sections_in;
    } else {
        sections = $('div')
	    .filter(function() {
	        return this.className.match(/calibre/);
	    });
        sections = sections.add('p');
    }

    sections.each(function(index) {
	var fn = function() {
	    localStorage["lastsection." + document.URL] = index+1;
	    top_p = bottom_p = undefined;
	    vobj.add_p_defs(0);
	};
	$(this).click(fn);
    });

    this.set_from_lang = function(lang) {
	srclang = lang;
    };
    this.set_to_lang = function(lang) {
	tgtlang = lang;
    };

    this.write_console = function(str) {
	if (!console) { return; }
	while(console.hasChildNodes()) {
	    console.removeChild(console.firstChild);
	}
	console.appendChild(document.createTextNode(str));
    }

    this.set_known = function() {
        for(var w in word_checked) {
            if (!word_checked[w]) {
                continue;
            }
            set_known(w);
            for (var i in word_rows[w]) {
                var row = word_rows[w][i];
                if (row && row.parentNode) {
                    row.parentNode.removeChild(row);
                }
            }
            word_rows[w] = undefined;
        }
    };

    this.add_word_to_wordlist = function() {
        for(var w in word_checked) {
            if (!word_checked[w]) {
                continue;
            }

            $(word_buttons[w]).attr('checked', false);
            word_checked[w] = 0;

            set_wordlist_word(w, 1);
        }
    }


    this.show_known = function() {
        while(document.body.hasChildNodes()) {
            document.body.removeChild(document.body.firstChild);
        }

        var table = document.createElement("table");
        for (var elt in localStorage) {
            if (!elt.match(/^known\./)) { continue; }
            elt = elt.replace(/^known\./, "");

            var tr = document.createElement("tr");
            var td = document.createElement("td");
            td.appendChild(document.createTextNode(elt));
            tr.appendChild(td);
            table.appendChild(tr);
        }

        document.body.appendChild(table);
    }

    this.create_sidebar_table = function() {
        var d = document.createElement("div");
        d.style.position="fixed";
        d.style.top="0px";
        d.style.left="0px";
        d.style.textAlign="left";

        d.style.width="400px";

        var buttons = document.createElement("div");

        console = document.createElement("span");
        buttons.appendChild(console);

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Set Known"));
        buttons.appendChild(b);
        $(b).click(this.set_known);

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Show Common"));
        buttons.appendChild(b);
        $(b).click(function() {
            $(common_div).show();
        });

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Show Known"));
        buttons.appendChild(b);
        $(b).click(this.show_known);


        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Select All"));
        buttons.appendChild(b);
        $(b).click(function() {
            for (var i in word_buttons) {
                $(word_buttons[i]).attr('checked', true);
            }
            for (i in word_order) {
                word_checked[word_order[i]] = 1;
            }
        });

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Unselect All"));
        buttons.appendChild(b);
        $(b).click(function() {
            for (var i in word_buttons) {
                $(word_buttons[i]).attr('checked', false);
            }
            for (i in word_order) {
                word_checked[word_order[i]] = 0;
            }

        });

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Add word to wordlist"));
        buttons.appendChild(b);
        $(b).click(this.add_word_to_wordlist);

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Show wordlist"));
        buttons.appendChild(b);
        $(b).click(show_word_list);



        var localpopup = document.createElement("div");
        localpopup.style.top="50px";
        localpopup.style.left="500px";
        localpopup.style.backgroundColor="lightGrey";
        localpopup.style.borderStyle="solid";
        localpopup.style.borderWidth="1px";
        localpopup.style.position="fixed";
        localpopup.style.zIndex = 100;
        localpopup.appendChild(document.createTextNode("Clearing local clears the entire memory of your known words. You'll need to start over. Are you sure this is what you want to do?"));
        var localok = document.createElement("button");
        localok.appendChild(document.createTextNode("Ok"));
        $(localok).click(function() {
            $(localpopup).hide();
            localStorage.clear()
        });
        localpopup.appendChild(localok);

        var localcancel = document.createElement("button");
        localcancel.appendChild(document.createTextNode("Cancel"));
        $(localcancel).click(function() {
            $(localpopup).hide();
        });
        localpopup.appendChild(localcancel);
        document.body.appendChild(localpopup);
        $(localpopup).hide();

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Clear Local"));
        buttons.appendChild(b);
        $(b).click(function() {
            $(localpopup).show();
        });

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Clear Global"));
        buttons.appendChild(b);
        $(b).click(function() {
            chrome.extension.sendRequest({ action:'clearStorage'});
        });


        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Local2Global"));
        buttons.appendChild(b);
        $(b).click(function() {
            for (var elt in localStorage) {
                if (!elt.match(/^known\./)) { continue; }
                if (localStorage[elt] != '1') { continue; }
                elt = elt.replace(/^known\./, "");
                set_known(elt);
            }
        });


        d.appendChild(buttons);
        document.body.appendChild(d);

        var words = document.createElement("div");
        words.style.height=(window.innerHeight-buttons.clientHeight) + "px"
        words.style.overflow="auto";

        var t = document.createElement("table");
        t.setAttribute("border", "1px");
        t.style.borderSpacing = "0px";

        words.appendChild(t);

        d.appendChild(words);


        sidebar = t;


        common_div = document.createElement("div");
        common_div.style.top="50px";
        common_div.style.left="500px";
        common_div.style.backgroundColor="lightGrey";
        common_div.style.borderStyle="solid";
        common_div.style.borderWidth="1px";
        common_div.style.position="fixed";
        common_div.style.textAlign="left";
        common_div.style.zIndex="100";

        var common_buttons = document.createElement("div");
        
        var close = document.createElement("button");
        close.appendChild(document.createTextNode("close"));
        common_buttons.appendChild(close);
        $(close).click(function() { $(common_div).hide(); });

        common_buttons.appendChild(close);

        var b = document.createElement("button");
        b.appendChild(document.createTextNode("Set Known"));
        common_buttons.appendChild(b);
        $(b).click(function() {
            vobj.set_known();            
            vobj.add_common_defs();
        });

        common_div.appendChild(common_buttons);

        var common_words_div = document.createElement("div");
        common_words_div.style.overflow="auto";
        common_words_div.style.width = "800px";
        common_words_div.style.height = "95%";

        common_div.style.height = "90%";

        common_words = document.createElement("table");
        common_words.setAttribute("border", "1px");
        common_words.style.borderSpacing = "0px";

        common_words_div.appendChild(common_words);
        common_div.appendChild(common_words_div);

        document.body.appendChild(common_div);
        $(common_div).hide();

    };

    this.add_words = function(word_freqs, tableptr, shownum) {
        displayed_words = keys(word_freqs).sort(nocase_compare);
        for (var i in displayed_words) { 
            (function(word) {
                word_order.push(word); 

                var r = document.createElement("tr");       
                var td = document.createElement("td");
                var but = document.createElement("input");
                but.setAttribute("type", "checkbox");
                $(but).click(function(event) { 
                    if (event.shiftKey && lastSelected) {
                        for (var i in word_order) {
                            var inshift;
                            if ((word_order[i] == word) ||
                                (word_order[i] == lastSelected)) {
                                inshift = !inshift;
                            }
                            if (inshift && word_buttons[word_order[i]]) {
                                $(word_buttons[word_order[i]]).attr('checked', true);
                                word_checked[word_order[i]] = 1;
                                var i = 10;
                            }
                        }
                    }
                    word_checked[word] = $(this).is(':checked');
                    lastSelected = word;
                });
                word_buttons[word] = but;
                td.appendChild(but);
                r.appendChild(td);

                if (shownum) {
                    td = document.createElement("td");
                    td.appendChild(document.createTextNode(word_freqs[word]));
                    r.appendChild(td);
                }
                
                td = document.createElement("td");
                var em = document.createElement("b");
                em.appendChild(document.createTextNode(word + ": "));
                td.appendChild(em);

                get_def(word, srclang, tgtlang,
                        function(def) { 
                            td.appendChild(document.createTextNode(def)); 
                        });
                r.appendChild(td);

                tableptr.appendChild(r);
                if (word_rows[word] == undefined) {
                    word_rows[word] = [];
                }
                word_rows[word].push(r);
                
                is_known(word, function(known) {
                    if (!known) { return; }
                    for(var w in word_rows[word]) {
                        word_rows[word][w].parentNode.removeChild(word_rows[word][w]);
                    }
                });

                var i = 10;
            })(displayed_words[i]);
	}
    };

    this.get_words_from_text = function(str, displayed_words) {
        var numadded = 0;

        var text = str.split(/[\u0021-\u002f\u003a-\u0040\u005b-\u005f\u00A1-\u00BF\:\,\. \t\n]+/).sort(nocase_compare);
	var lastSelected;
        for(var i in text) {
            var word = text[i];           
            if (word.length == 0) {
                continue;
            }
            if (word.match(/^[0-9]+$/)) {
                continue;
            }

            // at this point I'll only exclude words if they're already known in thei localstorage
            // in the next section. I use the get known function which will delete a row.
            if (localStorage["known." + word] && (localStorage["known." + word] == '1')) { 
                window.console.log("skipping " + word);
                continue; 
            }
	    numadded++;
            if (displayed_words[word] == undefined) {
                displayed_words[word] = 0;
            }
	    displayed_words[word]++;

	}

        return numadded;
    };

    this.add_common_defs = function() {
        var word_freq = {};
        sections.each(function(index) {
            vobj.get_words_from_text($(this).text(), word_freq);
        });

        var common = [];
        for (var key in word_freq) {
            common.push(key);
        }

        common = common.sort(function(a,b) {
            return word_freq[b] - word_freq[a];
        });

        var displayed_words = {};
        for(var i=0; i<common.length; i++) {
            if (i>30) { break; }
            displayed_words[common[i]] = word_freq[common[i]];
        }

        while(common_words.hasChildNodes()) {
	    common_words.removeChild(common_words.firstChild);
	}
        vobj.add_words(displayed_words, common_words, 1);
    };

    this.add_p_defs = function(rev) {
	var numadded = 0;

	//var ps = $('p');
	var ps = sections;
	if (rev) { ps = ps.reverse(); }

	var pivot = bottom_p;
	if (rev) { pivot = top_p; }

	if (!pivot) {
	    var last_section_num = localStorage["lastsection." + document.URL];	    
	}

	top_p = undefined;
	bottom_p = undefined;

	for (var i in current_sections) {
	    current_sections[i].style.backgroundColor = "white";
	}
	current_sections = [];

	while(sidebar.hasChildNodes()) {
	    sidebar.removeChild(sidebar.firstChild);
	}

	var displayed_words = {};
	
	var section_num = 0;
        ps.each(function(index) {
	    section_num++;

	    if (numadded > 5) { return false; }

	    if (last_section_num) {
		if (section_num == last_section_num) { 
                    last_section_num = undefined; 
                } else {
		    return;
                }
	    }

	    if (pivot) {
		if (this == pivot) { pivot = undefined; }
		return;
	    }

	    if (!top_p) {
		var off = $(this).offset().top;
		$(document).scrollTop($(this).offset().top);
	    }
	    
            if (!element_visible(this)) {
                return;
            }

	    // I want top_p to be the upper paragraph. In the case of reverse, that
	    // will be the last one seen.	  
	    if (!top_p || rev) { 
		if (rev) {
		    localStorage["lastsection." + document.URL] = ps.size() - section_num + 1;
		} else {
		    localStorage["lastsection." + document.URL] = section_num;
		}

		top_p = this; 
	    }
	    if (!bottom_p || !rev) { bottom_p = this; }

	    this.style.backgroundColor = "yellow";
	    current_sections.push(this);

            numadded += vobj.get_words_from_text($(this).text(), displayed_words);
	});

	vobj.add_words(displayed_words, sidebar)	


    }

}




function moveFixedElements() {
    var allDivs = document.getElementsByTagName("div");
    for(var i=0; i<allDivs.length; i++)
    {
        var div = allDivs[i];
        if(!div.suMoved)
        {
            // var style = window.getComputedStyle(div);
            // if(style.position == "fixed")
            // {
            //     if(div.getAttribute("id") != "__su__tbcont")
            //     {
            //         var top = style.top;
            //         var nOldSpot = top ? parseInt(top) : 0;
            //         var nNewSpot = nOldSpot + this.toolbarHeight;
            //         div.style.top = nNewSpot + "px";
            //         div.suMoved = true;
            //     }
            // }
        }
    }
}
        
function moveBody() {
    if(document.body.tagName.toLowerCase() != "frameset") {
        
        // Directly position the body to make room for our toolbar.  This may seem redundant
        // with the code above that appends a <style> element to do the same thing, but this
        // takes care of overriding other potentially conflicting style settings directly. 
        document.body.style.position = "relative";
        document.body.style.left = "0px";
        document.body.style.marginLeft = 400 + "px";
        
        // Move the fixed elements down.
        moveFixedElements();
        //window.addEventListener("load", function() {
        //    me.moveFixedElements();
        //}, false);
        // Workaround for jQuery tipsy tooltips which are incorrectly position due to
        // this bug:  http://plugins.jquery.com/node/13807
        // Workaround is needed for Twitter because the tooltip ends up covering buttons and
        // thus breaking them.
        //document.body.addEventListener("DOMNodeInserted", everyPageCode.onDOMNodeInserted, false);
    }
}


function element_visible(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
      (top >= window.pageYOffset && left >= window.pageXOffset) ||
	  ((top + height) <= (window.pageYOffset + window.innerHeight) &&
	   (left + width) <= (window.pageXOffset + window.innerWidth))
  );
}

function highlight_visible() {
 $('p').each(function(index) {   
     if (element_visible(this)) {
         this.style.backgroundColor = "yellow";
     }
 });        
}