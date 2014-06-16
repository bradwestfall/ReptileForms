## Getting Started
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
	<input type="text" name="first-name" title="FirstName" required maxlength="20">
	<button>Login</button>
</form>
```
####Resulting DOM
```html
<form class="reptile-form" action="/process" method="POST">
	<div class="field email required text">
		<div class="title">Email</div>
		<div class="field-input">
			<input type="text" name="first-name" maxlength="20">
		</div>
	</div>
	<button>Login</button>
</form>
```
### Custom Fields