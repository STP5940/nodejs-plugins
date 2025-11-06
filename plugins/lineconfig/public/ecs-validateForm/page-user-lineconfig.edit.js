// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  // variables
  let pageValidateForm = $('#extcustomersupdateForm');
  // let submitButton = $('#btnDisabled');

  // jQuery Validation for all forms
  // --------------------------------------------------------------------
  if (pageValidateForm.length) {

    pageValidateForm.validate({

      rules: {
        update_cuscod: {
          required: true
        },
        update_cusname: {
          required: true,
        },
      },
      messages: {
        update_cuscod: {
          required: 'Please enter your cuscod',
        },
        update_cusname: {
          required: 'Please enter your cusname',
        },
      }
    });

  }


  // jQuery Validation for all forms
  // --------------------------------------------------------------------

});