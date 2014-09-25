# ReptileForms
> Extensible, unopinionated forms and validation

## Overview
ReptileForms serves two main purposes:
- Provide timely event emitters and a common validation workflow
- Extend common and custom input fields with DOM that can be stylized your way

## Install
### Bower
```sh
$ bower install --save ReptileForms
```
### Dependencies
jQuery `^1.7.0`

## Basic Usage
###JS
Initialize ReptileForms by calling `ReptileForm([css selector], [settings])`
```js
var form = new ReptileForm('form');
```
###Initial HTML
Create a small amount of HTML with standard fields and attributes
```html
<form action="/process">
	<input type="text" name="first_name" title="First Name" required maxlength="20">
	<input type="text" name="last_name" title="Last Name" required maxlength="20">
	<button type="submit">Submit</button>
</form>
```
###Resulting DOM
ReptileForms will extend your DOM with some new containers for each field
```html
<form action="/process">

	<div class="field first_name required text">
		<label>First Name</label>
		<div class="field-input">
			<input type="text" name="first_name" maxlength="20">
		</div>
	</div>
	
	<div class="field last_name required text">
		<label>Last Name</label>
		<div class="field-input">
			<input type="text" name="last_name" maxlength="20">
		</div>
	</div>
	
	<button type="submit">Submit</button>
</form>
```
ReptileForms seeks out standard form fields and gives them new containers for styling purposes.

Notice that the `title` attribute was used to create our `<label>` and was removed form the `<input>` field. Each field has an overall new container: `<div class="field first_name required text">` with convenient styling hooks.

`required` attributes are used to denote a field's requiredness. However ReptileForms will use custom validation and will remove them by default. This can be overridden.

## AJAX

The default method for ReptileForms is POST which you can override with a `method` attribute on the form. ReptileForms will also use AJAX submission by default and will use the form's `action` attribute as a destination. The `action` attribute is required when ReptileForms is in AJAX submission mode. This can be overridden as follows:
```js
var form = new ReptileForm('form', {
	xhr: false
});
```

## Regular Expressions

ReptileForms allows developers to submit their own list of regular expressions. Each Expression will have a name, a message for errors, and a regular expression rule.

By default, ReptileForms has three expressions in the list named: `number`, `email` and `password`. The list of regular expressions can be modified as follows:
```js
// Setting can be overridden as follows:
var form = new ReptileForm('form', {
	expressions: {
		zip: {rule: /^\d{5}$/, msg: 'Invalid Zip Code'}
	}
});
```
> In this case `zip` is the name

To apply a regular expression to a field in your form, use the `data-exp-name` attribute as follows:
```html
<form action="/process">

	<!-- Built-in expressions for 'email' and 'password' -->
	<input type="text" name="email" title="Email" required data-exp-name="email">
	<input type="password" name="password" title="Password" required data-exp-name="password">
	
	<!-- Developer supplied expression for 'zip' -->
	<input type="text" name="zip" title="Zip" required data-exp-name="zip" max-length="5">
	
	<button type="submit">Submit</button>
	
</form>
```
> Note that for good UX, you should probably also provide `max-length` attributes where nessesary

## Events
It's your world, we just live in it. ReptileForms has no opinions on how you should handle errors, successes, and other events. The following events can be hooked into with callbacks to provide you with ultimate flexibility:
- `beforeValidation` - Called just before the form starts to validate
- `validationError` - Called if there were errors during client-side validation
- `beforeSubmit` - Called just after validation was successful and before the form submits
- `xhrSuccess` - Called when the AJAX submission has returned successfuly 
- `xhrError` - Called when the AJAX submission has returned with an error

###Event Examples
```js
var form = new ReptileForm('form');

// Do something before validation starts
form.on('beforeValidation', function() {
	...
});

// Do something when errors are detected.
form.on('validationError', function(e, err) {
	...
});

// Do something after validation is successful, but before the form submits.
form.on('beforeSubmit', function() {
	...
});

// Do something when the AJAX request has returned in success
form.on('xhrSuccess', function(e, data) {
	...
});

// Do something when the AJAX request has returned with an error
form.on('xhrError', function(e, xhr, settings, thrownError) {
	...
});
```
Each callback will have access to the ReptileForm object via `this` keyword. Common methods include:

- `addError(name, title, message)`
- `clearErrors()`
- `getErrors()`
- `getValues()`

## Custom Fields
ReptileForms was created so making custom fields is easy. Compared to standard fields where ReptileForms will create containers for your fields - with custom fields you create the `field-input` manually to indicate a custom field:

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
###Custom Field Validation

Custom fields also require custom validation written by you. As you can see from above, when you create your `.field-input` container, you will also need to provide a `data-custom-validation` attribute to specify a function name. Then you can register that function with ReptileForms as follows:
```js
var form = new ReptileForm();

form.customValidation('validateTerms', function(formField, error) {
	// Notice that the first parameter we will give you (formField) is a jQuery
	// object referencing the .field node of your custom field. 
	
	// Here is where you will conduct your custom field's validation. If you found
	// an error, log it with:
	error('Error Message');
	
	// Always return a value, the value must be the custom field's value if any
	return true;
});
```
