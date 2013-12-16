###
 * The remote logic
 *
 * Each event sent by socket.io form the backend triggers the related ish.
 * interface action.
###
try
  # Initialize FastClick to remove the 300ms click delay on mobiles
  FastClick.attach document.body

  # Save jQuery objects for the elements we work with
  $body = $("body").eq(0)
  $page = $("#page")
  $out = $(".status-out").eq(0)
  $dial = $(".dial").eq(0)
  $displayArea = $("#display-area")
  $displays = $displayArea.find(".display")
  $areaButtonArea = $("#page-buttons")
  $areaButtons = $areaButtonArea.find("button")
  areaButtonHash = ["ish-btns", "knob", "plusminus"]
  areaButtonLength = areaButtonHash.length
  $ishBtns = $("#ish-btns")
  $knob = $("#knob")
  $plusminus = $("#plusminus")
  debug = 0

  # simple helper function for a touch button highlight
  $.fn.highlight = (options) ->
   options = $.extend({}, {
     className: 'hovered'
     delay: 100
   }, options)

   this.each( ->
     ((elem, cName, time) ->
       setTimeout( ->
         elem.removeClass(cName)
       , time)
       elem.addClass(cName)
     )($(this), options.className, options.delay)
   )

  ###
   * Switch the dislayed button area
   *
   * Delegate the page switcher button events to the section container
   * Remove the "selected" CSS class and hide all display pages,
   * add the "selected" CSS class to the clicked button and show
   * the connected area. The ID of the dispaly area connected to the button
   * is saved in the buttons "data-display" attribute.
  ###
  activatePageBtns = ->
    $ishBtns.removeClass("s-hide").addClass("s-all")
    $knob.removeClass("s-all").addClass("s-hide")
    $plusminus.removeClass("s-all").addClass("s-hide")
    $areaButtonArea.on "click", "button", (e) ->
      $that = $(this)
      $areaButtons.removeClass("selected")
      $displays.removeClass("s-all").addClass("s-hide")
      $that.addClass "selected"
      eleID = $that.data "display"
      $("#" + eleID).removeClass("s-hide").addClass("s-all")
    $page.swipe({
      excludedElements: "canvas, .noSwipe",
      swipe: (event, direction, distance, duration, fingerCount) ->
        btn = $areaButtonArea.find(".selected").eq(0)
        areaID = btn.data "display"
        index = $.inArray areaID, areaButtonHash

        if direction is "left"
          if areaButtonLength is index + 1
            index = 0
          else
            index += 1
          el = $("." + areaButtonHash[index])
          el.trigger("click")
        else if direction is "right"
          if 0 is index
            index = areaButtonLength - 1
          else
            index -= 1
          el = $("." + areaButtonHash[index])
          el.trigger("click")
    })

  deactivatePageBtns = ->
    $ishBtns.removeClass("s-hide").addClass("s-all")
    $knob.removeClass("s-all").addClass("s-hide")
    $plusminus.removeClass("s-all").addClass("s-hide")
    $areaButtonArea.off("click")
    $page.swipe "destroy"

  # Activate the socket.io connection and save a reference in a variable
  # The "remote" channel is used for the backend - remote communication
  remote = io.connect "/remote"

  ###
   * Inititalize the display
   *
   * Set a sendMaxWidth event listener on the remote socket to get the messages from node.
   * With the sendMaxWidth event the display data for the pixel and em values and the
   * value for the dial are submitted.
  ###
  remote.on "sendMaxWidth", (data) ->
    # Initialize the knob dial
    # Parameter explanations https://github.com/aterrien/jQuery-Knob
    $dial.val data.val
    $dial.knob {
      min: 0
      max: data.maxWidth
      cursor: 20
      fgColor: "#2e7efb"
      thickness: .5
      width: 300
      height: 260
      angleOffset: -125
      angleArc: 250
      change: (val) ->
        remote.emit "remoteCmd", {cmd: "knob", val: val}
        $dial.val val
    }

    # Set up the page layout for small screens as the default
    if $body.width() <= 640
      activatePageBtns()

    ###
     * enquire.js is a lightweight, pure JavaScript library for responding
     * to CSS media queries. http://wicky.nillia.ms/enquire.js/
     *
     * Register a media query for medium width screens.
     * Exchange the position of the plus/minus button area and the knob
     * to move the knob behind the plus/minus buttons area
     * The knob comes second in the DOM but shall be shown below the buttons
     * so it must be moved behind the plus/minus buttons
    ###
    enquire
    .register("screen and (min-width: 40em) and (max-width: 59.9375em)", {
      match: ->
        $displayArea.append $knob
        return true
      unmatch: ->
        $displayArea.append $plusminus
        return true
    })
    .register("screen and (max-width: 40em)", {
      match: ->
        deactivatePageBtns()
        activatePageBtns()
        return true
      unmatch: ->
        deactivatePageBtns()
        return true
    })

  ###
   * Send a keydown event to the given element
   *
   * @PARAM {object}  ele  The jQuery element the keydown event is sent to
   * @PARAM {int}     key  The key number for the keydown event,
   *                       defaults to the return key
  ###
  keydown = (ele, key = 13) ->
    e = $.Event "keydown", {keyCode: 13}
    ele.trigger e

  # Simulate a visual :hover feedback by this functions bound to touch events.
  # Add/remove the "hovered" class on the buttons
  # on the "touchstart" and "touchend" event.
  #$('button').on 'touchstart', (e) -> $(this).addClass("hovered")
  #$('button').on 'touchend', (e) -> $(this).removeClass("hovered")

  ###
   * Handle the -/+ button clicks
   *
   * Bind the "click" listener to the -/+ buttons. With each click
   * send the button id as the command name to the backend to
   * trigger the ish. action from node
  ###
  $plusminus.on "click", "button", (e) ->
    $(this).highlight()
    id = $(this).attr "id"
    console.log(id + " clicked") if debug
    remote.emit "remoteCmd", {cmd: id, val: 0}

  ###
   * Handle the ish. button clicks
   *
   * Bind the "click" listener to the ish. buttons. With each click
   * send the button id as the command name to the backend to
   * trigger the ish. action.from node
  ###
  $ishBtns.on "click", "button", (e) ->
    $(this).highlight()
    id = $(this).attr "id"
    console.log(id + " clicked") if debug
    remote.emit "remoteCmd", {cmd: id, val: 0}

  ###
   * Set a sendWidth event listener on the remote socket to get the messages
   *
   * With the sendWidth event the display data for the pixel and em values and the
   * value for the dial are submitted.
  ###
  remote.on "sendWidth", (data) ->
    $out.html data.pxem
    $dial.val(data.val).trigger "change"

  # Hack for the iOS7 matchMedia bug - force a reflow after a window resize
  # Needed for enquire to read media queries reliable
  # https://github.com/WickyNilliams/enquire.js/issues/79
  if document.addEventListener
    document.addEventListener "DOMContentLoaded", ->
      shim = document.createElement "div"
      shim.id = "ios7-matchMedia-fix"
      document.body.appendChild shim

      forceReflow = ->
          shim.style.width = (window.innerWidth / 2) + "px"
      onResize = ->
          clearTimeout timer
          timer = setTimeout forceReflow, 10

      # window.addEventListener "resize", onResize, false
      window.addEventListener "resize", forceReflow, false
catch error
  alert error.message
