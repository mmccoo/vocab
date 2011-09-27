
window.inVocabContentScript = 1;

jQuery.getJSON = function(url, callback) {
  console.log("calling JSON");
  chrome.extension.sendRequest({action:'getJSON',url:url}, callback);
}

jQuery.ajax = function(url, callback, type, async) {
  console.log("calling ajax");
  chrome.extension.sendRequest({action:'ajax',url:url, type:type, async:async}, callback);
}
 
jQuery.get = function(url, callback) {
  console.log("sending get");
  chrome.extension.sendRequest({action:'get',url:url}, callback);
}
 
jQuery.post = function(url, data, callback) {
  console.log("sending post");
  chrome.extension.sendRequest({action:'post', data: data, url:url}, callback);
}


// create the nodeType constants if the Node object is not defined
if (!window.Node){
  var Node =
      {
        ELEMENT_NODE                :  1,
        ATTRIBUTE_NODE              :  2,
        TEXT_NODE                   :  3,
        CDATA_SECTION_NODE          :  4,
        ENTITY_REFERENCE_NODE       :  5,
        ENTITY_NODE                 :  6,
        PROCESSING_INSTRUCTION_NODE :  7,
        COMMENT_NODE                :  8,
        DOCUMENT_NODE               :  9,
        DOCUMENT_TYPE_NODE          : 10,
        DOCUMENT_FRAGMENT_NODE      : 11,
        NOTATION_NODE               : 12
      };
}
