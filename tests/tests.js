var packageName = 'less-for-components'

Tinytest.add('less - less presence', function (test) {
	var el = helper.find('.less-presence')
	test.equal(getStyleProperty(el, 'font-size'), '20px', 'Expected font-size to be 20px')
	helper.clear()
})

Tinytest.addAsync('autoprefixer - autoprefixer presence', function (test, onComplete) {
	var link = document.querySelector('.__meteor-css__')
	HTTP.get(link.getAttribute('href'), function (err, response) {
		var parts = []
		if (!err) {
			var parts = response.content.split('.less-prefixed__less-for-components')
			parts = parts.pop().split('}').shift().split('\n').map(function (item) {
				return item.trim()
			})
		}

		test.isTrue(
			parts.indexOf('-moz-transform: scale(2);') > -1,
			'Expected prefixed transform property to be defined')

		onComplete()
	})
})

Tinytest.add(packageName + ' - initial less file imported', function (test) {
	var el = helper.find('.less-initial')
	test.equal(getStyleProperty(el, 'font-size'), '21px', 'Expected font-size to be 21px')
	test.notEqual(getStyleProperty(el, 'margin-left'), '20px', 'Expected font-size not to be 20px')
	helper.clear()
})

Tinytest.addAsync(packageName + ' - initial less file does not automatically import theme file', function (test, onComplete) {
	var link = document.querySelector('.__meteor-css__')
	HTTP.get(link.getAttribute('href'), function (err, response) {
		var content = ''
		var initialClassName = '.less-initial__less-for-components'
		var themeClassName = '.less-repeated__less-for-components'

		if (!err) {
			content = response.content
		}

		test.isTrue(
			content.indexOf(initialClassName) < content.indexOf(themeClassName),
			'Initial style file should not autoload theme file')

		onComplete()
	})
})

Tinytest.add(packageName + ' - less files from imports/ folders are not automatically imported', function (test) {
	var el = helper.find('.less-omited')
	test.notEqual(getStyleProperty(el, 'font-size'), '23px', 'Expected font-size not to be 23px')
	helper.clear()
})

Tinytest.add(packageName + ' - manually linked less files from imports/ folders are imported', function (test) {
	var el = helper.find('.less-included')
	test.equal(getStyleProperty(el, 'font-size'), '24px', 'Expected font-size not to be 24px')
	helper.clear()
})

Tinytest.add(packageName + ' - theme file imported', function (test) {
	var el = helper.find('.less-theme')
	test.equal(getStyleProperty(el, 'font-size'), '22px', 'Expected font-size to be 22px')
	test.notEqual(getStyleProperty(el, 'margin-left'), '20px', 'Expected font-size not to be 20px')
	helper.clear()
})

Tinytest.add(packageName + ' - all less files gets imported theme file', function (test) {
	var el = helper.find('.less-theme')
	test.equal(getStyleProperty(el, 'font-size'), '22px', 'Expected font-size to be 22px')

	var component = helper.find('.less-component')
	test.equal(getStyleProperty(component, 'font-size'), '26px', 'Expected font-size to be 26px')
	helper.clear()
})

Tinytest.add(packageName + ' - theme file included before manual imports', function (test) {
	var el = helper.find('.less-included')
	test.equal(getStyleProperty(el, 'margin-left'), '25px', 'Expected margin-left to be 25px')
	helper.clear()
})

Tinytest.add(packageName + ' - theme imported in custom place and overrides some defaults', function (test) {
	var el = helper.find('.less-default')
	test.equal(getStyleProperty(el, 'margin-left'), '55px', 'Expected margin-left to be 55px')
	test.equal(getStyleProperty(el, 'margin-right'), '50px', 'Expected margin-right to be 50px')
	helper.clear()
})

var helper = {
	find: function (selector) {
		if (!this.node) {
			this.inject()
		}

		return this.node.querySelector(selector)
	},
	inject: function () {
		this.node = document.createElement('div')
		Blaze.render(Template.bemlessTestsTemplate, this.node)
		this.node.style.display = 'block'
		document.body.appendChild(this.node)
	},
	clear: function () {
		document.body.removeChild(this.node)
		this.node = null
	},
}
