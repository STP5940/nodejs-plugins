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