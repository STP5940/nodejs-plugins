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

let webhookText = $('#webhook-to-clipboard-input');
let btnWebhook = $('#btn-webhook');
// copy text on click
btnWebhook.on('click', function () {
  webhookText.select();
  document.execCommand('copy');
  toastr['success']('', 'Copied to clipboard', {
    rtl: isRtl,
    progressBar: true,
    timeOut: 1500 // กำหนดให้ Toastr หายไปภายใน 2 วินาที (2000 มิลลิวินาที)
  });
});