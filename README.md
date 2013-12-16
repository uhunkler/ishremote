# ish.remote
Drive Brad Frost's [ish.](http://bradfrostweb.com/demo/ish/) with a HTML5 "remote control". Some background: the ish. interface elements are mapped to socket.io messages which are sent and received by a HTML5 remote page with buttons and a circular slider. The message handling is done by a local node.js web server.

## Getting Started
### Installing via GitHub
Install the git repository. Install the related node modules with `npm install`.

Dependencies: [node.js](http://nodejs.org/) and several node modules and eventually [Grunt](http://gruntjs.com/) and [CoffeeScript](http://coffeescript.org/) to compile the config.coffee configuration with CoffeeScript. Grunt and CoffeeScript are not needed to use ish.remote.

## Documentation
This repository contains a modified ish. 2 version. I removed the PHP dependencies and replaced the functionality with JavaScript and added the socket.io module and some JavaScript for the message sending between ish. and the background web server. The other JavaScript modules I added are listed below.

### Start ish.remote
To start the tool from the command line you may "change directory" into the `ishremote` folder and type `node ./lib/ishremote.js`. With this command you start a local node web server with socket.io. You may then open the URL "http://yourServerIP:8080" in your browser to start ish. and open the URL "http://yourServerIP:8080/remote.html" on your device to open the remote control.

In short - three steps:

1. Command line **`node ./lib/ishremote.js -i yourServerIP`**
2. URL **http://yourServerIP:8080** in the ish. browser
3. URL **http://yourServerIP:8080/remote.html** in the remote browser

### The server and client settings
The remote page needs a **server IP** and **port** information. These values can be set as command line parameters or in the config file. 

You may edit `config.js` or `src/config.coffee` to set the parameters. If you work with CoffeeScript you may compile the src with the command line command `grunt coffee`.

#### The config parameters / command line parameters
The `-h` command line parameter will show the following description and default values:

````
Open your browser to remote control Brad Frost's ish.
Usage: node ./lib/ishremote.js

Command line parameters:
  -i  Set the node.js web server IP
      [default: "123.001.001.002"]
  -p  Set the node.js web server port
      [default: 8080]
  -u  The URL for the initially opened web page
      [default: "http://bradfrostweb.com/blog/post/ish-2-0/"]
  -b  Set the browser to open and run ish. (OS X only, Safari or "Google Chrome")
      [default: ""]
  -x  Set the browser window width (OS X only, Safari or "Google Chrome")
      [default: 1920]
  -y  Set the browser window height (OS X only, Safari or "Google Chrome")
      [default: 1076]
  -d  1 - Show debug messages
      [default: 0]
  -h  This help
````

### The remote page
To remote control ish. you use the "http://yourServerIP:8080/remote.html" page. The remote page is responsive and adjusts to the screen size. Depending on the screen estate you see one ish. button group (on small screens) with three buttons above to switch between the groups. Or you see three button groups arranged in a way that fits into the available space (on medium to large screens). On medium screens I assume the remote is used on a bigger mobile device like a tablet and the button areas are displayed at the page bottom so that the buttons can be reached by the thumbs when the device is hand held. On large screens the button areas are placed at the top of the page.

#### The remote page layout
The remote layout offers 3 button groups:

The **first** group with buttons to trigger the **S**mall-ish, **M**edium-ish, **L**arge-ish, **Random**, **Disco** and **Hay** ish. buttons.

![Button area one (small screen)](https://raw.github.com/uhunkler/ishremote/master/documentation/images/remote-1-small.png)

The **second** group offers a big round control to modify the ish. viewport with your thumb or fingers.

![Button area two (small screen)](https://raw.github.com/uhunkler/ishremote/master/documentation/images/remote-2-small.png)

The **third** group with buttons to fine tune the ish. viewport width in three step sizes: 1px plus and minus, 1em plus and minus, 5em plus and minus. Similar to the use of the cursor arrows in the px and em field in ish.

![Button area three (small screen)](https://raw.github.com/uhunkler/ishremote/master/documentation/images/remote-3-small.png)

The ish.remote page on medium screens landscape and portrait.

![ish.remote medium screen portrait](https://raw.github.com/uhunkler/ishremote/master/documentation/images/remote-portrait-medium.png) ![ish.remote medium screen landscape](https://raw.github.com/uhunkler/ishremote/master/documentation/images/remote-landscape-medium.png)

In the top the ish. viewport size is shown in a "status bar" as a px and an em value.

The first and third button group map ish. controls, the round control in the second group offers a different way to interact with ish. Tapping on the control is similar to **Disco** or **Random** mode. Sliding offers a manual forward and backward **Hay** mode.

### Comfort settings for OS X
For the Mac I added AppleScripts to open the Safari or Google Chrome browser, set the browser window to full screen width and open ish. automatically displaying a preset web page. This way you just start ishremote and get the browser running ish. and your selected web page ready to work with. I start ishremote for example with an [Alfred](http://www.alfredapp.com) workflow by typing "ishremote" into the Alfred dialog and can start to use ish. remotely from my mobile device on the web page I am working with - fast and convenient.

### Dependencies
With [jquery.knob.js](http://anthonyterrien.com/knob/) the circular slider element is build. The [FastClick](http://ftlabs.github.io/fastclick/) polyfill removes the click delays in mobile browsers. The [TouchSwipe](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin) jQuery plugin integrates swipes - the button areas can be changed with left and right swipes on small screens.  With [enquire.js](http://wicky.nillia.ms/enquire.js/) JavaScript media queries are handled to deal with the responsive remote page display. To handle the button and button area layouts in the remote in a comfortable way I use a grid created with [gridset](http://share.gridsetapp.com/25527/).

### Known issues
In the default browser on the Samsung Galaxy II ("Internet" on Android version 4.1.2) it takes long to initialize the remote page. In Chrome, Opera or Firefox with the same Android version the page initializes fast.

In the Android 2.2 and 2.3 default browser the interface and message sending works. Message receiving does not work - no width information is displayed.

In IE 9 on Windows Phone 7.5 the "cursor" on the circular control on the remote can not be moved. Only clicks on the control move the "cursor" to the click position.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Lint your code using [Grunt](http://gruntjs.com/).

## Release History
Initial release - version 0.1.0.

## License
Copyright (c) 2013 Urs Hunkler
Licensed under the MIT license.
