// ไฟล์นี้มีการแก้ไข
// เอาแค่ส่วยตรวจสอบข้อมูลเปลี่ยนรหัส ที่เหลือเอาออก

$(function () {
  ('use strict');

  // variables
  let pageValidateForm = $('.validate-form');
  let submitButton = $('#btnDisabled');

  // jQuery Validation for all forms
  // --------------------------------------------------------------------
  if (pageValidateForm.length) {
    pageValidateForm.validate({
      rules: {
        password: {
          required: true
        },
        new_password: {
          // required: true,
          minlength: 8
        },
        confirm_new_password: {
          // required: true,
          minlength: 8,
          equalTo: '#new_password'
        },
      },
      messages: {
        password: {
          // required: 'โปรดใส่ข้อมูล รหัสผ่านปัจจุบัน' // Update the message for the current password field
        },
        new_password: {
          // required: 'โปรดใส่ข้อมูล รหัสผ่านใหม่',
          // minlength: 'ความยาวอย่างน้อย 8 ตัวอักษร',
          minlength: 'Enter at least 8 characters',
        },
        confirm_new_password: {
          // required: 'โปรดใส่ข้อมูล ยืนยันรหัสผ่านอีกครั้ง',
          // minlength: 'ความยาวอย่างน้อย 8 ตัวอักษร',
          // equalTo: 'รหัสผ่าน และการยืนยันไม่เหมือนกัน',
          minlength: 'Enter at least 8 characters',
          equalTo: 'The password and its confirm are not the same',
        }
      }
    });

    // Add event listener for form submission
    pageValidateForm.on('submit', function (event) {
      // Check if form is not valid
      if (!pageValidateForm.valid()) {
        // Enable the submit button
        submitButton.prop('disabled', false);
      }
    });

  }

});
