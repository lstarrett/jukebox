# JUKEBOX mp3 interface
#
# Contains functions to handle play/pause, volume, manipulation, etc.
# of mp3 files used in the Jukebox application
#
# AUTHORS: Lucas Starret, Jason Salter
import pygame
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


def main():
	# Main won't be used in the finished project, use here for testing
	initMusic()
	global list	
	list=["go.wav","1up.wav","cc.wav"]
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
	#Already playing->should pause
	global loc
	global newSong
	global n
	global MAXN
	if pygame.mixer.music.get_busy() and pygame.mixer.music.get_pos() != loc:
		print "pausing"
		pygame.mixer.music.pause()
		loc=pygame.mixer.music.get_pos();
		return
	#Not started->load new song
	if newSong:	
		if n<MAXN:
			print "starting new song"
			newSong=False
			pygame.mixer.music.load("music/"+list[n])
			pygame.mixer.music.play()		
	#not playing and not at the beginning->resume playing
	else:
		print "unpausing"
		pygame.mixer.music.unpause()


def updateList(l,stop):
	global list
	global newSong
	global n
	n=0
	list=l
	if stop:
		print "stopping and loading new song"
		global loc
		loc=-5
		newSong=True
		pygame.mixer.music.stop()	

def setPosition():
	print "yay"

def SongEnd():
	global end
	global n
	global newSong
	while True:
		for e in pygame.event.get():
			if e.type==end:
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
