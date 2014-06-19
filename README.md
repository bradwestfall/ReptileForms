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
 - Structure Styles provided separatly from Design Styles
 - Optional Design themes coming soon
- Custom Fields and/or Custom Validation on a per-field basis
 - Custom fields can include "composite fields" - see below in Custom Fields

## Basic Usage
###JS
Call `ReptileForm()` and pass in a selector reference to your form. Also pass in callbacks to customize how your forms will work
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
Write some initial HTML. Notice that we're using a standard `input` field with standard attributes
```html
<form class="reptile-form" action="/process" method="POST">
	<input type="text" name="first-name" title="First Name" required maxlength="20">
	<button>Submit</button>
</form>
```
###Resulting DOM
The resulting DOM in is as follows:
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
> Notice that the `title` attribute was used to create our visual Title and was removed form the `<input>` field. Then we made a field container: `<div class="field first-name required text">` with convenient classname hooks. Also note how we left HTML untouched if it's not an input field (such as the button)

## Basic Fields
Use `<input>`, `<select>`, or `<textarea>` tags with standard attribtues such as `name` (which we require), `type`, `reqired`, `maxlength`, etc...

## Field Attributes
Besides using standard attributes which will work as expected, use these attributes for additional ReptileForms functionality:
- `title` Will be used as a visual title and also for error message titles
- `data-exp-name` The name of the regular expression to use in validation
- `data-custom-validation` The name of a function to be used for this field's validation. This serves as a replacement to ReptileForms' default validation

## Custom Fields
ReptileForms was created with custom fields in mind.

###Initial HTML
You can create custom fields by wraping your field in a `<div class="field-input">` element. Every field in ReptileForms must have a name (to be submitted over HTTP) but since div tags don't technically support the `name` attribute, we will use `data-name` instead. Also notice that we're providing a reference to custom validation for this field. `validateTerms` is a function name that we will register with ReptileForms (See JS below).
```html
<form class="reptile-form" action="/process" method="POST">
	<div class="field-input" data-name="terms" data-custom-validation="validateTerms">
		<span class="agree">Agree to terms</span>
	</div>
</form>
```
###Resulting DOM
ReptileForms will build the `<div class="field">` wrapper (and this time without a `<div class="title">` because there was no title attribute supplied.
```html
<form class="reptile-form" action="/process" method="POST">
	<div class="field terms">
		<div class="field-input">
			<span class="agree">Agree to terms</span>
		</div>
	</div>
</form>
```
###Register Custom Validation
After you've called `ReptileForm()`, you can use the object your given to prototype new (or replacement) functions as follows.
```js
var form = new ReptileForm(/* Start Reptile Forms */);

// Register Custom Error Handling
form.validateTerms = function(formField) {
}
```
> Note that formField is a jQuery object referencing the `<div class="field">` that is being validated
