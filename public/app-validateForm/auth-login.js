// ไฟล์นี้มีการแก้ไข
// เปลี่ยนเงื่อนไขการเช็ค และชื่อตัวแปล

/*=========================================================================================
  File Name: auth-login.js
  Description: Auth login js file.
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: PIXINVENT
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(function () {
  'use strict';

  let pageLoginForm = $('.auth-login-form');

  // jQuery Validation
  // --------------------------------------------------------------------
  if (pageLoginForm.length) {
    pageLoginForm.validate({
      /*
      * ? To enable validation onkeyup
      onkeyup: function (element) {
        $(element).valid();
      },*/
      /*
      * ? To enable validation on focusout
      onfocusout: function (element) {
        $(element).valid();
      }, */
      rules: {
        'username': {
          required: true,
        },
        'password': {
          required: true
        }
      },
      messages: {
        username: {
          // required: 'โปรดใส่ข้อมูล ชื่อผู้ใช้งาน' // Update the message for the current password field
        },
        password: {
          // required: 'โปรดใส่ข้อมูล รหัสผ่าน' // Update the message for the current password field
        },
      }
    });
  }
});
