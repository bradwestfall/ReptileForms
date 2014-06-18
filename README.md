# ReptileForms
> Easy-to-use unopinionated forms and validation

This code requires jQuery `^1.7.0`

## Install
```sh
$ bower install ReptileForms --save
```

## Features
- Use standard `<form>` and `<input>` tags with standard attributes
 - ReptileForms will make adjustments with it's settings to turn your forms into ReptileForms
- AJAX submissions by default
 - Easy callbacks to override
- Built-in validation
 - Use built in regular expressions or provide your own
- OOCSS Approach
 - Structure Styles provided separatly from design styles allowing you to create your own design more easily.
 - Stock Design Styles coming soon
- Custom Fields and/or Custom Validation on a per-field basis
 - Custom fields can include "composite fields" - see below in Custom Fields

## Basic Usage
###JS
```js
var form = new ReptileForm('.reptile-form', {
	validationError: function(err) {
		console.log(err);
	},
	submitSuccess: function(data) {
		$('body').prepend('<p>Success</p>');
	}
});
```
###Initial HTML
```html
<form class="reptile-form" action="/process" method="POST">
	<input type="text" name="first-name" title="First Name" required maxlength="20">
	<button>Submit</button>
</form>
```
###Resulting DOM
```html
<form class="reptile-form" action="/process" method="POST">
	<div class="field first-name required text">
		<div class="title">First Name</div>
		<div class="field-input">
			<input type="text" name="first-name" maxlength="20">
		</div>
	</div>
	<button>Submit</button>
</form>
```
## Basic Fields
Use `<input>`, `<select>`, or `<textarea>` tags with standard attribtues such as `name` (required), `type`, `reqired`, `maxlength`, etc...
Also use these attributes for additional ReptileForms functionality:
- `title` Will be used as a visual title and also for error messages
- `data-exp-name` The name of the regular expression to use in validation

## Custom Fields
Documentation coming soon