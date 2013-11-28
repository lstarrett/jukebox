import web
import json

urls = (
	'/', 'INDEX',
	'/(css|js|fonts)/(.*)', 'SERVE_STATIC',
	'/sync', 'SYNC',
	'/upload', 'UPLOAD'
)

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
		print "SYNC GET reqeust received, send state data to client"
	
	def POST(self):
		print "SYNC POST reqeust received, update server state data"

class UPLOAD:
	def POST(self):
		uploaded = web.input(mp3file={})
#		web.debug(uploaded['mp3file'].filename) # This is the filename
#		web.debug(uploaded['mp3file'].value) # This is the file contents
#		web.debug(uploaded['mp3file'].file.read()) # Or use a file(-like) object
#		data.saveFile(uploaded['mp3file'].filename, uploaded['mp3file'].file)
		with open(uploaded['mp3file'].filename, 'w') as music:
		    music.write(uploaded['mp3file'].value)
		raise web.seeother('/')


if __name__ == '__main__':
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()
