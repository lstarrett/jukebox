jukebox

=======

Jason implements these in mp3funcs.py:

playPause()

updateList(List list, Bool stop)
   ^ this function takes a list of filenames (not absolute paths, the mp3's will all be in a common directory) and determines the current order of songs to be played. If boolean "stop" is true, the current playing song should be stopped, and the next song on the list should be played. mp3funcs.py should keep a local copy of the current song list so that when the server calls "updateList(song_order, [true/false])" mp3funcs will simply replace the currently stored song order list with the one passed in.


be able to go from paused song to next song



Lucas will implement this in server.py:

songEnd()
   ^ when the currently playing song ends (assuming the user doesn't stop it), mp3funcs.py will call "songEnd()" implemented in server.py so that the server can remove that song from the clients' GUIs and advance to the next song (which mp3funcs.py will automatically play from the filename next on the song_order list).

