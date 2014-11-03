!(function($, window, document, undefined) {

	/**
	 * Reptile Form
	 */
	ReptileForm = function(el, s) {

		// Setup
		var self = this;
		self.customValidationFunctions = [];
		self.el = $(el);
		if (!self.el.length) return false;
	
		// Settings
		self.settings = $.extend(true, {
			xhr: true,
			action: self.el.attr('action') || window.location.pathname,
			expressions: {
				'number': {'rule': /^\d+$/, 'msg':'Invalid Number'},
				'email': {'rule':/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/,'msg':'Invalid Email.'},
				'password': {'rule':/^[\040-\176]{6,}$/,'msg':'Invalid Password, Must be at least 6 characters.'}
			}
		}, s);

		// Use Reptile Validation
		self.el.attr('novalidate', 'novalidate');

		// Reset Errors and Values
		self.clearErrors();
		self.clearValues();

		// Give the form a method and action if it doesn't have one
		if (!self.el.attr('method') && self.settings.xhr) self.el.attr('method', 'POST');
		
		// Render Fields
		self.el.children('input, select, textarea, .field-input').each(function() {
			if ($(this).parents('.field').length) return false;
			var field = $(this);
			switch(true) {
				case field.attr('type') == 'hidden':
					self.renderHiddenField(field); break;
				case field.hasClass('field-input'):
					field.replaceWith(self.renderCustomField(field)); break;
				default:
					field.replaceWith(self.renderField(field));
			}
		});
		
		// Handle Submit Form
		self.el.on('submit', function(e) {

			// Before Validation
			$(self).trigger('beforeValidation');

			// Is Form Valid
			if (self.validForm(this)) {

				// Before Submit
				$(self).trigger('beforeSubmit');

				if (!self.settings.xhr) return true;

				// Submit Form
				return self.submit(self.settings.action, self.getValues());

			// Validation Failed
			} else {

				$(self).trigger('validationError', [self.getErrors()]);
				return false;
			}

		});

		/**
		 * Custom Validation
		 */
		self.customValidation = function(name, cb) {
			this.customValidationFunctions[name] = cb;
		}

		/**
		 * Radio Group
		 */
		self.customValidation('validateRadioGroup', function(formField, error) {

			// Get Value
			var value = formField.find('input:checked').val();

			// Field Name
			var name = formField.data('name');

			// If no value is selected
			if (formField.data('required') && !value) error('Value Is Required');
			
			// Return Value
			return value;

		});

		/**
		 * Checkbox Group
		 */
		self.customValidation('validateCheckboxGroup', function(formField, error) {

			// Collect Values
			var values = $('input[type="checkbox"]:checked').map(function(){
				return $(this).val();
			}).get();

			// Field Name
			var name = formField.data('name');

			// If no value is selected
			if (formField.data('required') && !values.length) error('Value Is Required');
		
			// Return Values
			return values;

		});		

	}

	/**
	 * Register Event Emitter
	 */
	ReptileForm.prototype.on = function(e, cb) {
		$(this).on(e, cb);
	}

	/**
	 * Submit Method
	 */
	ReptileForm.prototype.submit = function(url, formValues) {
		var self = this;
		$.ajax({
			cache: false,
			type: self.el.attr('method'),
			dataType: 'JSON',
			url: url,
			data: formValues,
			success: function(data) {
				$(self).trigger('xhrSuccess', data);
			},
			error: function(xhr, settings, thrownError) {
				$(self).trigger('xhrError', xhr, settings, thrownError);
			}
		});
		return false;
	}

	/**
	 * Render Field
	 */
	ReptileForm.prototype.renderField = function(originalField) {
		
		// Setup
		var self = this;
		var name = originalField.attr('name');
		var title = originalField.attr('title') || null;
		var required = Boolean(originalField.attr('required'));
		var expressionName = originalField.data('exp-name') || null;
		var customValidation = originalField.data('custom-validation') || null;

		// Require Name
		if (!name) {
			console.error('ReptileForm: Unknown Field removed - name attribute not given');
			return null;
		}
		
		// Make new Field Input
		var fieldInput = $(originalField[0].outerHTML);
		fieldInput.removeAttr('title data-exp-name');
		var fieldInput = $(document.createElement('div'))
			.addClass('field-input')
			.html(fieldInput);
	
		// Get Field Type
		var fieldType = '';
		switch(originalField[0].tagName.toLowerCase()) {
			case 'select': fieldType = 'select'; break;
			case 'textarea': fieldType = 'textarea'; break;
			case 'input': 
			default: fieldType = 'text';
		}
		
		// Make field container
		return $(document.createElement('div'))
			.data('name', name)
			.data('title', title ? title : name)
			.data('exp-name', expressionName)
			.data('custom-validation', customValidation)
			.data('required', required)
			.addClass('field')
			.addClass(name)
			.addClass(required ? 'required' : null)
			.addClass(fieldType)
			.append(title ? '<label>' + title + '</label>' : null)
			.append(fieldInput);

	}


	/**
	 * Render Custom Field
	 */
	ReptileForm.prototype.renderCustomField = function(originalField) {
		
		// Setup
		var self = this;
		var fieldType = originalField.data('type');
		
		switch(fieldType !== undefined && fieldType.toLowerCase()) {
			case 'radio-group':
				var firstField = originalField.find('input[type="radio"]').first();
				var name = firstField.attr('name');
				var required = Boolean(firstField.attr('required'));
				var customValidation = 'validateRadioGroup';
				break;

			case 'checkbox-group':
				var firstField = originalField.find('input[type="checkbox"]').first();
				var name = firstField.attr('name');
				var required = Boolean(firstField.attr('required'));
				var customValidation = 'validateCheckboxGroup';
				break;

			default:
				var name = originalField.data('name') || null;
				var required = Boolean(originalField.data('required'));
				var customValidation = originalField.data('custom-validation') || null;

		}

		// Title
		var title = originalField.attr('title');

		// Require Name
		if (!name) {
			console.error('ReptileForm: Unknown Field removed - name attribute not given')
			return null;
		}

		// Make new Field Input
		var fieldInput = $(originalField[0].outerHTML);
		fieldInput.removeAttr('data-name data-required data-type data-custom-validation');

		// Make field container
		return $(document.createElement('div'))
			.data('name', name)
			.data('title', title)
			.data('custom-validation', customValidation)
			.data('required', required)
			.addClass('field')
			.addClass(name)
			.addClass(required ? 'required' : null)
			.addClass(fieldType)
			.append(title ? '<label>' + title + '</label>' : null)
			.append(fieldInput);

	}

	/**
	 * Render Field Hidden
	 */
	ReptileForm.prototype.renderHiddenField = function(field) {
		
		// Setup
		var self = this;
		var name = field.attr('name');
		var title = name
		var required = Boolean(field.attr('required'));

		// Require Name
		if (!name) {
			console.error('ReptileForm: Unknown Hidden Field removed - name attribute not given')
			return null;
		}

		// Modify Field to be similar to a field container
		field.addClass('field')
			.addClass(name)
			.data('name', field.attr('name'))
			.data('title', title)
			.data('required', required);
			
		return field.prop('outerHTML');

	}

	/**
	 * Valid Form
	 */
	ReptileForm.prototype.validForm = function(form) {
		
		// Setup
		var self = this;
		var form = $(form);
		self.clearErrors();
		self.clearValues();

		// Start New Form Validation
		form.find('.field').each(function() {

			var value = '';
			var formField = $(this);
			var title = formField.data('title');
			var name = formField.data('name');

			// Custom Validation
			var customValidationName = formField.data('custom-validation');
			if (customValidationName && $.isFunction(self.customValidationFunctions[customValidationName])) {
				value = self.customValidationFunctions[customValidationName].call(self, formField, function(message) {
					self.addError(name, title, message);
				});
				self.storeValue(name, value);
				return;
			}

			// Get / Store
			value = self.getFieldValue(formField);
			self.storeValue(name, value);

			// Validate Requiredness
			if (!formField.data('required') && !value) {
				return;

			} else if (formField.data('required') && !value) {
				self.addError(name, title, 'Value is required');
				return;
			}

			// Validate Expression Rule
			var expName = formField.data('exp-name');
			if (expName && self.settings.expressions) {
				if (!self.settings.expressions[expName]) {
					console.error('Expresion: \'' + expName + '\' has not been added to ReptileForms expressions')
					return false;
				}
				var expression = self.settings.expressions[expName];
				if (typeof expression.rule == 'string') {
					if (!eval(expression.rule).test(value)) self.addError(name, title, expression.msg);
				} else {
					var regex = new RegExp(expression.rule);
					if (!regex.test(value)) self.addError(name, title, expression.msg);
				}
			}
			
		});

		return $.isEmptyObject(self.getErrors());

	}

	/**
	 * Get Field Value
	 */
	ReptileForm.prototype.getFieldValue = function(formField) {

		// Field Name
		var name = formField.data('name');

		// Otherwise, see if we can just get the value using this logic
		var value;
		switch(true) {
			case formField.attr('type') && formField.attr('type').toLowerCase() == 'hidden':
				value = formField.val(); break;
			default:			
				value = formField.find('input, select, textarea').val() || null;	
		}

		return value;

	}

	ReptileForm.prototype.addError = function(name, title, msg) {
		this.formErrors.push({'name': name, 'title': title, 'msg': msg});
	}

	ReptileForm.prototype.clearErrors = function() {
		this.formErrors = [];
	}

	ReptileForm.prototype.getErrors = function() {
		return this.formErrors;
	}

	ReptileForm.prototype.storeValue = function(name, value) {
		this.formValues[name] = value;
	}

	ReptileForm.prototype.clearValues = function() {
		this.formValues = {};
	}

	ReptileForm.prototype.getValues = function() {
		return this.formValues;
	}
	
})(jQuery, window, document);