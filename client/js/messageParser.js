var messageParser = {
  // Regexp that find urls
  urlRE: new RegExp("http(s)?://?([A-Za-z0-9\-_%]{1,}\.)?[A-Za-z0-9\-_%]{1,}\.(com|edu|info|net|org|gov|be|fr)(:[0-9]{1,5})?(/[A-Za-z0-9\-/_%\.?=+]{0,})?", "g"),

  // List of smileys available
  smileys: [
    "(smile)",
    "(sad)",
    "(happy)",
    "(laugh)",
    "(cool)",
    "(shocked)",
    "(twinkle)",
    "(chuckle)",
    "(sad)",
    "(fear)",
    "(agape)",
    "(kiss)",
    "(pullthetong)",
    "(shy)",
    "(wait)",
    "(angel)",
    "(embarrassed)",
    "(devil)",
    "(wasntme)",
    "(party)",
    "(rage)",
    "(doh)",
    "(machiavellian)",
    "(yawn)",
    "(inlove)",
    "(wonder)",
    "(idontcare)",
    "(heidy)",
    "(love)",
    "(star)",
    "(handshake)",
    "(no)",
    "(yes)",
    "(emo)",
    "(clap)",
    "(rofl)",
    "(punch)",
    "(bug)",
    "(headbang)",
    "(clock)",
    "(punch)",
    "(drunk)",
    "(smartphone)",
    "(film)",
    "(mail)",
    "(brokenheart)",
    "(cake)",
    "(music)",
    "(dollar)",
    "(pizza)",
    "(cafe)",
    "(sun)",
    "(flex)",
    "(tmi)",
    "(flower)",
    "(smoke)",
    "(sleep)"
  ],

  // Aliases for smileys
  altSmileys: {
    ":)":"smile",
    ":D":"happy",
    ":(":"sad",
    "xD":"laugh",
    ":o":"shocked",
    ";)":"twinkle",
    ":|":"agape",
    ":'(":"cry",
    ":x":"embarrassed",
    ":$":"sky",
    ":p":"pullthetong",
    "è_é":"machiavellian",
    "é_è":"agape"
  },

  // Function that parse the given message to apply html/css changements
  parse: function parse(message) {
    // On crée un élément html factice sur lequel on va travailler
    var dom = $("<div></div>");
    dom.html(message)

    // Première étape: Localiser les balises code et les balises a
    // Le contenu de ces balises est escapé pour empêcher toute modification
    // Ces balises sont marqués pour restaurer leur contenu une fois toutes les regex effectuées
    var codeNodes = []
    $("code", dom).each(function(index, node){
      codeNodes.push(node.cloneNode(true))
    }).empty().removeAttributes().attr("internalParsing", true)

    var aNodes = []
    $("a", dom).each(function(index, node){
      aNodes.push(node.cloneNode(true))
    }).empty().removeAttributes().attr("internalParsing", true)

    // Deuxième étape: on effectue les regex

    // Localise les URL et leur ajoute une balise <a> qui ouvre l'url dans un nouvel onglet
    dom.html(dom.html().replace(this.urlRE, "<a href='$&' target=_blank>$&</a>"))

    // Localise les smileys (mot) et remplace le mot détécté par le smiley (image) associée
    for (var i in this.smileys) {
      dom.html(dom.html().replace(new RegExp(RegExp.escape(this.smileys[i]), "gi"), function (smiley) {
        return "<span class='sprites " + smiley.slice(1,smiley.length-1) + "'></span>";
      }));
    }

    // Localise les aliases de smileys (mot) et replace l'alias pour le smiley (image) associée
    var altSmileysKeys = Object.keys(this.altSmileys);
    for (var i in altSmileysKeys) {
      dom.html(dom.html().replace(new RegExp(RegExp.escape(altSmileysKeys[i]), "gi"), function(smiley) {
        return "<span class='sprites " + messageParser.altSmileys[smiley] + "'></span>";
      }));
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
