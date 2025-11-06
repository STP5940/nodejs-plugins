// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  // variables
  let pageValidateForm = $('.validate-form');
  let accountNumberMask = $('.account-number-mask');
  // let submitButton = $('#btnDisabled');

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
        new_usersroleId: {
          required: true
        },
        new_firstname: {
          required: true
        },
        new_lastname: {
          required: true
        },
        new_mail: {
          required: true,
          email: true
        },
        new_username: {
          required: true
        },
        new_password: {
          required: true,
          minlength: 6,
          minOneLower: true,
          minOneUpper: true,
          minTwoSymbolsOrSpaces: true
        },
      },
      messages: {
        new_usersroleId: {
          required: 'Please enter your roles',
        },
        new_firstname: {
          required: 'Please enter your firstname',
        },
        new_lastname: {
          required: 'Please enter your firstname',
        },
        new_mail: {
          required: 'Please enter your Email address',
          email: "Please enter a valid email address"
        },
        new_username: {
          required: 'Please enter your Username',
        },
        new_password: {
          required: 'Please enter your Password',
          minlength: 'Enter at least 6 characters',
          minOneLower: 'Must contain at least one lowercase letter (a-z).',
          minOneUpper: 'Must contain at least one uppercase letter (A-Z).',
          minTwoSymbolsOrSpaces: 'Must contain at least 1 symbols or spaces.'
        },
      }
    });

  }


  // jQuery Validation for all forms
  // --------------------------------------------------------------------

  //phone
  if (accountNumberMask.length) {
    accountNumberMask.each(function () {
      new Cleave($(this), {
        phone: true,
        phoneRegionCode: 'TH'
      });
    });
  }

});