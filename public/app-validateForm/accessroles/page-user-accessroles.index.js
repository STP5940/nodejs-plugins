// สร้างไฟล์ในการ validate-form ด้วย

$(function () {
  ('use strict');

  function validateForm(formId) {
    let newDescriptionId = `new_description_${formId}`;
    let pageValidateForm = $(`#${formId}`);

    // Initialize validation for the current form
    pageValidateForm.validate({
      rules: {
        [newDescriptionId]: {
          required: true,
        }
      },
      messages: {
        [newDescriptionId]: {
          required: 'Please enter your Description',
        }
      },
    });
  }

  $('.validate-form').each(function (index) {
    const formId = $(this).attr('id');
    validateForm(formId);
  });

});