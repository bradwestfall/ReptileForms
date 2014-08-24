!(function($, window, document, undefined) {
	
	/**
	 * Start Reptile Form Objects
	 */
	ReptileForm = function(forms, settings) {
		
		// Set Form Objects 
		this.forms = forms;
		$(forms).each(function() {
			$(this).data('rf', new rf(this, settings));
		});

		/**
		 * Radio Group
		 */
		this.customValidation('validateRadioGroup', function(formField) {

			// Get Value
			var value = formField.find('input:checked').val();

			// Field Name
			var name = formField.data('name');

			// If no value is selected
			if (formField.data('required') && !value) this.addError(name, formField.data('title'), 'Value Is Required');
			
			// Return Value
			return value;

		});

		/**
		 * Checkbox Group
		 */
		this.customValidation('validateCheckboxGroup', function(formField) {

			// Collect Values
			var values = $('input[type="checkbox"]:checked').map(function(){
				return $(this).val();
			}).get();

			// Field Name
			var name = formField.data('name');

			// If no value is selected
			if (formField.data('required') && !values.length) this.addError(name, formField.data('title'), 'Value Is Required');
		
			// Return Values
			return values;

		});

	}
	
	/**
	 * Register Custom Validation
	 */
	ReptileForm.prototype.customValidation = function(f, cb) {
		$(this.forms).each(function() {
			$(this).data('rf').customValidation[f] = cb;
		});
	}

	/**
	 * Register Event Emitter
	 */
	ReptileForm.prototype.on = function(e, cb) {
		$(this.forms).each(function() {
			var rf = $(this).data('rf');
			$(rf).on(e, cb);
		});
	}

	/**
	 * Apply custom submit functionality
	 */
	ReptileForm.prototype.submit = function(cb) {
		$(this.forms).each(function() {
			var rf = $(this).data('rf');
			rf.submit = cb;
		});
	}

	/**
	 * Reptile Form
	 */
	rf = function(el, s) {

		// Setup
		var self = this;
		self.customValidation = [];
		self.el = $(el);
		if (!self.el.length) return false;
	
		// Settings
		self.settings = $.extend(true, {
			xhr: true,
			expressions: {
				'email': {'rule':/^[a-zA-Z0-9._-]+@[\.a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/,'msg':'Invalid Email.'},
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
		if (!self.el.attr('action') && self.settings.xhr) console.error('ReptileForm: action attribue is required when in xhr mode');

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
				return self.submit(self.el.attr('action'), self.getValues());

			// Validation Failed
			} else {
				$(self).trigger('validationError', [self.getErrors()]);
				return false;
			}

		});

	}

	/**
	 * Submit Method
	 */
	rf.prototype.submit = function(url, formValues) {
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
	rf.prototype.renderField = function(originalField) {
		
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
	rf.prototype.renderCustomField = function(originalField) {
		
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
	rf.prototype.renderHiddenField = function(field) {
		
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
	rf.prototype.validForm = function(form) {
		
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
			var customValidation = formField.data('custom-validation');
			if (customValidation && $.isFunction(self.customValidation[customValidation])) {
				value = self.customValidation[customValidation].call(self, formField);
				self.storeValue(name, value);
				return;
			}

			// Get / Store
			value = self.getFieldValue(formField);
			self.storeValue(name, value);

			// Validate Requiredness
			if (!formField.data('required') && value == null) {
				return;

			} else if (formField.data('required') && !value) {
				self.addError(name, title, 'Value is required');
				return;
			}

			// Validate Expression Rule
			var expName = formField.data('exp-name');
			if (expName && self.settings.expressions) { 
				var expression = self.settings.expressions[expName];
				var rule = (typeof expression.rule == 'string') ? eval(expression.rule) : expression.rule;
				if (expression && expression.rule && !rule.test(value)) {
					self.addError(name, title, expression.msg);
				}
			}
			
		});

		return $.isEmptyObject(self.getErrors());

	}

	/**
	 * Get Field Value
	 */
	rf.prototype.getFieldValue = function(formField) {

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

	rf.prototype.addError = function(name, title, msg) {
		this.formErrors.push({'name': name, 'title': title, 'msg': msg});
	}

	rf.prototype.clearErrors = function() {
		this.formErrors = [];
	}

	rf.prototype.getErrors = function() {
		return this.formErrors;
	}

	rf.prototype.storeValue = function(name, value) {
		this.formValues[name] = value;
	}

	rf.prototype.clearValues = function() {
		this.formValues = {};
	}

	rf.prototype.getValues = function() {
		return this.formValues;
	}
	
})(jQuery, window, document);