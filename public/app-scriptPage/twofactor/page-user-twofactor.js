// การทำงานงานทั้งหมด
$(document).ready(function () {

  $('#signinAccount, #changePassword').change(function () {

    const confirmtitletfaElement = $('#sweetalertText span[data-language="_confirm_title_tfa"]').html();
    const twofactorformappElement = $('#sweetalertText span[data-language="_twofactor_form_app"]').html();
    const confirmtwofactorElement = $('#sweetalertText span[data-language="_confirm_twofactor"]').html();
    const twofactorverifyElement = $('#sweetalertText span[data-language="_twofactor_verify"]').html();
    const discardElement = $('#sweetalertText span[data-language="_discard"]').html();
    const okElement = $('#sweetalertText span[data-language="_ok"]').html();

    // ยืนยันไม่สำเร็จ
    const titleElement = $('#sweetalertText span[data-language="_error_title"]').html();
    const confirmElement = $('#sweetalertText span[data-language="_error_confirm_tfa"]').html();

    // Store the current checked state of the checkbox
    let isChecked = $(this).prop('checked');

    // let isDarkMode = JSON.parse(localStorage.getItem("template_dark")) || false;

    Swal.fire({
      iconHtml: '<img style="width: 100%; height: 100%;" src="/app-assets/images/logo/google-authen.svg">',
      title: confirmtitletfaElement,
      input: 'number',
      inputLabel: twofactorformappElement,
      inputPlaceholder: confirmtwofactorElement,

      cancelButtonText: discardElement,
      confirmButtonText: twofactorverifyElement,
      customClass: {
        inputLabel: 'inline-flex',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1',
        icon: 'no-border'
      },
      heightAuto: false,
      buttonsStyling: false,
      showCancelButton: true,
      inputAttributes: {
        autocapitalize: 'off',
      },
      didOpen: () => {
        const inputElement = Swal.getInput();

        $(inputElement).on('input', function () {
          // ถ้าอินพุตยาวเกิน 6 หลัก ให้ตัดส่วนเกินออก
          if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
          }
        });

        $(inputElement).on('keydown', function (event) {
          // อนุญาตให้กด backspace, delete, tab, escape, enter, ctrl/cmd+A, ctrl/cmd+C, ctrl/cmd+V, และลูกศร
          if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) || // ctrl/cmd+A
            (event.keyCode === 67 && (event.ctrlKey === true || event.metaKey === true)) || // ctrl/cmd+C
            (event.keyCode === 86 && (event.ctrlKey === true || event.metaKey === true)) || // ctrl/cmd+V
            (event.keyCode >= 35 && event.keyCode <= 40)) { // ลูกศร
            return;
          }
          // ตรวจสอบให้แน่ใจว่าคีย์ที่กดเป็นตัวเลขเท่านั้น
          if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
            (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
          }
        });

      },
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter your two-factor authentication code.';
        }
        if (value.length < 6) {
          return 'Enter at least 6 digits.';
        }
        if (value.length > 6) {
          return 'Enter at most 6 digits.';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {

        const $this = $(this);
        const sixDigitCode = result.value;
        const rootPath = window.location.origin;

        let settings = {
          "url": `${rootPath}/user/twofactor/updatechecked`,
          "method": "POST",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          xhrFields: {
            withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
          },
          "data": {
            "confirm_twofactor": sixDigitCode,
            "namecolumn": this.id.toLowerCase(),
            "setboolean": isChecked
          }
        };

        $.ajax(settings).done(function (response) {
          $this.prop('checked', response.checked);

          if (response.status === false) {

            Swal.fire({
              icon: 'error',
              title: titleElement,
              text: confirmElement,
              heightAuto: false,
              confirmButtonText: okElement,
              customClass: {
                confirmButton: 'btn btn-success'
              }
            });
          }
        });
      } else {
        $(this).prop('checked', !isChecked);
      }
    });
  });
});