Raspberry Pi Jukebox
Authors: Lucas Starrett, Jason Salter

=======

PROJECT SUMMARY:

The Pi Jukebox is a group music application in which a low power, networked computer (a Raspberry Pi) is connected to a set of speakers (perhaps a home audio system) and then serves a rich web UI to arbitrary users who connect to the Pi over a network. The users can then upload music files to the server to be played over the shared speakers. This is useful for homes with a primary home audio system that many users wish to share concurrently (rather than being restricted to a single machine being connected to the speaker system at a time).


HARDWARE USED:
	Raspberry Pi - Used as the low power, headless server physically connected to the shared speakers
	Arbitrary clients - Any client with a network connected modern web browser can participate in the
		system with no additional software or drivers requirements.

		
3RD PARTY SOFTWARE USED:
	Web.py - The web framework on which the server application was built.
	Pygame - Python music library included with the Raspberry Pi that was used to play the music files
		uploaded by users. This is the only dependency that is external to this project.
	Various client-side web libraries - Twitter Bootstrap was used for the client web UI grid layout
		(so that the UI fits browser windows of all sizes). A few fonts and elements were used from
		DesignModo's Flat UI kit. The modal dialog animation (UI sinks back and dialog appears) was
		created using Hakimm El Hattab's Avgrund JQuery plugin. The client-side UI logic was written
		in JavaScript and used JQuery to create much of the HTML dynamic content.


SOURCE FILES:
	SERVER SIDE:
		python/mp3funcs.py - This is the server side code for handling music files that have been uploaded to the
			server. It uses the Pygame library to play music over the server's audio system.
		python/server.py - This is the web server that runs on the server machine (in our case, the Raspberry Pi)
			and interfaces the client applications running in an arbitrary number of browsers with the
			music server pysically connected to the speakers. It keeps all the clients in sync with the
			current state of the jukebox.
	CLIENT SIDE:
		static/index.html - HTML displayed by the client web browser. This file is extremely dynamic. It is
			serverd in static form to the client upon initial request, and then continuously mutated
			by the JavaScript sources (below) to make the web UI dynamic and interactive.
		static/css/juke-style.css - This is the style sheet that determines how every element included in the
			UI will look when rendered by the client's browser.
		static/js/jukebox.js - This is the primary logic for the client-side web UI. It converses with
			the server code (server.py) through background HTTP GET requests to remain in sync with
			the state of the music server.


DIVISION OF COMPUTATION:

In our system, the bulk of the computation is done by the client-side application in the form of rendering a rich web UI. The Raspberry Pi has enough computational power to render one or two of these UI's concurrently, with significant slow down and stress. However, in our system, the UI is completely offloaded from the Raspberry Pi and is rendered entirely by the users' browsers using client-side source served to the clients by the Pi. Sever side responsibilty is only to keep track of the current state of the jukebox (which users are present, which songs are queued or playing, which user is currently controlling the jukebox, etc.) and actually playing the music over the connected speakers. The server receives a request for state from each client every two seconds, and the state response is a JSON string which is quite short (generally less than 500 characters). This allows the server to service very large ammounts of clients per unit computational power, allowing our application to run on a low power system such as the Raspberry Pi while still appearing to be an uncharacteristically rich application for an embedded system.


USAGE:
	If used on the Raspberry Pi:
		From within the python/ directory, run "python server.py <IP-address>:<port>"
		Then visit <IP-address>:<port> in a modern web browser (not IE, please) on a computer within
		the same subnet of the Raspberry Pi
		The uploaded music files are stored under the python/music/ directory.

	If used on a machine other than a Raspberry Pi:
		The server is written in python, so it should run on any machine that runs python (untested),
		however the pygame libary is not included with python, and must be installed separately.
		Once pygame is sucessfully installed, start sever from within python/ directory as directed
		above and visit the web server at the indicated address.
	

