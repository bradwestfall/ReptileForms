!(function($, window, document, undefined) {
	ReptileForm = function(el, settings) {

		// Setup
		var self = this;
		self.el = $(el);
		if (!self.el.length) { return false; }
	
		// Settings
		self.settings = $.extend({
			method: 'POST',
			action: window.location,
			useAjax: true,
			reptileValidation: true,
			expressions: {
				"email": {"rule":"\/^[a-zA-Z0-9._-]+@[\\.a-zA-Z0-9-]+\\.[a-zA-Z.]{2,5}$\/","msg":"Invalid Email."},
				"password": {"rule":"\/^[\\040-\\176]{6,30}$\/","msg":"Invalid Password, Must be between 6 and 30 characters."}
			},
			ready: function() {},
			validationError: function() {},
			beforeSubmit: function() {},
			submitSuccess: function() {},
			submitError: function() {}
		}, settings);

		// Use Reptile Validation
		if (self.settings.reptileValidation) self.el.attr('novalidate', 'novalidate');

		// Reset Errors and Values
		self.clearErrors();
		self.clearValues();

		// Setup Method and Action
		if (!self.el.attr('method')) { self.el.attr('method', self.settings.method); }
		if (!self.el.attr('action')) { self.el.attr('action', self.settings.action); }

		// Render Fields
		self.el.children('input, select, textarea, .field-input').each(function() {
			if ($(this).parents('.field').length) return false;
			var field = $(this);
			switch(true) {
				case field.attr('type') == 'hidden':
					self.renderFieldHidden(field); break;
				case field.hasClass('field-input'):
					field.replaceWith(self.renderCustomField(field)); break;
				default:
					field.replaceWith(self.renderField(field));
			}
		});

		// Submit Form
		self.el.on('submit', function() {

			// Before Submit
			if ($.isFunction(self.settings.beforeSubmit)) {
				if (false === self.settings.beforeSubmit.call(self)) return false;
			}

			// Validate
			if (self.validate()) {

				// Use browser's default submit
				if (!self.settings.useAjax) return true;
				
				// Submit Form
				self.submitForm.call(self, self.el.attr('action'), self.getValues());
				return false;

			// Validation Failed
			} else {
				return false;
			}
		});

		// Ready
		if ($.isFunction(self.settings.ready)) { self.settings.ready.call(self); }

	}

	/***********************************
	  RENDER
	************************************/

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
			console.error('Field removed, requires name.')
			return null;
		}
		
		// Make new Field Input
		var fieldInput = $(originalField[0].outerHTML);
		fieldInput.removeAttr('title required data-exp-name');
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
			.addClass('field')
			.addClass(name)
			.addClass(required ? 'required' : null)
			.addClass(fieldType)
			.append(title ? '<div class="title">' + title + '</div>' : null)
			.append(fieldInput);

	}


	/**
	 * Render Custom Field
	 */
	ReptileForm.prototype.renderCustomField = function(originalField) {
		
		// Setup
		var self = this;
		var name = originalField.data('name');
		var title = originalField.data('title') || null;
		var required = Boolean(originalField.data('required'));
		var expressionName = originalField.data('exp-name') || null;
		var customValidation = originalField.data('custom-validation') || null;

		// Require Name
		if (!name) {
			console.error('Input field removed from form. Name is required.')
			return null;
		}

		// Make new Field Input
		var fieldInput = $(originalField[0].outerHTML);
		fieldInput.removeAttr('data-title data-name data-required data-exp-name data-custom-validation');

		// Make field container
		return $(document.createElement('div'))
			.data('name', name)
			.data('title', title ? title : name)
			.data('exp-name', expressionName)
			.data('custom-validation', customValidation)
			.addClass('field')
			.addClass(name)
			.addClass(required ? 'required' : null)
			.append(title ? '<div class="title">' + title + '</div>' : null)
			.append(fieldInput);

	}

	/**
	 * Render Field Hidden
	 */
	ReptileForm.prototype.renderFieldHidden = function(field) {
		
		// Setup
		var self = this;
		var name = field.attr('name');
		var title = name
		var required = Boolean(field.attr('required'));

		// Require Name
		if (!name) {
			console.error('Field removed, requires name.')
			return null;
		}

		// Make form-field container
		field.data('name', field.attr('name'))
			.data('title', title)
			.addClass('field')
			.addClass(name)

		return field.prop('outerHTML');

	}


	/***********************************
	  VALIDATION
	************************************/

	/**
	 * Validate
	 */
	ReptileForm.prototype.validate = function() {
		
		// Setup
		var self = this;
		self.clearErrors();
		self.clearValues();

		// Start New Form Validation
		self.el.find('.field').each(function() {
			var formField = $(this);
			var title = formField.data('title');
			var name = formField.data('name');

			// Custom Validation
			var customValidation = formField.data('custom-validation');
			if (customValidation && $.isFunction(self[customValidation])) {
				var value = self[customValidation](formField);
				self.storeValue(name, value);
				return;
			}

			// Common Validation
			var value = self.getFieldValue(formField);
			var isRequired = Boolean(formField.hasClass('required')) || Boolean(formField.attr('required'));
			self.storeValue(name, value);

			// Validate Requiredness
			if (isRequired && !value) {
				self.addError(title, 'Value is required');
				return;
			}

			// Validate Expression Rule
			var expName = formField.data('exp-name');
			if (expName && self.settings.expressions) { 
				var expression = self.settings.expressions[expName];
				if (expression && expression.rule && !eval(expression.rule).test(value)) {
					self.addError(title, expression.msg);
				}
			}
			
		});

		// If there were errors, show them now
		if (!$.isEmptyObject(self.getErrors())) {
			if ($.isFunction(self.settings.validationError)) { self.settings.validationError.call(self, self.getErrors()) };
			return false;
		} else {
			return true;
		}

	}

	/**
	 * Get Field Value
	 */
	ReptileForm.prototype.getFieldValue = function(formField) {

		// Require Name
		var name = formField.data('name');
		if (!name) {
			console.error('Cannot retreive value from field. Name is required.')
			return null;
		}

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

	/***********************************
	  SUBMIT FORM
	************************************/

	/**
	 * Submit via Ajax
	 */
	ReptileForm.prototype.submitForm = function(url, formValues) {
		var self = this;
		$.ajax({
			cache: false,
			type: 'POST',
			dataType: 'JSON',
			url: url,
			data: formValues,
			success: function(data) {
				if ($.isFunction(self.settings.submitSuccess)) { self.settings.submitSuccess.call(self, data); }
			},
			error: function(xhr, settings, thrownError) {
				if ($.isFunction(self.settings.submitError)) { self.settings.submitError.call(self, xhr, settings, thrownError); }
			}
		});
	}

	/***********************************
	  FORM VALUES AND ERRORS
	************************************/

	ReptileForm.prototype.addError = function(title, msg) {
		this.formErrors.push({'title': title, 'msg': msg});
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


	/***********************************
	  CUSTOM FIELD METHODS
	************************************/

	// ReptileForm.prototype.checkboxGroupValidate = function(formField) {
	// 	var self = this;
	// 	var title = formField.data('title');
	// 	var value = self.checkboxGroupGetValue(formField);
	// 	self.storeValue(title, value);
	// 	var isRequired = formField.hasClass('required');
	// 	if (isRequired && !value.length) {
	// 		self.addError(title, 'Value Is Required');
	// 		return;
	// 	}
	// }

	// ReptileForm.prototype.checkboxGroupGetValue = function(formField) {
	// 	var value = [];
	// 	formField.find('input[type="checkbox"]').each(function() {
	// 		if ($(this).is(':checked') && $(this).val()) {value.push($(this).val());}
	// 	});
	// 	return value;
	// }
	
})(jQuery, window, document);