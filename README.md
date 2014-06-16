## Getting Started

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
```html
<form class="reptile-form" action="/process" method="POST">
	<input type="hidden" name="process_form" value="true" required>
	<input type="email" name="email" title="Email" required maxlength="100" data-exp-name="email">
	<input type="password" name="password" title="Password" required maxlength="20" data-exp-name="password">
	<button>Login</button>
</form>
```