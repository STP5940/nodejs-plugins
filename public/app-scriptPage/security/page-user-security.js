// การทำงานงานทั้งหมด
$(document).ready(function () {

  $('#confirm_twofactor').on('input', function () {
    // ถ้าอินพุตยาวเกิน 6 หลัก ให้ตัดส่วนเกินออก
    if (this.value.length > 6) {
      this.value = this.value.slice(0, 6);
    }
  });

  $('#confirm_twofactor').on('keydown', function (event) {
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

  $(document).on('click', '.deleteSessionBtn', function () {

    const rootPath = window.location.origin;

    const sessionOnline = $('[data-sessiononline]').data('sessiononline');
    const deleteSessionValue = $(this).data('value');
    const rowToDelete = $(this).closest('tr');

    const confirmtitleElement = $('#sweetalertText span[data-language="_confirm_title"]').html();
    const deletesessionElement = $('#sweetalertText span[data-language="_delete_session"]').html();

    const discardElement = $('#sweetalertText span[data-language="_discard"]').html();
    const okElement = $('#sweetalertText span[data-language="_confirm_delete_sure"]').html();

    // Display confirmation dialog
    Swal.fire({
      title: confirmtitleElement,
      text: deletesessionElement,
      icon: 'warning',
      confirmButtonText: okElement,
      cancelButtonText: discardElement,
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
          "url": `${rootPath}/user/security/session/delete`,
          "method": "DELETE",
          "headers": {
            "Content-Type": "application/json"
          },
          xhrFields: {
            withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
          },
          "data": JSON.stringify({
            "_sessionid": deleteSessionValue
          }),
        };

        $.ajax(settings).done(async function (response) {
          console.log(response);

          // ลบรายการในตาราง
          userlogsTable.row(rowToDelete).remove().draw(false);

          if (deleteSessionValue == sessionOnline) {
            window.location.href = "/user/security";
          }
        }).fail(async function (xhr, textStatus, errorThrown) {
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

          window.location.href = "/user/security";
        });

      }
    });

  });

  let userlogsTable = $('#userlogsTable').DataTable({
    // dom: 'lBfrtip',
    lengthMenu: [5, 10, 25, 50], // Define the options for rows per page dropdown
    pageLength: 5, // Default to displaying 5 rows per page
    scrollX: true,
    order: [
      [0, 'desc']
    ],

    drawCallback: function () {
      const tableApi = this.api();
      $('.paginate_button:not(.disabled)',
        tableApi.table().container()
      ).on('click', function () {
        // อัปเดทข้อมูลภาษา ที่ไม่ถูกเขียนทับตอนโหลดครั้งแรก
        rewriteTranslations(['_signin_current', '_logout']);
      });
      $('th',
        tableApi.table().header()
      ).on('click', function () {
        // อัปเดทข้อมูลภาษา ที่ไม่ถูกเขียนทับตอนโหลดครั้งแรก
        rewriteTranslations(['_signin_current', '_logout']);
      });
    }
  });

  $('#dataTable').DataTable({
    // dom: 'lBfrtip',
    lengthMenu: [5, 10, 25, 50], // Define the options for rows per page dropdown
    pageLength: 5, // Default to displaying 5 rows per page
    scrollX: true,
  });

});