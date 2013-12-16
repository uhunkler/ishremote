/*
 * Set up the communication logic for the ish. page
 *
 * Establish th connectors to the ish. elements
 * Establish the "ish" communication channel to the server
*/


(function() {
  var $sizeEm, $sizePx, $url, $viewport, debug, ish, keydown, setPlusMinus;

  $sizePx = $(".sg-size-px");

  $sizeEm = $(".sg-size-em");

  $viewport = $("#sg-viewport");

  $url = $("#url");

  debug = 0;

  ish = io.connect("/ish");

  /*
   * Send a keydown event to the element given the first parameter.
   *
   * @PARAM {object}  ele  The jQuery element the keydown event is sent to
   * @PARAM {int}     key  The key number for the keydown event,
   *                       defaults to the return key
  */


  keydown = function(ele, key) {
    var e;
    if (key == null) {
      key = 13;
    }
    e = $.Event("keydown", {
      keyCode: 13
    });
    return ele.trigger(e);
  };

  /*
   * Handle the plusminus triggers.
   *
   * @PARAM {object}  ele  The jQuery element which will be changed
   * @PARAM {int}     val  The value which will be added or subtracted
  */


  setPlusMinus = function(el, val) {
    var v;
    if (val < 0) {
      v = Math.ceil(el.val()) + val;
    } else {
      v = parseInt(el.val()) + val;
    }
    el.val(v);
    return keydown(el);
  };

  /*
   * Set a submit event listener on the URL field
   *
   * When the user enters an URL and submits the form
   * the script sets the src attribute of the iframe holding the web page
  */


  $url.parent("form").on("submit", function(e) {
    var src;
    e.preventDefault();
    src = $url.val();
    if (src.indexOf("http") >= 0) {
      $viewport.attr("src", src);
    }
    return false;
  });

  /*
   * Set a transitionend event listener on the viewport element
   *
   * When the CSS transition ends the event is fired by the browser.
   * Read the viewport width and send the pixel value back to the server.
  */


  $viewport.on("transitionend", function() {
    return ish.emit("sendWidth", $viewport.width());
  });

  /*
   * Set a keydown event listener on the px value element
   *
   * On arrow key up or down in the field get the pixel value and send it back
   * as the new viewport width.
  */


  $sizePx.on("keydown", function(e) {
    var val;
    if (e.keyCode === 38 || e.keyCode === 40) {
      val = Math.floor($(this).val());
      return ish.emit("sendWidth", val);
    }
  });

  /*
   * Set a keydown event listener on the em value element
   *
   * On arrow key up or down in the field get the em value,
   * calculate the pixel value and send it back as the new viewport width.
   * The pixel value is calculated by em * 16 (The default font size in the browser).
  */


  $sizeEm.on("keydown", function(e) {
    var val;
    if (e.keyCode === 38 || e.keyCode === 40) {
      val = Math.floor($(this).val() * 16);
      return ish.emit("sendWidth", val);
    }
  });

  /*
   * Set a jsCmd event listener on the socket to get the messages from node
   *
   * Each event triggers the related ish. interface action. The ish. interface responds
   * the same way as it resonds on user actions.
   * The node backend sends messages recieved from the remote.
  */


  ish.on("jsCmd", function(data) {
    var src;
    if (debug) {
      console.log(data);
    }
    switch (data.cmd) {
      case "size-s":
        return $("#sg-size-s").click();
      case "size-m":
        return $("#sg-size-m").click();
      case "size-l":
        return $("#sg-size-l").click();
      case "size-xl":
        return $("#sg-size-xl").click();
      case "size-random":
        return $("#sg-size-random").click();
      case "size-disco":
        return $("#sg-size-disco").click();
      case "size-hay":
        return $("#sg-size-hay").click();
      case "size-viewport":
        $sizePx.val(data.val);
        return keydown($sizePx);
      case "size-plus5em":
        return setPlusMinus($sizeEm, 5);
      case "size-plus1em":
        return setPlusMinus($sizeEm, 1);
      case "size-plus1px":
        return setPlusMinus($sizePx, 1);
      case "size-minus1px":
        return setPlusMinus($sizePx, -1);
      case "size-minus1em":
        return setPlusMinus($sizeEm, -1);
      case "size-minus5em":
        return setPlusMinus($sizeEm, -5);
      case "set-url":
        src = data.val;
        if (src.indexOf("http://") === 0) {
          return $viewport.attr("src", src);
        }
    }
  });

}).call(this);
