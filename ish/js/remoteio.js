/*
 * The remote logic
 *
 * Each event sent by socket.io form the backend triggers the related ish.
 * interface action.
*/


(function() {
  var $areaButtonArea, $areaButtons, $body, $dial, $displayArea, $displays, $ishBtns, $knob, $out, $page, $plusminus, activatePageBtns, areaButtonHash, areaButtonLength, deactivatePageBtns, debug, error, keydown, remote;

  try {
    FastClick.attach(document.body);
    $body = $("body").eq(0);
    $page = $("#page");
    $out = $(".status-out").eq(0);
    $dial = $(".dial").eq(0);
    $displayArea = $("#display-area");
    $displays = $displayArea.find(".display");
    $areaButtonArea = $("#page-buttons");
    $areaButtons = $areaButtonArea.find("button");
    areaButtonHash = ["ish-btns", "knob", "plusminus"];
    areaButtonLength = areaButtonHash.length;
    $ishBtns = $("#ish-btns");
    $knob = $("#knob");
    $plusminus = $("#plusminus");
    debug = 0;
    $.fn.highlight = function(options) {
      options = $.extend({}, {
        className: 'hovered',
        delay: 100
      }, options);
      return this.each(function() {
        return (function(elem, cName, time) {
          setTimeout(function() {
            return elem.removeClass(cName);
          }, time);
          return elem.addClass(cName);
        })($(this), options.className, options.delay);
      });
    };
    /*
     * Switch the dislayed button area
     *
     * Delegate the page switcher button events to the section container
     * Remove the "selected" CSS class and hide all display pages,
     * add the "selected" CSS class to the clicked button and show
     * the connected area. The ID of the dispaly area connected to the button
     * is saved in the buttons "data-display" attribute.
    */

    activatePageBtns = function() {
      $ishBtns.removeClass("s-hide").addClass("s-all");
      $knob.removeClass("s-all").addClass("s-hide");
      $plusminus.removeClass("s-all").addClass("s-hide");
      $areaButtonArea.on("click", "button", function(e) {
        var $that, eleID;
        $that = $(this);
        $areaButtons.removeClass("selected");
        $displays.removeClass("s-all").addClass("s-hide");
        $that.addClass("selected");
        eleID = $that.data("display");
        return $("#" + eleID).removeClass("s-hide").addClass("s-all");
      });
      return $page.swipe({
        excludedElements: "canvas, .noSwipe",
        swipe: function(event, direction, distance, duration, fingerCount) {
          var areaID, btn, el, index;
          btn = $areaButtonArea.find(".selected").eq(0);
          areaID = btn.data("display");
          index = $.inArray(areaID, areaButtonHash);
          if (direction === "left") {
            if (areaButtonLength === index + 1) {
              index = 0;
            } else {
              index += 1;
            }
            el = $("." + areaButtonHash[index]);
            return el.trigger("click");
          } else if (direction === "right") {
            if (0 === index) {
              index = areaButtonLength - 1;
            } else {
              index -= 1;
            }
            el = $("." + areaButtonHash[index]);
            return el.trigger("click");
          }
        }
      });
    };
    deactivatePageBtns = function() {
      $ishBtns.removeClass("s-hide").addClass("s-all");
      $knob.removeClass("s-all").addClass("s-hide");
      $plusminus.removeClass("s-all").addClass("s-hide");
      $areaButtonArea.off("click");
      return $page.swipe("destroy");
    };
    remote = io.connect("/remote");
    /*
     * Inititalize the display
     *
     * Set a sendMaxWidth event listener on the remote socket to get the messages from node.
     * With the sendMaxWidth event the display data for the pixel and em values and the
     * value for the dial are submitted.
    */

    remote.on("sendMaxWidth", function(data) {
      $dial.val(data.val);
      $dial.knob({
        min: 0,
        max: data.maxWidth,
        cursor: 20,
        fgColor: "#2e7efb",
        thickness: .5,
        width: 300,
        height: 260,
        angleOffset: -125,
        angleArc: 250,
        change: function(val) {
          remote.emit("remoteCmd", {
            cmd: "knob",
            val: val
          });
          return $dial.val(val);
        }
      });
      if ($body.width() <= 640) {
        activatePageBtns();
      }
      /*
       * enquire.js is a lightweight, pure JavaScript library for responding
       * to CSS media queries. http://wicky.nillia.ms/enquire.js/
       *
       * Register a media query for medium width screens.
       * Exchange the position of the plus/minus button area and the knob
       * to move the knob behind the plus/minus buttons area
       * The knob comes second in the DOM but shall be shown below the buttons
       * so it must be moved behind the plus/minus buttons
      */

      return enquire.register("screen and (min-width: 40em) and (max-width: 59.9375em)", {
        match: function() {
          $displayArea.append($knob);
          return true;
        },
        unmatch: function() {
          $displayArea.append($plusminus);
          return true;
        }
      }).register("screen and (max-width: 40em)", {
        match: function() {
          deactivatePageBtns();
          activatePageBtns();
          return true;
        },
        unmatch: function() {
          deactivatePageBtns();
          return true;
        }
      });
    });
    /*
     * Send a keydown event to the given element
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
     * Handle the -/+ button clicks
     *
     * Bind the "click" listener to the -/+ buttons. With each click
     * send the button id as the command name to the backend to
     * trigger the ish. action from node
    */

    $plusminus.on("click", "button", function(e) {
      var id;
      $(this).highlight();
      id = $(this).attr("id");
      if (debug) {
        console.log(id + " clicked");
      }
      return remote.emit("remoteCmd", {
        cmd: id,
        val: 0
      });
    });
    /*
     * Handle the ish. button clicks
     *
     * Bind the "click" listener to the ish. buttons. With each click
     * send the button id as the command name to the backend to
     * trigger the ish. action.from node
    */

    $ishBtns.on("click", "button", function(e) {
      var id;
      $(this).highlight();
      id = $(this).attr("id");
      if (debug) {
        console.log(id + " clicked");
      }
      return remote.emit("remoteCmd", {
        cmd: id,
        val: 0
      });
    });
    /*
     * Set a sendWidth event listener on the remote socket to get the messages
     *
     * With the sendWidth event the display data for the pixel and em values and the
     * value for the dial are submitted.
    */

    remote.on("sendWidth", function(data) {
      $out.html(data.pxem);
      return $dial.val(data.val).trigger("change");
    });
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", function() {
        var forceReflow, onResize, shim;
        shim = document.createElement("div");
        shim.id = "ios7-matchMedia-fix";
        document.body.appendChild(shim);
        forceReflow = function() {
          return shim.style.width = (window.innerWidth / 2) + "px";
        };
        onResize = function() {
          var timer;
          clearTimeout(timer);
          return timer = setTimeout(forceReflow, 10);
        };
        return window.addEventListener("resize", forceReflow, false);
      });
    }
  } catch (_error) {
    error = _error;
    alert(error.message);
  }

}).call(this);
