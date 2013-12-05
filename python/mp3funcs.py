#JUKEBOX mp3 interface
#
# Contains functions to handle play/pause, volume, manipulation, etc.
# of mp3 files used in the Jukebox application
#
# AUTHORS: Lucas Starret, Jason Salter
import pygame
import server
from time import sleep
from threading import Thread
import copy


#song list
songList=[]

#previously played song
previousSong = None

#signal marker
end=-1

#state of player
playing=False


def load(name):
	global playing
	if pygame.mixer.music.get_busy():
		pygame.mixer.music.stop()
	pygame.mixer.music.load("music/"+name)
	pygame.mixer.music.play()
	playing=True
	

#stop=t when playing song is X'ed
def updateList(l,stop):
	global songList
	songList=copy.deepcopy(l)	
	if stop:
		pygame.mixer.music.stop()
		if len(songList)>0:
			load(songList.pop(0))


def isOver():
	for e in pygame.event.get():
		if e.type==end:
			print "endSong() sent"
			server.endSong()
			return
def play():
	global playing
	playing=True

def pause():
	global playing
	playing=False

def Loop():
	global playing
	global songList
	global previousSong
	
	while True:
		isOver()
		if not pygame.mixer.music.get_busy():
			if playing and len(songList)>0:
				current = songList.pop(0)
				if (current != previousSong):
					load(current)
					previousSong = current
		elif not playing:
			pygame.mixer.music.pause()
		elif playing:
			pygame.mixer.music.unpause()




#Needs to be called before anything else can work
def initMusic():
	global end
	pygame.init()
	pygame.mixer.init()
	end=pygame.USEREVENT+1
	pygame.mixer.music.set_endevent(end)
	t=Thread(target=Loop,args=())
	t.start()

