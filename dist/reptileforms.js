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
			beforeValidation: function() {},
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

			// Before Validation
			if ($.isFunction(self.settings.beforeValidation)) {
				if (false === self.settings.beforeValidation.call(self)) return false;
			}

			// Validate
			if (self.validate()) {

				// Use browser's default submit
				if (!self.settings.useAjax) return true;

				// Before Submit
				if ($.isFunction(self.settings.beforeSubmit)) {
					if (false === self.settings.beforeSubmit.call(self)) return false;
				}

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
			.append(title ? '<div class="title">' + title + '</div>' : null)
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


		var title = originalField.attr('title') || name;
		//var expressionName = originalField.data('exp-name') || null;

		// Require Name
		if (!name) {
			console.error('Input field removed from form. Name is required.')
			return null;
		}

		// Make new Field Input
		var fieldInput = $(originalField[0].outerHTML);
		fieldInput.removeAttr('data-title data-name data-required data-exp-name data-type data-custom-validation');

		// Make field container
		return $(document.createElement('div'))
			.data('name', name)
			.data('title', title)
			//.data('exp-name', expressionName)
			.data('custom-validation', customValidation)
			.data('required', required)
			.addClass('field')
			.addClass(name)
			.addClass(required ? 'required' : null)
			.addClass(fieldType)
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

		// Modify Field to be similar to a field container
		field.addClass('field')
			.addClass(name)
			.data('name', field.attr('name'))
			.data('title', title)
			.data('required', required);
			
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
			var value = '';
			var formField = $(this);
			var title = formField.data('title');
			var name = formField.data('name');

			// Custom Validation
			var customValidation = formField.data('custom-validation');
			if (customValidation && $.isFunction(self[customValidation])) {
				value = self[customValidation](formField);
				self.storeValue(name, value);
				return;
			}

			// Get / Store
			value = self.getFieldValue(formField);
			self.storeValue(name, value);

			// Validate Requiredness
			if (formField.data('required') && !value) {
				self.addError(name, title, 'Value is required');
				return;
			}

			// Validate Expression Rule
			var expName = formField.data('exp-name');
			if (expName && self.settings.expressions) { 
				var expression = self.settings.expressions[expName];
				if (expression && expression.rule && !eval(expression.rule).test(value)) {
					self.addError(name, title, expression.msg);
				}
			}
			
		});

		// If there were errors, call validationError
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
	  CUSTOM FIELD VALIDATION
	************************************/

	/**
	 * Radio Group
	 */
	ReptileForm.prototype.validateRadioGroup = function(formField) {

		// Get Value
		var value = formField.find('input:checked').val();

		// Store Values
		var name = formField.data('name');
		this.storeValue(name, value);

		if (formField.data('required') && !value) {
			this.addError(name, formField.data('title'), 'Value Is Required');
			return false;
		}
		
		return value;

	}
	
	/**
	 * Checkbox Group
	 */
	ReptileForm.prototype.validateCheckboxGroup = function(formField) {
		
		// Collect Values
		var values = $('input[type="checkbox"]:checked').map(function(){
			return $(this).val();
		}).get();

		// Store Values
		var name = formField.data('name');
		this.storeValue(name, values);

		if (formField.data('required') && !values.length) {
			this.addError(name, formField.data('title'), 'Value Is Required');
			return false;
		}
		
		return values;

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