Package.describe({
	name: 'ouk:less-for-components',
	version: '1.0.0',
	summary: 'Opinionated LESS wrapper package for simpler work with BEM or any other components based methodology',
	git: 'https://github.com/anrem/meteor-less-for-components.git',
})

Package.registerBuildPlugin({
	name: 'less-for-components',
	use: [],
	sources: [
		'plugin.js',
	],
	npmDependencies: {
		'glob': '5.0.10',
		'less': '2.5.1',
		'postcss': '4.1.11',
		'autoprefixer-core': '5.2.0',
	},
})

Package.onTest(function (api) {
	api.use(['ouk:less-for-components', 'test-helpers', 'tinytest', 'templating', 'http'])
	api.addFiles([
		'tests/style.less',
		'tests/component.less',
		'tests/defaults.less',
		'tests/theme.less',
		'tests/initial.less',
		'tests/imports/included.less',
		'tests/imports/omited.less',
		'tests/template.html',
		'tests/tests.js',
	], 'client')
})
