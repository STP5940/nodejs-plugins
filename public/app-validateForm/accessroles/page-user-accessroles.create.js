// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  // variables
  let pageValidateForm = $('.validate-form');

  // jQuery Validation for all forms
  // --------------------------------------------------------------------
  if (pageValidateForm.length) {

    pageValidateForm.validate({

      rules: {
        new_description: {
          required: true
        },
      },
      messages: {
        new_description: {
          required: 'Please enter your description',
        },
      }
    });

  }

});