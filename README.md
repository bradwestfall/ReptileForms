# ReptileForms v0.1.0
> Easy-to-use unopinionated forms and validation

This code requires jQuery `^1.7.0`

## Install
```sh
$ bower install ReptileForms --save
```

## Features
- AJAX Post submissions by default
 - Easy callbacks to override
- Built-in validation
 - Easily add custom regular expressions
- OOCSS Approach
 - Structure Styles Supplied
- Just use common `<input>` fields as usual
- Easily build custom fields with custom validation
 - Custom fields can include "composite fields"

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