import web
import json

urls = (
	'/', 'INDEX',
	'/js/(.*)','SERVE_JS',
	'/css/(.*)','SERVE_CSS'
)

# renders the initial html file upon load
class INDEX:
	def GET(self):
		print "hello, I'm here"
		#render = web.template.render("../static/")
		render = web.template.render("")
		return render.index()

# serves js files upon load (included in html. basis of client side operations)
class SERVE_JS:
	def GET(self, url):
		script = open("../static/js/"+url,"r")
		return script.read()

# serves css files upon load. Used for styling (bootstrap)
class SERVE_CSS:
	def GET(self, url):
		script = open("../static/css/"+url,"r")
		return script.read()


if __name__ == '__main__':
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()
