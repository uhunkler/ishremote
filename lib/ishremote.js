/*
 * ishremote
 * https://github.com/uhunkler/ishremote
 *
 * Copyright (c) 2013 Urs Hunkler
 * Licensed under the MIT license.
*/

"use strict";
var app, applescript, argv, as, config, debug, express, host, io, ish, optimist, path, printhelp, remote, server, wVal;

path = require("path");

optimist = require("optimist");

config = require("../config.js");

debug = 0;

wVal = {
  px: "",
  em: "",
  val: 0
};

argv = optimist.usage("Open your browser to remote control Brad Frost's ish.\nUsage: $0").describe({
  i: "The local server IP",
  p: "The local server port",
  u: "The URL for the initally opened web page",
  b: "Set the browser to open and run ish. (OS X only, Safari or \"Google Chrome\")",
  x: "Set the browser window width (OS X only, Safari or \"Google Chrome\")",
  y: "Set the browser window height (OS X only, Safari or \"Google Chrome\")",
  d: "1 - Show debug messages",
  h: "This help"
})["default"](config).argv;

host = argv.i;

if (argv.d) {
  debug = 1;
}

printhelp = function(info) {
  var pattern;
  pattern = /\s*\[/g;
  return console.log(info.replace(pattern, "\n      ["));
};

if (argv.h) {
  optimist.showHelp(printhelp);
  return true;
}

express = require("express");

app = express();

server = require("http").createServer(app);

io = require("socket.io").listen(server);

if (!(argv.b === "Google Chrome" || argv.b === "Safari")) {
  argv.b = "Google Chrome";
}

if (argv.b) {
  applescript = require("applescript");
  console.log("   info  - open browser " + argv.b);
  if (argv.b === "Safari") {
    as = "tell application \"Safari\"\n    activate\n    if not (exists (document 1)) then\n        tell application \"System Events\" to tell process \"Safari\" to click menu item \"New Window\" of menu \"File\" of menu bar 1\n    end if\n    set bounds of window 1 to {0, 22, " + argv.x + ", " + argv.y + "}\n    set the URL of document 1 to \"http://" + host + ":" + argv.p + "\"\n    \"   info  - Safari opened with window bounds: {0, 22, " + argv.x + ", " + argv.y + "}\"\nend tell";
  } else if (argv.b === "Google Chrome") {
    as = "tell application \"Google Chrome\"\n    activate\n    -- set _windows to get windows\n    -- if length of _windows is 0 then make new window\n    if not (exists (window 1)) then make new window\n    set bounds of window 1 to {0, 22, " + argv.x + ", " + argv.y + "}\n    set the URL of active tab of window 1 to \"http://" + host + ":" + argv.p + "\"\n    \"   info  - Google Chrome opened with window bounds: {0, 22, " + argv.x + ", " + argv.y + "}\"\nend tell";
  }
  if (as != null) {
    applescript.execString(as, function(err, rtn) {
      if (err != null) {
        throw err;
      } else {
        return console.log(rtn);
      }
    });
  }
}

server.listen(argv.p, host);

console.log(("   info  - server listening on http://" + host + ":") + argv.p);

app.use(app.router);

app.use("/", express["static"](path.join(__dirname, "../ish")));

app.use("/ish/css", express["static"](path.join(__dirname, "../ish/css")));

app.use("/ish/js", express["static"](path.join(__dirname, "../ish/js")));

if (!debug) {
  io.set("log level", 1);
}

remote = io.of("/remote").on("connection", function(socket) {
  socket.emit("sendMaxWidth", {
    maxWidth: argv.x,
    val: wVal.data
  });
  socket.emit("sendWidth", {
    pxem: wVal.show,
    val: wVal.data
  });
  return socket.on("remoteCmd", function(data) {
    switch (data.cmd) {
      case "size-s":
      case "size-m":
      case "size-l":
      case "size-random":
      case "size-disco":
      case "size-hay":
        if (debug) {
          console.log(data.cmd);
        }
        return ish.emit("jsCmd", {
          cmd: data.cmd,
          val: 0
        });
      case "size-minus1px":
      case "size-plus1px":
      case "size-minus1em":
      case "size-plus1em":
      case "size-minus5em":
      case "size-plus5em":
        if (debug) {
          console.log(data.cmd);
        }
        return ish.emit("jsCmd", {
          cmd: data.cmd,
          val: 0
        });
      case "knob":
        return ish.emit("jsCmd", {
          cmd: "size-viewport",
          val: data.val
        });
      default:
        if (debug) {
          return console.log("else:", data);
        }
    }
  });
});

ish = io.of("/ish").on("connection", function(socket) {
  socket.on("sendWidth", function(data) {
    if (debug) {
      console.log(data);
    }
    wVal.data = data;
    wVal.px = data + "px";
    wVal.em = (data / 16) + "em";
    wVal.show = wVal.px + ", " + wVal.em;
    return remote.emit("sendWidth", {
      pxem: wVal.show,
      val: wVal.data
    });
  });
  if (argv.u && argv.u.indexOf("http://") === 0) {
    socket.emit("jsCmd", {
      cmd: "set-url",
      val: argv.u
    });
  }
  socket.emit("jsCmd", {
    cmd: "size-l",
    val: 0
  });
  return true;
});

exports.ishosc = function() {
  return this;
};
