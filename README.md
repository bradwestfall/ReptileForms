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

## Events
It's your world, we just live in it. ReptileForms has no opinions on how you should handle errors, successes, and other events. The following events can be hooked into with callbacks to provide you with ultimate flexibility:
- `beforeValidation` - Called just before the form starts to validate
- `validationError` - Called if there were errors during client-side validation
- `beforeSubmit` - Called just after validation was successful and before the form submits
- `submitSuccess` - Called when the AJAX submission has returned successfuly 
- `submitError` - Called when the AJAX submission has returned with an error










## Custom Fields
ReptileForms was created so making custom fields is easy. Compared to standard fields where ReptileForms will create containers for your fields - with custom fields you create the `field-input` container as follows:

###Initial HTML
```html
<form action="/process">
	<div class="field-input" data-name="terms" data-custom-validation="validateTerms" title="Terms">
		<span class="agree">Click Here to agree to terms</span>
	</div>
</form>
```
> With the `.field-input` container you create, you will also need to provide a name for your custom field. But since the `name` attribute is only allowed on standard input elements by the W3, you will need to use `data-name` instead (only for custom fields). 

###Resulting DOM
ReptileForms will still need to build some DOM around your custom field, but since you wrote your own  `<div class="field-input">...</div>`, its contents will be left as-is.
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
###Custom Validation

Custom fields also require custom validation written by you. As you can see from above, when you create your `.field-input` container, you will also need to provide a `data-custom-validation` attribute to specify a function name. Then you can register that function with ReptileForms as follows:
```js
var form = new ReptileForm();

form.customValidation('validateTerms', function(formField) {
	...
});
```
> Notice that the first parameter we will give you (formField) is a jQuery object referencing the `.field` node of your custom field. 
