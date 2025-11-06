/*=========================================================================================
    File Name: ext-component-clipboard.js
    Description: Copy to clipboard
    --------------------------------------------------------------------------------------
    Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

'use strict';

let isRtl = $('html').attr('data-textdirection') === 'rtl';


let userTextname = $('#copyname-to-clipboard-input');
let btnCopyname = $('#btn-copyname');
// copy text on click
btnCopyname.on('click', function () {
  userTextname.select();
  document.execCommand('copy');
  toastr['success']('', 'Copied to clipboard', {
    rtl: isRtl,
    progressBar: true,
    timeOut: 1500 // กำหนดให้ Toastr หายไปภายใน 2 วินาที (2000 มิลลิวินาที)
  });
});

let userTextkey = $('#copykey-to-clipboard-input');
let btnCopykey = $('#btn-copykey');
// copy text on click
btnCopykey.on('click', function () {
  userTextkey.select();
  document.execCommand('copy');
  toastr['success']('', 'Copied to clipboard', {
    rtl: isRtl,
    progressBar: true,
    timeOut: 1500 // กำหนดให้ Toastr หายไปภายใน 2 วินาที (2000 มิลลิวินาที)
  });
});