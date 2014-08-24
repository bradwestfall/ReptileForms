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
Call `ReptileForm()` and pass a DOM selector to reference the form(s) you want to target
```js
var form = new ReptileForm('form');
```
###Initial HTML
Create a standard form in HTML with standard fields and attributes.
```html
<form action="/process">
	<input type="text" name="first_name" title="First Name" required maxlength="20">
	<button type="submit">Submit</button>
</form>
```
###Resulting DOM
Calling ReptileForm() will change the DOM as follows:
```html
<form action="/process">
	<div class="field first_name required text">
		<label>First Name</label>
		<div class="field-input">
			<input type="text" name="first_name" maxlength="20">
		</div>
	</div>
	<button>Submit</button>
</form>
```
ReptileForms seeks out standard form fields and gives them new containers for styling purposes.
> Notice that the `title` attribute was used to create our `<label>` and was removed form the `<input>` field. Then we made a field container: `<div class="field first_name required text">` with convenient classname hooks.

The default method for ReptileForms is POST if you do not provide the method attribute on the form. ReptileForms will also use an AJAX submission by default and will use the form's action attribute as a destination. 













## Custom Fields
ReptileForms was created so making custom fields is easy. Compared to standard fields where ReptileForms will create containers for your fields - with custom fields you create the `field-input` container as follows:

###Initial HTML
```html
<form action="/process">
	<div class="field-input" data-name="terms" data-custom-validation="validateTerms" title="Agree">
		<span class="agree">Click Here to agree to terms</span>
	</div>
</form>
```
> Note how the `<div class="field-input">...</div>` is created by you here in this custom field. You will also have to give your field a name but since the `name` attribute is only allowed on standard input elements, you will need to use `data-name`. The last part is to specify a function name with `data-custom-validation`. We'll dive more into that in a moment.

###Resulting DOM
ReptileForms will still need to build some DOM around your custom field, but since you wrote your own  `<div class="field-input">...</div>`, it's contents will be left as-is.
```html
<form action="/process">
	<div class="field terms">
		<label>Terms</label>
		<div class="field-input">
			<span class="agree">Click Here to agree to terms</span>
		</div>
	</div>
</form>
```
###Register Custom Validation
With your ReptileForm object, you can augment custom validation methods as follows:
```js
var form = new ReptileForm();

form.customValidation('validateTerms', function(formField) {
	...
});
```
> Notice that the first parameter you will have access to (formField) is a jQuery object referencing the `.field` node of your custom field. 
