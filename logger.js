const bunyan = require("bunyan"),
	mkdirp = require("mkdirp"),
	path = require("path"),
	PrettyStream = require("bunyan-prettystream")

function isDev(config) {
	return config.env === "development"
}

function ensurePath(file) {
	mkdirp.sync(file)
	return file
}

function getLogFilePath(logPath) {
	return path.join(ensurePath(logPath), `${config.title}.server.log`)
}

function prettyFormat() {
	const prettyStdOut = new PrettyStream({ mode: "short" })
	prettyStdOut.pipe(process.stdout)
	return prettyStdOut
}

function configureStreams(config) {
	const streams = []
	if (isDev(config)) {
		streams.push({
			level: "debug",
			type: "raw",
			stream: prettyFormat()
		})
	} else {
		streams.push({
			level: "info",
			stream: process.stdout
		})
	}
	return streams
}

module.exports = {
	create(config) {
		return bunyan.createLogger({
			name: "facer",
			serializers: bunyan.stdSerializers,
			streams: configureStreams(config)
		})
	}
}

