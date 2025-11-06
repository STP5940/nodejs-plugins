$(function () {
  'use strict';

  // variables
  let pageValidateForm = $('.validate-form');
  let submitButton = $('#btnDisabled');

  // jQuery Validation for all forms
  // --------------------------------------------------------------------
  if (pageValidateForm.length) {

    pageValidateForm.validate({
      rules: {
        confirm_twofactor: {
          required: true,
          minlength: 6, // Minimum length is 6 characters
          maxlength: 6, // Maximum length is 6 characters
          digits: true, // Only allow digits
          min: 0, // Minimum value is 0
          max: 999999, // Maximum value is 999999
        }
      },
      messages: {
        confirm_twofactor: {
          required: 'Please enter your two-factor authentication code.',
          minlength: 'Enter at least 6 digits.',
          maxlength: 'Enter at most 6 digits.',
          digits: 'Please enter digits only.',
          min: 'Please enter a value between 000000 and 999999.',
          max: 'Please enter a value between 000000 and 999999.',
        }
      }
    });

    pageValidateForm.on('submit', function (event) {
      // Check if the form is valid
      if (pageValidateForm.valid()) {
        submitButton.prop('disabled', true);
      } else {
        submitButton.prop('disabled', false);
      }
    });

  }

});
