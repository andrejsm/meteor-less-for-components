var fs = Npm.require('fs')
var path = Npm.require('path')
var less = Npm.require('less')
var glob = Npm.require('glob')
var Future = Npm.require('fibers/future')
var postcss = Npm.require('postcss')
var autoprefixer = Npm.require('autoprefixer-core')

var arc = { archMatching: 'web' }
var noop = function () {
}

var pluginName = 'less-for-components'
var initialFile = 'initial.less'
var themeFile = 'theme.less'

Plugin.registerSourceHandler('import.less', arc, noop)

Plugin.registerSourceHandler('initial.less', arc, noop)

Plugin.registerSourceHandler('theme.less', arc, noop)

Plugin.registerSourceHandler('less', arc, function (compileStep) {
	if (path.dirname(compileStep.inputPath).split('/').indexOf('imports') === -1) {
		plugin.addStylesheet(compileStep)
	}
})

var plugin = {
	init: function (compileStep, options) {
		this.root = compileStep.fullInputPath.replace(compileStep.inputPath, '')

		var themeFiles = glob.sync(this.root + '**/' + themeFile)
		if (!themeFiles.length) {
			throw new Error('[' + pluginName + '] Theme file not found: ' + themeFile)
		}

		this.theme = themeFiles.shift().replace(this.root, '')

		var source = fs.readFileSync(path.join(this.root, this.theme), 'utf8')
		var match = source.match(/autoprefix: ?(.*)/i)
		if (match) {
			this.autoprefix = match[1]
		}
	},
	addStylesheet: function (compileStep, overrides) {
		if (!this.theme) {
			this.init(compileStep)
		}

		if (!this.initialLoaded) {
			this.addInitialStylesheet(compileStep)
		}

		overrides = overrides || {}

		var inputPath = overrides.inputPath || compileStep.inputPath
		var source = overrides.source || compileStep.read().toString('utf8')
		var themeImportStr = overrides.themeImportStr || '@import "' + this.theme + '";'
		var future = new Future
		var sourceMap = null
		var compiled = {}

		var options = {
			paths: [path.dirname(path.join(this.root, inputPath)), this.root],
			filename: inputPath,
			sourceMap: {},
		}

		var input = themeImportStr + source
		var match = source.match(/\/\/ ?import theme/i)
		if (match) {
			input = source.replace(match[0], themeImportStr + match[0])
		}

		try {
			less.render(input, options, future.resolver())
			compiled = future.wait()
		} catch (e) {
			return compileStep.error({
				message: 'Less compiler error: ' + e.message,
				sourcePath: '[' + pluginName + '] ' + (e.filename || inputPath),
				line: e.line,
				column: e.column + 1,
			})
		}

		if (compiled.map) {
			sourceMap = JSON.parse(compiled.map)
			sourceMap.sources = [inputPath]
			sourceMap.sourcesContent = [source]
			sourceMap = JSON.stringify(sourceMap)
		}

		if (this.autoprefix) {
			try {
				compiled.css = postcss(autoprefixer({ browsers: this.autoprefix }))
					.process(compiled.css)
					.css
			}
			catch (e) {
				return compileStep.error({
					message: 'Autoprefixer error: ' + e,
					sourcePath: '[' + pluginName + '] ' + (e.filename || inputPath),
					line: e.line,
					column: e.column + 1,
				})
			}
		}

		compileStep.addStylesheet({
			path: inputPath + '.css',
			data: compiled.css,
			sourceMap: sourceMap,
		})
	},
	addInitialStylesheet: function (compileStep) {
		this.initialLoaded = true

		var initialFiles = glob.sync(this.root + '**/' + initialFile)
		if (initialFiles.length) {
			var initial = initialFiles.shift().replace(this.root, '')
			var overrides = {
				themeImportStr: ' ',
				inputPath: initial,
				source: fs.readFileSync(path.join(this.root, initial)).toString('utf8'),
			}

			this.addStylesheet(compileStep, overrides)
		}
	},
}
