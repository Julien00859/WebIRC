var messageParser = {
  urlRE: new RegExp("http(s)?://?([A-Za-z0-9\-_%]{1,}\.)?[A-Za-z0-9\-_%]{1,}\.(com|edu|info|net|org|gov|be|fr)(:[0-9]{1,5})?(/[A-Za-z0-9\-/_%\.?=+]{0,})?", "g"),

  smileys: [":)",":(",":D","xD","(cool)",":o",";)","(chuckle)",":'(","(fear)",":|","(kiss)",":p",":$","(wait)","(angel)",":x","(devil)","(wasntme)","(party)",":@","(doh)","]:)","(yawn)","(inlove)",":^)","(idontcare)","(heidy)","<3","(star)","(handshake)","(n)","(y)","(emo)","(clap)","(rofl)","(punch)","(bug)","(headbang)","(clock)","(punch)","(drunk)","(smartphone)","(film)","(mail)","(brokenheart)","(cake)","(music)","($)","(pizza)","(cafe)","(sun)","(flex)","(tmi)","(flower)","(smoke)"],

  parse: function parse(message) {
    // On crée un élément html factice sur lequel on va travailler
    var dom = $("<div></div>");
    dom.html(message)

    // Première étape: escaper toutes les balises <code> et les balises <a>
    // Et marquer ces balises par un attribut unique.
    var codeNodes = []
    $("code", dom).each(function(index, node){
      codeNodes.push(node.cloneNode(true))
    }).empty().removeAttributes().attr("internalParsing", true)

    var aNodes = []
    $("a", dom).each(function(index, node){
      aNodes.push(node.cloneNode(true))
    }).empty().removeAttributes().attr("internalParsing", true)

    // Deuxième étape: on effectue les regex
    dom.html(dom.html().replace(this.urlRE, "<a href='$&' target=_blank>$&</a>"))
    for (var i in this.smileys) {
      dom.html(dom.html().replace(this.smileys[i], "<span class='sprites' name='$&'></span>"))
    }

    // Troisième étape: On restaure le contenu des balises
    if (codeNodes) {
      $("code[internalParsing=true]", dom).each(function(index, node) {
        node.parentNode.replaceChild(codeNodes[index], node)
      })
    }
    if (aNodes) {
      $("a[internalParsing=true]", dom).each(function(index, node) {
        node.parentNode.replaceChild(aNodes[index], node)
      })
    }

    return dom.html()
  }
}

// http://stackoverflow.com/a/1870487/4241798
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
