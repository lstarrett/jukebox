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
		print "UPLOAD request received, move mp3 to server"


if __name__ == '__main__':
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()
