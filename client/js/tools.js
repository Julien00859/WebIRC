// Remove all attributes for the given element
// Source: http://stackoverflow.com/a/1870487/4241798
jQuery.fn.removeAttributes = function() {
  return this.each(function() {
    var attributes = $.map(this.attributes, function(item) {
      return item.name;
    });
    var img = $(this);
    $.each(attributes, function(i, item) {
    img.removeAttr(item);
    });
  });
}

// Espace all regexp's special character
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
RegExp.escape = function escape(str){
  return str.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}

// Check if the value given is in the list
Array.prototype.contains = function contains(value) {
  return this.indexOf(value) >= 0;
}
