# [jQuery asModal](https://github.com/amazingSurge/jquery-asModal) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A lightweight jQuery plugin that help create a modal dialog.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asModal.js
├── jquery-asModal.es.js
├── jquery-asModal.min.js
└── css/
    ├── asModal.css
    └── asModal.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asModal/master/dist/jquery-asModal.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asModal/master/dist/jquery-asModal.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asModal --save
```

#### Install From Npm
```sh
npm install jquery-asModal --save
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asModal.git
cd jquery-asModal
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asModal` requires the latest version of [`jQuery`](https://jquery.com/download/).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asModal.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asModal.js"></script>
```

#### Required HTML structure

```html
<button href="login.html" class="example">click to open modal</button>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  $('.example').asModal(); 
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asModal/tree/master/examples).

## Options
`jquery-asModal` can accept an options object to alter the way it behaves. You can see the default options by call `$.asModal.setDefaults()`. The structure of an options object is as follows:

```
{
  namespace: 'modal', // String: Prefix string attached to the class of every element generated by the plugin
  skin: null, // set plugin skin

  content: null, // Set the URL, ID or Class.
  overlay: true, // Show the overlay.
  closeElement: null, // Element ID or Class to close the modal
  effect: 'fadeScale', // fadein | slide | newspaper | fall
  overlaySpeed: 200, // Sets the speed of the overlay, in milliseconds
  effectFallback: 'fade', // set default jquery animate when css3 animation doesn't support
  focus: true, // set focus to form element in content
  errorContent: 'sorry, ajax error.', // set ajax error content
  loadingContent: 'loading...', // set loading content

  closeByEscape: true, // Allow the user to close the modal by pressing 'ESC'.
  closeByOverlayClick: true, // Allow the user to close the modal by clicking the overlay.

  width: null, // Set a fixed total width.
  hieght: null, // Set a fixed total height.

  // Callback API
  onOpen: null, // Callback: function() - Fires when the modal open
  onClose: null // Callback: function() - Fires when the modal close
  //onComplete: null // Callback: function() - Fires when the effect end
}
```

## Methods
Methods are called on asModal instances through the asModal method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asModal('destory');

// or
var api = $().data('asModal');
api.destory();
```

#### moveTo(position)
Move the modal handle to the position.
```javascript
// move to 50px
$().asModal('moveTo', '50');

// move to 50%
$().asModal('moveTo', '50%');
```

#### open()
Open the modal.
```javascript
$().asModal('open');
```

#### close()
Close the modal.
```javascript
$().asModal('close');
```

#### enable()
Enable the modal functions.
```javascript
$().asModal('enable');
```

#### disable()
Disable the modal functions.
```javascript
$().asModal('disable');
```

#### destroy()
Destroy the modal instance.
```javascript
$().asModal('destroy');
```

## Events
`jquery-asModal` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asModal::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
ready   | Fires when the instance is ready for API use.
enable  | Fired when the `enable` instance method has been called.
disable | Fired when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asModal.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asModal.js"></script>
<script>
  $.asModal.noConflict();
  // Code that uses other plugin's "$().asModal" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asModal` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asModal` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asModal/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asModal.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asModal/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asModal.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asModal
[license]: https://img.shields.io/npm/l/jquery-asModal.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asModal.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asModal