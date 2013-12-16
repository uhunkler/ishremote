###
 * ishremote
 * https://github.com/uhunkler/ishremote
 *
 * Copyright (c) 2013 Urs Hunkler
 * Licensed under the MIT license.
###

"use strict";

# Load the basic modules for command line handling
path = require("path")
optimist = require("optimist")
config = require("../config.js")
debug = 0
wVal = {px: "", em: "", val: 0}

# set up the command line hanling
argv = optimist
  .usage("Open your browser to remote control Brad Frost's ish.\nUsage: $0")
  .describe({
    i: "The local server IP"
    p: "The local server port"
    u: "The URL for the initally opened web page"
    b: "Set the browser to open and run ish. (OS X only, Safari or \"Google Chrome\")"
    x: "Set the browser window width (OS X only, Safari or \"Google Chrome\")"
    y: "Set the browser window height (OS X only, Safari or \"Google Chrome\")"
    d: "1 - Show debug messages"
    h: "This help"
    })
    .default(config)
    .argv

host = argv.i

# Set the debug state
debug = 1 if argv.d

# Change the optimist description output to display the [default: value] information
# in the line below the setting explanation
printhelp = (info) ->
  pattern = /\s*\[/g
  console.log info.replace(pattern, "\n      [")

# Print the description when arg "-h" is given
if argv.h
  optimist.showHelp(printhelp)
  return true

# Initialize the web server and socket.io for the browser communication
express = require("express")
app = express()
server = require("http").createServer(app)
io = require("socket.io").listen(server)

# Open the given browser when arg -b "browsername" is given
# via AppleScript
unless argv.b is "Google Chrome" or argv.b is "Safari"
  argv.b = "Google Chrome"

if argv.b
  applescript = require("applescript")
  console.log "   info  - open browser " + argv.b

  # The AppleScript to open and initatize Safari
  if argv.b is "Safari"
    as = """
    tell application "Safari"
        activate
        if not (exists (document 1)) then
            tell application "System Events" to tell process "Safari" to click menu item "New Window" of menu "File" of menu bar 1
        end if
        set bounds of window 1 to {0, 22, #{argv.x}, #{argv.y}}
        set the URL of document 1 to "http://#{host}:#{argv.p}"
        "   info  - Safari opened with window bounds: {0, 22, #{argv.x}, #{argv.y}}"
    end tell
    """
  # The AppleScript to open and initatize Google Chrome
  else if argv.b is "Google Chrome"
    as = """
    tell application "Google Chrome"
        activate
        -- set _windows to get windows
        -- if length of _windows is 0 then make new window
        if not (exists (window 1)) then make new window
        set bounds of window 1 to {0, 22, #{argv.x}, #{argv.y}}
        set the URL of active tab of window 1 to "http://#{host}:#{argv.p}"
        "   info  - Google Chrome opened with window bounds: {0, 22, #{argv.x}, #{argv.y}}"
    end tell
    """

  # If the AppleScript code is set send it to the browser
  # via the "applescript" module's execString method
  if as?
    applescript.execString(as, (err, rtn) ->
      if err?
        # Something went wrong!
        throw err
      else
        # the return value
        console.log rtn
    )

# Set up and start a web server
server.listen argv.p, host
console.log "   info  - server listening on http://#{host}:" + argv.p

# Set the web server routes
app.use(app.router)
app.use("/", express.static(path.join(__dirname, "../ish")))
app.use("/ish/css", express.static(path.join(__dirname, "../ish/css")))
app.use("/ish/js", express.static(path.join(__dirname, "../ish/js")))

# Set the debugging level
unless debug
  io.set "log level", 1 # reduce logging

remote = io
  .of("/remote")
  .on("connection", (socket) ->
    socket.emit "sendMaxWidth", {maxWidth: argv.x, val: wVal.data}
    socket.emit "sendWidth", {pxem: wVal.show, val: wVal.data}
    socket.on("remoteCmd", (data) ->
      switch data.cmd
        when "size-s", "size-m", "size-l", "size-random", "size-disco", "size-hay"
          console.log(data.cmd) if debug
          ish.emit "jsCmd", {cmd: data.cmd, val: 0}

        when "size-minus1px", "size-plus1px", "size-minus1em", "size-plus1em", "size-minus5em", "size-plus5em"
          console.log(data.cmd) if debug
          ish.emit "jsCmd", {cmd: data.cmd, val: 0}

        when "knob"
          ish.emit("jsCmd", {cmd: "size-viewport", val: data.val})

        else
          console.log("else:", data) if debug
    )
  )

# Start the socke.io communication with the browser
ish = io
  .of("/ish")
  .on("connection", (socket) ->
    # Set up a listener for the width sent from the browser,
    # get the value and send it to the web client elements
    socket.on("sendWidth", (data) ->
      console.log data if debug
      wVal.data = data
      wVal.px = data + "px"
      wVal.em = (data / 16) + "em"
      wVal.show = wVal.px + ", " + wVal.em

      remote.emit "sendWidth", {
          pxem: wVal.show
          val: wVal.data
        }
    )

    # Send the initial document URL to the browser
    if (argv.u and argv.u.indexOf("http://") is 0)
      socket.emit "jsCmd", {cmd: "set-url", val: argv.u}

    # Set a basic large width
    socket.emit "jsCmd", {cmd: "size-l", val: 0}

    return true
  )

exports.ishosc = ->
  return @
