# LESS for components ![Travis CI](https://travis-ci.org/anrem/meteor-less-for-components.svg)

Opinionated LESS wrapper package for simpler work with BEM or any other components based methodology.


## Installation
```
meteor add ouk:less-for-components
```

This package is intended to make simpler development of view components. Using this package allows you to easily rearrange your project structure without worrying about tight style dependencies. As well you have no problems tossing view components from project to project.

This package has only 1 mandatory rule - a `theme.less` file must be created anywhere in your project. Theme file will be automatically imported into all* LESS files. (_* For exceptions keep reading_)


Also you must be aware of some package logic:
- only first `theme.less` file found in project is loaded, rest are ignored
- LESS files located in folders named `imports` are not automatically imported
- `initial.less` is always loaded first and does not automatically import theme file
- only first `initial.less` file found in project is loaded, rest are ignored
- `theme.less` is prepended at the beginning of all LESS files except mentioned above
- you can set location where you want `theme.less` to be imported by putting `// import theme` comment line anywhere in your component's style file
- automatically prepended `theme.less` import line does not appear in sourcemaps
- package includes configurable [Autoprefixer](https://github.com/postcss/autoprefixer-core) by adding `// autoprefix: ` comment line with your desired browsers setup somewhere in `theme.less` file
- without configuration Autoprefixer is not run


## Tips
- use `initial.less` to include vendor styles
- add `// autoprefix: FF >= 3.6, etc` comment line in your `theme.less` to use Autoprefixer
- do not include any class definitions in `theme.less` as it will be included multiple times
- use `theme.less` to configure your variables and include mixins
- add `// import theme` comment line after your component's variable definitions to override them with theme settings


### Default variables example

theme.less
```less
@component-color: rgba(255, 255, 255, .9);
```
component.less
```less
@component-font-size: 2em;
@component-color: rgb(255, 255, 255);

// import theme

.component {

  &__title {
    font-size: @component-font-size;
    color: @component-color;
  }

}
```

Result:
```css
.component__title {
  font-size: 2em;
  color: rgba(255, 255, 255, 0.9);
}
```


### Autoprefixer example

theme.less
```less
// autoprefix: firefox >= 3.6
```
component.less
```less
.component {

  &__preview {
    transform: scale(2);
  }

}
```

Result:
```css
.component__preview {
  -moz-transform: scale(2);
       transform: scale(2);
}
```
