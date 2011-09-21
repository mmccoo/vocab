$(document).ready(function() {
    var colors = new Array("yellow", "green", "orange");
    var colornum = 0;

    var topsection = $("div#spArticleColumn");

    var sections = [];
    topsection.each(function(index) {
        var child = this.firstChild;
        for(var child = this.firstChild; child; child=child.nextSibling) {
            if ((child.nodeType == Node.ELEMENT_NODE) && 
                ((child.nodeName == "P") ||
                 (child.nodeName == "H1") ||
                 (child.nodeName == "H2"))) {
                var scr = $(child).has("script");
                if (scr.length) { continue; }
                var text = child.textContent;
                text = text.replace(/\s+/g, "");
                if (text.length == 0) {
                    continue;
                }
                sections.push(child);
                continue;
            }

            if (child.nodeType == Node.TEXT_NODE) {
                var text = child.nodeValue;
                text = text.replace(/\s+/g, "");
                if (text.length == 0) {
                    continue;
                }

                var newnode = document.createElement("span");
                this.replaceChild(newnode, child);
                newnode.appendChild(child);

                // need to set child so the for loop continues to work.
                child = newnode;
                sections.push(child);
                continue;
            }
        }
    });

    sections = $(sections);
    //sections.each(function(index) { $(this).css("background", colors[index % 3]); });

    vocab_init("de", "en", sections);

});
