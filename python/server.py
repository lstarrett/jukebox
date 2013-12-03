import web
import json

urls = (
	'/', 'INDEX',
	'/(css|js|fonts)/(.*)', 'SERVE_STATIC',
	'/sync', 'SYNC',
	'/upload', 'UPLOAD',
	'/join', 'JOIN'
)

# State which is synced between clients
#state = { 'controlling':'none', 'users':["Bob","Rutherford","Shawntelle","Keith"], 'songs':["Song 1", "Song 40", "Song Poop"] }
state = { 'controlling':'none', 'users':[], 'songs':[] }

# State which is synced between clients
keep_alives = {}

def endSong():
	# TODO: notify client GUIs that the song is done
	print "Jason's code just sent an end of song notification. Client GUI's will be notified when I finish this."


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
		print "SYNC GET reqeust received, send state data to client"

		# extract client request data and process it
		key, value = web.input().popitem()
		if (key == 'spectator'): # continue, this is just a spectator
			print "DEBUG: 'spectator' received, this is a spectator"
		elif (key in state['users']):
			print "DEBUG: this is a known user, NOT controlling. Resetting keep-alive"
			keep_alives[key] = 100
		elif ('controlling' in key): # simple sanity check for good JSON data
			print "###########################"
			if (state['controlling'] == 'none'): # available for any user to take control
				state = json.loads(key)
				print "DEBUG: known user is passing JSON data with controlling:none"
			elif (json.loads(key)['controlling'] == state['controlling']): # available for same user to continue controlling
				print "DEBUG: known user is passing JSON data with controlling:me"
				state = json.loads(key)
				keep_alives[state['controlling']] = 100
			elif (json.loads(key)['controlling'] == 'release'): # release control and return to available state
				print "DEBUG: known user is passing JSON data with controlling:release"
				state['controlling'] = 'none'
			print "###########################"
		elif (key.isalnum() and len(key) < 15): # check for sanitized data and add to users
			print "DEBUG: this is an unknown user. Adding to users and setting keep-alive"
			state['users'].append(key)
			keep_alives[key] = 100

		# subtract some "time" from each user's keepalive value. Note that this is NOT real time, and "time" only
		# decreases when at least one user is online syncing with the server.
		print "================KEEP ALIVE DIAGNOSTIC================="
		keep_alives.update((user, time - (20 / len(state['users']))) for user, time in keep_alives.items())
		for user, time in keep_alives.items():
			print "user: " + user + ", time: " + str(time)
			if (time <= 0):
				if (state['controlling'] == user):
					state['controlling'] = 'none'
				state['users'].remove(user)
				del keep_alives[user]
		print "================KEEP ALIVE DIAGNOSTIC================="

		# return the current state information
		web.header('Content-Type', 'application/json')
		return json.dumps(state)

class UPLOAD:
	def POST(self):
		uploaded = web.input(mp3file={})
		with open('music/' + uploaded['mp3file'].filename, 'w') as music:
		    music.write(uploaded['mp3file'].value)


if __name__ == '__main__':
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()
