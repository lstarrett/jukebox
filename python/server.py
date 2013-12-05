import web
import json
import copy
import mp3funcs

urls = (
	'/', 'INDEX',
	'/(css|js|fonts)/(.*)', 'SERVE_STATIC',
	'/sync', 'SYNC',
	'/upload', 'UPLOAD',
	'/join', 'JOIN'
)

# State which is synced between clients
#state = { 'controlling':'none', 'users':["Bob","Rutherford","Shawntelle","Keith"], 'songs':["Song 1", "Song 40", "Song Poop"] }
state = { 'playing':'false', 'songended':'false', 'controlling':'none', 'users':[], 'songs':[] }

# State which is synced between clients
keep_alives = {}

def endSong():
	# notify client GUIs that the song is done
	#state['songs'].pop(0)
	#print "       @@@@@@@@@@@@@@@@@ DEBUG: songEnd() was called"
	state['songended'] = 'true' 


# serve index.html
class INDEX:
	def GET(self):
		render = web.template.render("../static/")
		return render.index()

# serves static files
class SERVE_STATIC:
	def GET(self, media, url):
		static = open("../static/" + media + "/" + url, "r")
		return static.read()

class SYNC:
	def GET(self):
		global state

		# extract client request data and process it
		if (len(web.input()) == 0): return JSON.dumps(state)
		key, value = web.input().popitem()
		if (key == 'spectator'): # continue, this is just a spectator
			pass
		elif (key in state['users']): # this is a known user, NOT controlling. Resetting keep-alive
			keep_alives[key] = 100
		elif ('controlling' in key): # simple sanity check for good JSON data
			#print "###########################"
			if (state['controlling'] == 'none'): # a user is asking for control
				new_state = json.loads(key)
				if (state['songended'] == 'true'):
					new_state['songended'] = 'true'
				state = new_state
			elif (json.loads(key)['controlling'] == state['controlling']): # a user is continuing to control
				new_state = json.loads(key)
				#print "DEBUG STATE: " + str(state)
				#print "DEBUG NEW STATE: " + str(new_state)
				if (len(state['songs']) > 0):
					if (len(new_state['songs']) == 0 or state['songs'][0] != new_state['songs'][0]):
						#print "       @@@@@@@@@ DEBUG: PLAYING SONG WAS STOPPED, UPDATE LIST WITH STOP = TRUE"
						mp3funcs.updateList(new_state['songs'], True)
				# check for change in play/pause
				if (state['playing'] != new_state['playing']):
					#print "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
					#print "@@@@@@@@@ DEBUG: PLAY/PAUSE SIGNAL SENT"
					#print "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
					if (new_state['playing'] == 'true'):
						mp3funcs.play()
					else:
						mp3funcs.pause()
				if (state['songended'] == 'true'):
					new_state['songended'] = 'true'
				state = new_state
				keep_alives[state['controlling']] = 100
			elif (json.loads(key)['controlling'] == 'release'): # user is releasing control
				state['controlling'] = 'none'
			#print "###########################"
		elif (key.isalnum() and len(key) < 15): # user is joining channel, check for sane username
			#print "DEBUG: this is an unknown user. Adding to users and setting keep-alive"
			state['users'].append(key)
			keep_alives[key] = 100

		# subtract some "time" from each user's keepalive value. Note that this is NOT real time, and "time" only
		# decreases when at least one user is online syncing with the server.
		#print "================KEEP ALIVE DIAGNOSTIC================="
		keep_alives.update((user, time - (20 / len(state['users']))) for user, time in keep_alives.items())
		for user, time in keep_alives.items():
			#print "user: " + user + ", time: " + str(time)
			if (time <= 0):
				if (state['controlling'] == user):
					state['controlling'] = 'none'
				state['users'].remove(user)
				del keep_alives[user]
		#print "================KEEP ALIVE DIAGNOSTIC================="
	
		# update the current song list with the updated state
		mp3funcs.updateList(state['songs'], False)
		#print "       @@@@@@@@@ DEBUG: ROUTINE UPDATE OF LIST WITH STOP = FALSE TO KEEP IT IN SYNC"
		#print
		#print

		# return the current state information
		web.header('Content-Type', 'application/json')
		return_state = copy.deepcopy(state)
		state['songended'] = 'false'
		return json.dumps(return_state)

class UPLOAD:
	def POST(self):
		uploaded = web.input(mp3file={})
		with open('music/' + uploaded['mp3file'].filename, 'w') as music:
		    music.write(uploaded['mp3file'].value)


if __name__ == '__main__':
	mp3funcs.initMusic()
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()
