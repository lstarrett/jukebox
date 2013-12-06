Pi Jukebox
Jason Salter and Lucas Starrett

Our project’s goal was to create a program that will allow multiple users to play their music through one set of speakers. We hook up a small raspberry pi to the speakers via the headphone jack and then the pi broadcasts a website interface that users can log into and upload their mp3’s to listen to. The pi runs a python server that uses html and javascript to generate the website. Since javascript runs on the user’s computers and not on the pi it helps lighten the load for the pi’s minimal processor. The user’s can take control one at a time and upload mp3’s and change the system into play/pause mode. The program uses a python library called pygame that comes default on the default version of raspian to play the audio files through the headphones jack.
For hardware we only require the pi, power supply, internet and speakers. All of the software that we used came stock on the raspian image.

How to run:
Run server.py from the python folder to start the server. The server rquires the computers ip address passed as it's first argument or else it just runs as the localhost. The MP3's that are uploaded are stored in the music folder under the python directory. 
