$(function () {
  ('use strict');

  const rootPath = window.location.origin;

  $('.validate-form').on('submit', function (event) {
    event.preventDefault();

    const formId = $(this).attr('id');
    const Form = $('#' + formId);
    const submitButton = $('#btnDisabled_' + formId);

    const newDescription = Form.find('#new_description_' + formId).val();
    const usersroleId = Form.find('.usersroleId').val();

    if (Form.valid() == true && newDescription) {
      submitButton.prop('disabled', true);
      showLoading(); // Show the loading overlay
      $('#editRoleModal_' + formId).modal('hide');

      let checkboxChecked = {};

      $(`[data-bodygroup=accessroles_${usersroleId}]`).find(`td[id^="crudgroup_"]`).each(function () {
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
        "url": `${rootPath}/user/api/accessroles/update`,
        "method": "PUT",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        xhrFields: {
          withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
        },
        "data": {
          '_usersroleId': usersroleId,
          'new_description': newDescription,
          'new_permissions': JSON.stringify(checkboxChecked),
        }
      };

      $.ajax(settings).done(async function (res) {

        $('#title_' + usersroleId).text(newDescription);
        $('#new_description_' + usersroleId).attr('value', newDescription);

        const reloadTimeout = setTimeout(() => {
          window.location.reload();
        }, MILLISECONDS_TIMEOUT / 2);

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
        }).then(() => {
          // รีโหลดหน้าเว็บเมื่อกดปุ่ม "รับทราบ"
          clearTimeout(reloadTimeout);
          window.location.reload();
        });
      }).fail(async function (xhr, textStatus, errorThrown) {
        const res = xhr?.responseJSON;
        console.log(res); // res.message

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

        submitButton.prop('disabled', false);
        hideLoading(); // Hide the loading overlay
      });

    }
  });

  // ปิดฟอร์ม Modal
  $('.modal').on('hidden.bs.modal', function () {
    const formId = $(this).find('form').attr('id');
    const newDescription = $('#new_description_' + formId);
    const Form = $(`#${formId}`);

    // Reset the form and clear validation errors
    newDescription.val('');
    Form[0].reset();
    Form.validate().resetForm();
    Form.find(`.form-control`).removeClass('error');
    newDescription.closest('.input-group').removeClass('is-invalid');
  });

});
