$(function () {
  ('use strict');

  const rootPath = window.location.origin;

  $('.validate-form').on('submit', function (event) {
    event.preventDefault();

    const formId = $(this).attr('id');
    const Form = $(`#${formId}`);

    const rowToDelete = $(this).closest('tr');
    const submitButton = $('#btnDisabled_' + formId);

    const permissionsId = Form.find('.permissionsId').val();
    const newController = Form.find('#new_controller_' + formId).val();
    const newName = Form.find('#new_name_' + formId).val();

    const newCompanyonly = Form.find('#new_companyonly_' + formId).val();
    const newRead = Form.find('#new_read_' + formId).val();
    const newUpdate = Form.find('#new_update_' + formId).val();
    const newCreate = Form.find('#new_create_' + formId).val();
    const newDelete = Form.find('#new_delete_' + formId).val();

    if (Form.valid() == true) {
      submitButton.prop('disabled', true);
      // $('#large_' + formId).modal('hide');

      let settings = {
        "url": `${rootPath}/user/api/accesspermissions/update`,
        "method": "PUT",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        xhrFields: {
          withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
        },
        "data": {
          '_permissionsId': permissionsId,
          'new_Controller': newController,
          'new_Companyonly': newCompanyonly,
          'new_Name': newName,

          /* Permission: CRUD */
          'new_Read': newRead,
          'new_Update': newUpdate,
          'new_Create': newCreate,
          'new_Delete': newDelete,
        }
      };

      $.ajax(settings).done(async function (res) {
        // $('#_csrfToken').val(res?.token);

        $('#editAccesspermissionModal_' + formId).modal('hide');



        // Datatables
        $('#table_name_' + permissionsId).text(newName);
        $('#table_controller_' + permissionsId).text(newController);

        setCheckboxStateAndDisable('#table_companyonly_' + permissionsId, newCompanyonly);
        setCheckboxStateAndDisable('#table_read_' + permissionsId, newRead);
        setCheckboxStateAndDisable('#table_update_' + permissionsId, newUpdate);
        setCheckboxStateAndDisable('#table_create_' + permissionsId, newCreate);
        setCheckboxStateAndDisable('#table_delete_' + permissionsId, newDelete);

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

        // Modal เอาไว้ล่าง Swal เพราะให้ฟร์อม reset ค่าให้เสร็จก่อน
        $('#new_name_' + permissionsId).attr('value', newName);
        $('#new_controller_' + permissionsId).attr('value', newController);

        setCheckboxState('#new_companyonly_' + permissionsId, newCompanyonly);
        setCheckboxState('#new_read_' + permissionsId, newRead);
        setCheckboxState('#new_update_' + permissionsId, newUpdate);
        setCheckboxState('#new_create_' + permissionsId, newCreate);
        setCheckboxState('#new_delete_' + permissionsId, newDelete);

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

  function setCheckboxState(elementId, value) {
    if (value === 'true' || value === true) {
      $(elementId).attr('checked', true);
    } else {
      $(elementId).removeAttr('checked');
    }
  }

  // ฟังก์ชันอัปเดท Checkbox in Datatables
  function setCheckboxStateAndDisable(elementId, value) {
    if (value === 'true' || value === true) {
      $(elementId).attr('checked', true).removeAttr('disabled');
    } else {
      $(elementId).removeAttr('checked').attr('disabled', true);
    }
  }


  // ปิดฟอร์ม Modal
  $('.modal').on('hidden.bs.modal', function () {
    const formId = $(this).find('form').attr('id');
    const Form = $(`#${formId}`);
    Form[0].reset();
    Form.validate().resetForm();
  });

  let accesspermissionsTable = $('#accesspermissionsTable').DataTable({
    // dom: 'lBfrtip',
    lengthMenu: [5, 10, 25, 50], // Define the options for rows per page dropdown
    pageLength: 10, // Default to displaying 5 rows per page
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
        rewriteTranslations(['_operations', '_edit_information', '_change_password', '_delete_information']);
      });
      $('th',
        tableApi.table().header()
      ).on('click', function () {
        // อัปเดทข้อมูลภาษา ที่ไม่ถูกเขียนทับตอนโหลดครั้งแรก
        rewriteTranslations(['_operations', '_edit_information', '_change_password', '_delete_information']);
      });
    }
  });

});
