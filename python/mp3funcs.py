# JUKEBOX mp3 interface
#
# Contains functions to handle play/pause, volume, manipulation, etc.
# of mp3 files used in the Jukebox application
#
# AUTHORS: Lucas Starret, Jason Salter
import pygame
import server
from threading import Thread

#loc is used for pausing because get_busy() returns true if the song is paused
loc=-5

#song list
list=[]

#get_pos() has weird behavious so I just made vars to handle new songs
newSong=True

#signal marker
end=-1

#location in the list
#for when songs keep ending without new ones being added
n=0
MAXN=3

#state of player
playing=False

def main():
	# Main won't be used in the finished project, use here for testing
	initMusic()
	global list	
	list=["song song.mp3"]
	playPause()
	while True:
		c=raw_input()
		if c=='p':
			playPause()
		if c=='u':
			updateList(["go.wav","1up.wav","cc.wav"],False)
		if c=='s':
			updateList(["1up.wav","go.wav","cc.wav"], True)


def playPause():
	global loc
	global newSong
	global n
	global MAXN
	if list is None:
			playing=False
			return
	#Already playing->should pause
	if pygame.mixer.music.get_busy() and pygame.mixer.music.get_pos() != loc:
		print "pausing"
		pygame.mixer.music.pause()
		loc=pygame.mixer.music.get_pos();
		playing=False
		return
	#Not started->load new song
	if newSong:	
		if n<MAXN:
			print "starting new song"
			newSong=False
			pygame.mixer.music.load("music/"+list[n])
			pygame.mixer.music.play()	
			playing=True
	#not playing and not at the beginning->resume playing
	else:
		print "unpausing"
		playing=False
		pygame.mixer.music.unpause()

#stop=t when playing song is X'ed
def updateList(l,stop):
	global list
	global newSong
	global n
	global playing
	new=False
	n=0
	list=l
	print "updating list"
	if stop:
		print "updating list and loading new song"
		global loc
		loc=-5
		newSong=True
		pygame.mixer.music.stop()
		
		#empty list
		if list is None:
			playing=True
			new= True
			

	if playing:
		if new:
			newSong=True
			new=False
		playPause()

def SongEnd():
	global end
	global n
	global newSong
	while True:
		for e in pygame.event.get():
			if e.type==end:
				if playing:
					server.endSong()
					n=n+1
					newSong=True
					playPause()


#Needs to be called before anything else can work
def initMusic():
	global loc
	global end
	loc=-5
	pygame.init()
	pygame.mixer.init()
	end=pygame.USEREVENT+1
	pygame.mixer.music.set_endevent(end)
	t=Thread(target=SongEnd,args=())
	t.start()

# MAIN (call main automatically when 'python mp3funcs.py' is used from the terminal)
if __name__ == '__main__':
	main()
