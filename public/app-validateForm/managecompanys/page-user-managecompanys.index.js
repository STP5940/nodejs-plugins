// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  function validateForm(formId) {
    let newPasswordId = `new_password_${formId}`;
    let pageValidateForm = $(`#${formId}`);

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

    // Initialize validation for the current form
    pageValidateForm.validate({
      rules: {
        [newPasswordId]: {
          required: true,
          minlength: 6,
          minOneLower: true,
          minOneUpper: true,
          minTwoSymbolsOrSpaces: true
        }
      },
      messages: {
        [newPasswordId]: {
          required: 'Please enter your Password',
          minlength: 'Enter at least 6 characters',
          minOneLower: 'Must contain at least one lowercase letter (a-z).',
          minOneUpper: 'Must contain at least one uppercase letter (A-Z).',
          minTwoSymbolsOrSpaces: 'Must contain at least 1 symbols or spaces.'
        }
      },
    });
  }

  $('.validate-form').each(function (index) {
    const formId = $(this).attr('id');
    validateForm(formId);
  });

});