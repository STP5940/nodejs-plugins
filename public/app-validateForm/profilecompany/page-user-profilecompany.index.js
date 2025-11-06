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
        new_companyname: {
          required: true
        },
        new_mail: {
          required: true,
          email: true
        },
        new_companynamethai: {
          required: true
        },
        new_companyaddressthai: {
          required: true
        },
        new_companytaxid: {
          required: true,
          digits: true,
          minlength: 13,
          maxlength: 13
        }
      },
      messages: {
        new_companyname: {
          required: 'Please enter your Company name',
        },
        new_mail: {
          required: 'Please enter your Email address',
          email: "Please enter a valid email address"
        },
        new_companynamethai: {
          required: 'Please enter your Company name (Thai)',
        },
        new_companyaddressthai: {
          required: 'Please enter your Company address (Thai)',
        },
        new_companytaxid: {
          required: 'Please enter your Tax ID',
          digits: "Please enter only numbers",
          minlength: "Tax ID must be 13 digits",
          maxlength: "Tax ID must be 13 digits"
        }
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

  // สำหรับ input new_companytaxid ให้ป้อนได้เฉพาะตัวเลข
  $('[name="new_companytaxid"]').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

});