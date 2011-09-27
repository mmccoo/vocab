
$(document).ready(function() {
    var colors = new Array("yellow", "green", "orange");
    var colornum = 0;

    var sections = $(".font");
    sections.each(function(index) {
//        $(this).css("background", colors[index % 3]);
    });

    vocab_init("de", "en", sections);

});
