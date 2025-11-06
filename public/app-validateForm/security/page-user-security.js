// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  // variables
  let pageValidateForm = $('.validate-form');
  let submitButton = $('#btnDisabled');

  // jQuery Validation for all forms
  // --------------------------------------------------------------------
  if (pageValidateForm.length) {

    // ต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว
    $.validator.addMethod("minOneLower", function (value, element) {
      return this.optional(element) || /[a-z]/.test(value);
    }, "Must contain at least one lowercase letter (a-z).");

    // ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว
    $.validator.addMethod("minOneUpper", function (value, element) {
      return this.optional(element) || /[A-Z]/.test(value);
    }, "Must contain at least one uppercase letter (A-Z).");

    // ตรวจสอบสัญลักษณ์หรือช่องว่างอย่างน้อย 1 ตัว
    $.validator.addMethod("minTwoSymbolsOrSpaces", function (value, element) {
      return this.optional(element) || (value.match(/[\s\W]/g) || []).length >= 1;
    }, "Must contain at least 1 symbols or spaces.");

    pageValidateForm.validate({
      rules: {
        password: {
          required: true
        },
        new_password: {
          required: true,
          minlength: 6,
          minOneLower: true,
          minOneUpper: true,
          minTwoSymbolsOrSpaces: true
        },
        confirm_new_password: {
          minlength: 6,
          equalTo: '#new_password'
        },
        confirm_twofactor: {
          required: true,
          minlength: 6, // Minimum length is 6 characters
          maxlength: 6, // Maximum length is 6 characters
          digits: true, // Only allow digits
          min: 0, // Minimum value is 0
          max: 999999, // Maximum value is 999999
        },
      },
      messages: {
        new_password: {
          required: 'Please enter your Password',
          minlength: 'Enter at least 6 characters',
          minOneLower: 'Must contain at least one lowercase letter (a-z).',
          minOneUpper: 'Must contain at least one uppercase letter (A-Z).',
          minTwoSymbolsOrSpaces: 'Must contain at least 1 symbols or spaces.'
        },
        confirm_new_password: {
          minlength: 'Enter at least 6 characters',
          equalTo: 'The password and its confirm are not the same',
        },
        confirm_twofactor: {
          required: 'Please enter your two-factor authentication code.',
          minlength: 'Enter at least 6 digits.',
          maxlength: 'Enter at most 6 digits.',
          digits: 'Please enter digits only.',
          min: 'Please enter a value between 000000 and 999999.',
          max: 'Please enter a value between 000000 and 999999.',
        },
      }
    });

    pageValidateForm.on('submit', function (event) {

      // ตรวจสอบว่ากรอกข้อมูลครบแล้วหรือไม่
      if (pageValidateForm.valid() == true) {
        submitButton.prop('disabled', true);
      } else {
        submitButton.prop('disabled', false);
      }
    });

  }

});
