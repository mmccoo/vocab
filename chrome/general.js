
var domain_selectors = {
    "http://www.bild.de":     "div.txt.clearfix > p",
    "http://www.brigitte.de": "div.p.segment,h1.title,p.teaserText",
    "http://www.stern.de":    ".font"
};
    


$(document).ready(function() {
    var colors = new Array("yellow", "green", "orange");
    var colornum = 0;

    var url = document.URL;
    url = url.match(/https?:\/\/[a-zA-Z0-9\.]+/)[0];

    var selector = domain_selectors[url]
    var sections = $(selector);
    sections.each(function(index) {
    //    $(this).css("background", colors[index % 3]);
    });

    vocab_init("de", "en", sections);

});