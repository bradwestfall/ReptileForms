## Getting Started v0.1.0
This code requires jQuery `^1.7.0`

### Features
- Easy Callbacks
- Built-in validation
 - Easily add custom regular expressions
- OOCSS Approach
 - Structure Styles Supplied
- Easy-use common fields
- Easily build custom fields

### Basic Usage
####Basic Usage
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
####Starting HTML
```html
<form class="reptile-form" action="/process" method="POST">
	<input type="text" name="first-name" title="First Name" required maxlength="20">
	<button>Login</button>
</form>
```
####Resulting DOM
```html
<form class="reptile-form" action="/process" method="POST">
	<div class="field email required text">
		<div class="title">First Name</div>
		<div class="field-input">
			<input type="text" name="first-name" maxlength="20">
		</div>
	</div>
	<button>Login</button>
</form>
```
### Basic Fields
Use `<input>`, `<select>`, or `<textarea>` tags with standard attribtues such as `name` (required), `type`, `reqired`, `maxlength`, etc...
Also use these attributes for additional ReptileForms functionality:
- `title` Will be used as a visual title and also for error messages
- `data-exp-name` The name of the regular expression to use in validation

### Custom Fields
Documentation coming soon