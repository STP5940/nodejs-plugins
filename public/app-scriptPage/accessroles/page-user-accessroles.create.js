$(function () {
  ('use strict');

  const rootPath = window.location.origin;

  let Form = $('.validate-form');

  Form.on('submit', function (event) {
    event.preventDefault();

    const submitButton = $('#btnDisabled');

    if (Form.valid() == true) {
      submitButton.prop('disabled', true);
      
      let checkboxChecked = {};

      $('td[id^="crudgroup_"]').each(function () {
        let checkboxes = $(this).find('input.form-check-input');

        checkboxes.each(function () {
          let Permissions_id = $(this).attr('name');
          let isChecked = $(this).prop('checked');
          let type = $(this).data('type');

          if (!checkboxChecked[Permissions_id]) {
            checkboxChecked[Permissions_id] = {};
          }

          checkboxChecked[Permissions_id][type] = isChecked;
        });
      });

      let settings = {
        "url": `${rootPath}/user/api/accessroles/store`,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        xhrFields: {
          withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
        },
        "data": {
          '_csrfToken': Form.find('#_csrfToken').val(),
          'new_description': Form.find('#new_description').val(),
          'new_permissions': JSON.stringify(checkboxChecked),
        }
      };

      $.ajax(settings).done(async function (res) {
        $('#_csrfToken').val(res?.token);

        await Swal.fire({
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลแล้ว',
          icon: 'success',
          confirmButtonText: 'รับทราบ',
          timerProgressBar: true,
          timer: MILLISECONDS_TIMEOUT,
          customClass: {
            confirmButton: 'btn btn-success'
          },
          heightAuto: false,
        });

        window.location.href = "/user/accessroles";

        submitButton.prop('disabled', false);
      }).fail(async function (xhr, textStatus, errorThrown) {
        const res = xhr?.responseJSON;
        console.log(res); // res.message

        $('#_csrfToken').val(res?.token);

        await Swal.fire({
          // title: 'เกิดข้อผิดพลาด!',
          // text: 'บันทึกข้อมูลไม่สำเร็จ',
          title: 'เกิดข้อผิดพลาด!',
          text: `message: ${res.message}`,
          icon: 'error',
          confirmButtonText: 'รับทราบ',
          timerProgressBar: true,
          customClass: {
            confirmButton: 'btn btn-success'
          },
          heightAuto: false,
        });
      });

    }
  });

});
