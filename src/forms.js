;(function($, window, document, undefined) {

	/**
	 * Form Object
	 */
	var form = function(form, settings) {
	
		// Default Settings
		var default_settings = {
			method: 'POST',
			action: window.location,
			submit: false,
			beforeSubmit: false,
			afterSubmit: false,
			afterSuccess: false,
			validationError: false
		};

		// Initialy Setup
		var self = this;
		self.form = form;
		self.settings = $.extend(default_settings, settings);
		if (!$.isFunction(this.settings.submit)) { self.settings.submit = self.submitAjax };
		self.formErrors = [];
		self.formValues = {};

		// Setup Method and Action
		if (!self.form.attr('method')) { self.form.attr('method', self.settings.method); }
		if (!self.form.attr('action')) { self.form.attr('action', self.settings.action); }

		// Render Fields
		self.form.children('input, select, textarea, .field-input').each(function() {
			var field = $(this);
			if (field.attr('type') == 'hidden') {
				self.renderFieldHidden(field);
			} else {
				field.replaceWith(self.renderField(field));
			}
		});

		// Submit Form Event
		self.form.on('submit', function() {
			self.form.find('input[name="process_form"]').remove();
			if (self.validate()) {
				
				// Ensure Submit Function Exists
				if (!$.isFunction(self.settings.submit)) {
					alert('No Submit Function Defined');
					return false;
				}

				// Before Submit
				if ($.isFunction(self.settings.beforeSubmit)) {
					if (false === self.settings.beforeSubmit.call(self))	return false;
				}

				// Submit
				var shallSubmit = self.settings.submit.call(self, self.form.attr('action'), self.formValues);
				
				if (shallSubmit == undefined) {
					return true;
				} else {
					return shallSubmit;
				}
			} else {
				return false;
			}
			return true;
		});

	}

	/***********************************
	  RENDER
	************************************/

	/**
	 * Render Field
	 */
	form.prototype.renderField = function(originalField) {
		
		// Setup
		var self = this;
		var title = originalField.attr('title') || null;
		var name = originalField.attr('name');

		// Custom Fields
		if (originalField.hasClass('field-input')) {
			var fieldInput = originalField[0].outerHTML;

		// Standard Fields
		} else {
			var fieldInput = $(document.createElement('div'))
				.addClass('field-input')
				.html(originalField[0].outerHTML);
		}

		// Get Field Type
		//var fieldType = originalField.data('input-type');
		//if (!fieldType) {
			switch(originalField[0].tagName.toLowerCase()) {
				case 'select': fieldType = 'select'; break;
				case 'textarea': fieldType = 'textarea'; break;
				case 'input': 
				default: fieldType = 'text';
			}
		//}

		// Make form-field container
		return $(document.createElement('div'))
			.addClass('field')
			//.addClass(originalField.attr('required') != undefined ? 'required' : null)
			.addClass(fieldType)
			//.data('name', name)
			//.data('field-type', fieldType)
			//.data('exp-name', originalField.data('exp-name'))
			//.data('handle', originalField.data('handle'))
			.append(title ? '<div class="title">' + title + '</div>' : null)
			.append(fieldInput);

	}

	/**
	 * Render Field Hidden
	 */
	form.prototype.renderFieldHidden = function(field) {
		var self = this;

		// Make form-field container
		field.addClass('form-field')
			.addClass(field.attr('required') != undefined ? 'required' : null)
			.data('input-type', 'hidden')
			.data('name', field.attr('name'));
			//.addClass(inputType)
			//.data('exp-name', field.data('exp-name'))
			//.data('handle', field.data('handle'))

		//return field.prop('outerHTML');

	}


	/***********************************
	  SUBMIT FORM
	************************************/

	/**
	 * Submit via Ajax
	 */
	form.prototype.submitAjax = function(url, formValues) {
		var self = this;
		$.ajax({
			url: url,
			data: formValues,
			afterSuccess: function(data) {
				if ($.isFunction(self.settings.afterSubmit)) { self.settings.afterSubmit.call(self) };
				if (data.success && $.isFunction(self.settings.afterSuccess)) { self.settings.afterSuccess.call(self) };
			}
		});
		return false;
	}


	/***********************************
	  VALIDATION
	************************************/

	/**
	 * Validate
	 */
	form.prototype.validate = function() {
		var self = this;

		// Reset Form Validation
		self.clearErrors();
		self.clearValues();

		// Start New Form Validation
		self.form.find('.form-field').each(function() {
			var formField = $(this);

			// Custom Validation (based on handle)
			var handle = formField.data('handle');
			if (handle && self[handle + 'Validate']) {
				self[handle + 'Validate'](formField);
				return;
			}

			// Common Validation
			var value = self.getFieldValue(formField);
			var isRequired = formField.hasClass('required');

			// Validate Requiredness
			if (isRequired && !value.length) {
				self.addError(self.getFieldTitle(formField), 'Value is required');
				return;
			}

			// Validate Expression Rule
			var expName = formField.data('exp-name');
			if (expName) { 
				var expression = util.expression_library.get(expName);
				if (expression && expression.rule && !eval(expression.rule).test(value)) {
					self.addError(self.getFieldTitle(formField), expression.msg);
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

	/***********************************
	  GET FIELD TITLE / VALUE
	************************************/

	/**
	 * Get Field Title
	 */
	form.prototype.getFieldTitle = function(formField) {
		return formField.children('.title').text();
	}

	/**
	 * Get Field Value
	 */
	form.prototype.getFieldValue = function(formField) {
		var self = this;

		// See if field has custom getter for value
		var handle = formField.data('handle');
		if (handle && self[handle + 'GetValue']) {
			return self[handle + 'GetValue'](formField);
		}

		// Otherwise, see if we can just get the value using this logic
		var value;
		switch(formField.data('input-type')) {
			case 'hidden': value = formField.val(); break;
			case 'select': value = formField.find('select').val(); break;
			case 'textarea': value = formField.find('textarea').val(); break;
			default: value = formField.find('input').val();
		}

		self.storeValue(formField.data('name'), value);
		return value;

	}

	/***********************************
	  FORM VALUES AND ERRORS
	************************************/

	form.prototype.addError = function(title, msg) {
		this.formErrors.push({'title': title, 'msg': msg});
	}

	form.prototype.clearErrors = function() {
		this.formErrors = [];
	}

	form.prototype.getErrors = function() {
		return this.formErrors;
	}

	form.prototype.storeValue = function(name, value) {
		this.formValues[name] = value;
	}

	form.prototype.clearValues = function() {
		this.formValues = {};
	}

	form.prototype.getValues = function() {
		return this.formValues;
	}


	/***********************************
	  CUSTOM FIELD METHODS
	************************************/

	/** Form Field: Checkbox Group **/

	form.prototype.checkboxGroupValidate = function(formField) {
		var self = this;
		var title = self.getFieldTitle(formField);
		var value = self.checkboxGroupGetValue(formField);
		self.storeValue(title, value);
		var isRequired = formField.hasClass('required');
		if (isRequired && !value.length) {
			self.addError(title, 'Value Is Required');
			return;
		}
	}

	form.prototype.checkboxGroupGetValue = function(formField) {
		var value = [];
		formField.find('input[type="checkbox"]').each(function() {
			if ($(this).is(':checked') && $(this).val()) {value.push($(this).val());}
		});
		return value;
	}

	/***********************************
	  PUGIN
	************************************/

	$.fn.form = function(settings) {
		if (!$.data(this, 'form')) {
			$.data(this, 'form', new form($(this), settings));
		}
		return this
	}
	
})(jQuery, window, document);