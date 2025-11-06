$(function () {
  ('use strict');

  const rootPath = window.location.origin;

  $(document).on('click', '.deleteEmployeeBtn', function () {

    const employeeId = $(this).attr('employeeId');
    const employeeUsername = $(this).attr('employeeUsername');
    const rowToDelete = $(this).closest('tr');

    // Display confirmation dialog
    // Enter the following to confirm
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      icon: 'warning',
      input: 'text',
      html: `
      <p style="font-size: 15px; text-align: left;" class="mb-0">
        <label>ป้อนข้อมูลต่อไปนี้เพื่อยืนยัน:</label>
        <code style="font-size: 15px;">${employeeUsername}</code>
      </p>`,
      inputPlaceholder: "ยืนยันการลบข้อมูล",
      confirmButtonText: 'ใช่, ฉันต้องการลบ',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1',
      },
      showCancelButton: true,
      buttonsStyling: false,
      heightAuto: false,
      didOpen: () => {
        const input = Swal.getInput();
        const confirmButton = Swal.getConfirmButton();

        input.addEventListener('input', () => {
          confirmButton.disabled = input.value?.trim() !== employeeUsername?.trim();
        });

        // Initially disable the confirm button
        confirmButton.disabled = input.value?.trim() !== employeeUsername?.trim();
      }
    }).then((result) => {
      if (result.isConfirmed) {

        let settings = {
          "url": `${rootPath}/user/api/manageemployees/delete/${employeeId}`,
          "method": "DELETE",
          "headers": {
            "Content-Type": "application/json"
          },
          xhrFields: {
            withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
          },
        };

        $.ajax(settings)
          .done(async function (response) {
            console.log(response);

            // ลบรายการในตาราง
            employeesTable.row(rowToDelete).remove().draw(false);

            // Display success message
            await Swal.fire({
              title: 'สำเร็จ!',
              text: 'ลบรายการสำเร็จ',
              icon: 'success',
              confirmButtonText: 'รับทราบ',
              timerProgressBar: true,
              timer: MILLISECONDS_TIMEOUT,
              customClass: {
                confirmButton: 'btn btn-success'
              },
              heightAuto: false,
            });
          })
          .fail(async function (xhr, textStatus, errorThrown) {

            await Swal.fire({
              title: 'ไม่สำเร็จ!',
              text: `message: ${xhr?.responseJSON?.message}`,
              icon: 'error',
              confirmButtonText: 'รับทราบ',
              customClass: {
                confirmButton: 'btn btn-success'
              },
              heightAuto: false,
            });

          });

      }
    });

  });

  $(document).on('click', '.twofactorOffEmployeeBtn', function () {

    const employeeId = $(this).attr('employeeId');
    const employeeUsername = $(this).attr('employeeUsername');
    // const rowToDelete = $(this).closest('tr');

    // Display confirmation dialog
    Swal.fire({
      title: 'ยืนยันข้อมูล',
      icon: 'warning',
      html: `
      <p style="font-size: 15px;" class="mb-0">
        <label>คุณต้องการปิด 2FA ผู้ใช้ชื่อ: </label>
        <code style="font-size: 15px;">${employeeUsername}</code>
        <label> ใช้หรือไม่</label>
      </p>`,
      confirmButtonText: 'ใช่, ฉันต้องการ',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1',
      },
      showCancelButton: true,
      buttonsStyling: false,
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {

        let settings = {
          "url": `${rootPath}/user/api/manageemployees/twofactorclose/${employeeId}`,
          "method": "DELETE",
          "headers": {
            "Content-Type": "application/json"
          },
          xhrFields: {
            withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
          },
        };

        $.ajax(settings)
          .done(async function (response) {
            // console.log(response);
            // alert(response.message);

            // Display success message
            await Swal.fire({
              title: 'สำเร็จ!',
              text: 'ปิดใช้งาน 2FA เรียบร้อยแล้ว',
              icon: 'success',
              confirmButtonText: 'รับทราบ',
              timerProgressBar: true,
              timer: MILLISECONDS_TIMEOUT,
              customClass: {
                confirmButton: 'btn btn-success'
              },
              heightAuto: false,
            });
          })
          .fail(async function (xhr, textStatus, errorThrown) {
            const res = xhr?.responseJSON;
            console.log(res); // res.message

            await Swal.fire({
              title: 'ไม่สำเร็จ!',
              text: `message: ${xhr?.responseJSON?.message}`,
              icon: 'error',
              confirmButtonText: 'รับทราบ',
              customClass: {
                confirmButton: 'btn btn-success'
              },
              heightAuto: false,
            });

          });

      }
    });

  });

  $('.validate-form').on('submit', function (event) {
    event.preventDefault();

    const formId = $(this).attr('id');
    const Form = $('#' + formId);
    const submitButton = $('#btnDisabled_' + formId);

    const newPassword = Form.find('#new_password_' + formId).val();
    const userId = Form.find('.userId').val();

    if (Form.valid() == true && newPassword) {
      submitButton.prop('disabled', true);

      $('#large_' + formId).modal('hide');
      $('#new_password_' + formId).val('');

      let settings = {
        "url": `${rootPath}/user/api/manageemployees/password/update`,
        "method": "PUT",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        xhrFields: {
          withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
        },
        "data": {
          '_userId': userId,
          'new_password': newPassword,
        }
      };

      $.ajax(settings).done(async function (res) {
        // $('#_csrfToken').val(res?.token);

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

        submitButton.prop('disabled', false);
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
      });

    }
  });

  // เปิดฟอร์ม Modal
  $('.modal').on('shown.bs.modal', function () {
    const formId = $(this).find('form').attr('id');
    $('#new_password_' + formId).focus();
  });

  // ปิดฟอร์ม Modal
  $('.modal').on('hidden.bs.modal', function () {
    const formId = $(this).find('form').attr('id');
    const newPassword = $('#new_password_' + formId);
    const Form = $(`#${formId}`);

    // Reset the form and clear validation errors
    newPassword.val('');
    Form[0].reset();
    Form.validate().resetForm();
    Form.find(`.form-control`).removeClass('error');
    newPassword.closest('.input-group').removeClass('is-invalid');
  });

  let employeesTable = $('#employeesTable').DataTable({
    // dom: 'lBfrtip',
    lengthMenu: [5, 10, 25, 50], // Define the options for rows per page dropdown
    pageLength: 5, // Default to displaying 5 rows per page
    // scrollX: true,
    order: [
      [0, 'asc'] // desc or asc
    ],


    initComplete: function () {
      // Add individual column search inputs
      this.api()
        .columns()
        .every(function () {
          let column = this;
          let header = $(column.header());

          // Check if the column has a specific class to exclude from search
          // ช่องค้นหาเล็กลง form-control-sm
          if (!$(header).hasClass('no-search')) {
            $('<input type="text" placeholder="Search ' + $(header).text().trim() + '" class="form-control form-control-sm my-50" style="width: 100%;"/>')
              .appendTo($(column.footer()).empty())
              .on('keyup change', function () {
                if (column.search() !== this.value) {
                  column.search(this.value).draw();
                }
              });
          }
        });
    },

    drawCallback: function () {
      const tableApi = this.api();
      $('.paginate_button:not(.disabled)',
        tableApi.table().container()
      ).on('click', function () {
        // อัปเดทข้อมูลภาษา ที่ไม่ถูกเขียนทับตอนโหลดครั้งแรก
        rewriteTranslations(['_operations', '_edit_information', '_change_password', '_twofactor_off', '_delete_information']);
      });
      $('th',
        tableApi.table().header()
      ).on('click', function () {
        // อัปเดทข้อมูลภาษา ที่ไม่ถูกเขียนทับตอนโหลดครั้งแรก
        rewriteTranslations(['_operations', '_edit_information', '_change_password', '_twofactor_off', '_delete_information']);
      });
    }
  });

});
