#JUKEBOX mp3 interface
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
MAXN=6

#state of player
playing=False


def play():
	global loc
	global newSong
	global playing
	global n
	if len(list)==0:
		playing=False
		return

	if playing:
		return
	#start new song
	if newSong:
		pygame.mixer.music.load("music/"+list[n])
		pygame.mixer.music.play()
		playing=True
		newSong=False
		n=0
		return

	#continue old song
	else:
		pygame.mixer.music.unpause()
		playing=True
		return	

def pause():
	global playing
	pygame.mixer.music.pause()
	playing=False
	loc=pygame.mixer.music.get_pos()
	return

#stop=t when playing song is X'ed
def updateList(l,stop):
	global list
	global newSong
	global playing
	list=l
	
#	print ("moose "+stop+" "+playing)
	
	if stop and playing:
		pygame.mixer.music.stop()
		newSong=True
		play()
		return 
	if stop and not playing:
		pygame.mixer.music.stop()
		newSong=True

	if playing and not stop:
		play()
		return

	if not playing and not stop:
		return

		
	
def SongEnd():
	global end
	global n
	global newSong
	while True:
		for e in pygame.event.get():
			if e.type==end:
				server.endSong()
				print "JUST CALLED END SONG"
				newSong=True
				if len(list) >0:
					list.pop(0)
				else:
					playing=False
					return
				n=1
				play()


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
#if __name__ == '__main__':
#	main()

