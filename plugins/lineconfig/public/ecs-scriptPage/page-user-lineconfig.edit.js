$(function () {
  ('use strict');

  // variables
  let Form = $('.validate-form');
  let submitButton = $('#btnDisabled');

  Form.on('submit', async function (event) {
    event.preventDefault();

    // ตรวจสอบว่ากรอกข้อมูลครบแล้วหรือไม่
    if (Form.valid() == true) {
      // alert("กำลังบันทึกข้อมูล...");
      // return false;

      submitButton.prop('disabled', true);

      let settings = {
        "url": `${window.location.origin}/user/plugins/lineconfig/api/update`,
        "method": "PUT",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        xhrFields: {
          withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
        },
        "data": {
          '_csrfToken': Form.find('#_csrfToken').val(),
          '_companyId': Form.find('#_companyId').val(),

          'new_groupId': Form.find('#new_groupId').val()?.trim(),
          'new_secret': Form.find('#new_secret').val(),
          'new_accessToken': Form.find('#new_accessToken').val(),
          'new_cmnew': Form.find('#new_cmnew').val(),
          'new_pmnew': Form.find('#new_pmnew').val(),
          'new_cmcomplete': Form.find('#new_cmcomplete').val(),
          'new_pmcomplete': Form.find('#new_pmcomplete').val(),
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

        // ปิดไว้ก่อน
        // window.location.href = "/user/plugins/lineconfig";

        submitButton.prop('disabled', false);
      }).fail(function (xhr, textStatus, errorThrown) {

        const res = xhr?.responseJSON;
        // console.log(textStatus, errorThrown, xhr);

        $('#_csrfToken').val(res?.token);
        submitButton.prop('disabled', false);

        if (xhr.status === 500) {
          console.log(res.message);
          alert(res.message);
          return false;
        }

        if (xhr.status === 401) {
          console.log(res.error);
          alert(res.error);
          return false;
        }

        const msgerrors = res.error;
        // alert(msgerrors);
        // console.log(msgerrors);

        $('#errorMessageContainer').empty();
        $("#errorTitle").css("display", "none");

        let errorMessage = `<ul class="ps-1 ms-25">`;
        Object.keys(msgerrors).forEach(key => {
          const error = msgerrors[key];
          errorMessage += `
            <li data-language="${key}">${error}</li>
          `;
        });
        errorMessage += `</ul>`;

        $('#errorMessageContainer').append(errorMessage);
        $("#errorTitle").css("display", "block");
      });

    } else {
      submitButton.prop('disabled', false);
    }
  });

  // เริ่มต้นปุ่มทดสอบการเชื่อมต่อ
  testConnectionButton();

  // ผูกฟังก์ชันกับปุ่มทดสอบ
  $('#btnTestConnection').on('click', function (e) {
    e.preventDefault();
    testLineConnection();
  });

  // ตรวจสอบการเปลี่ยนแปลงของ input เพื่อเปิด/ปิดปุ่มทดสอบ
  $('#new_groupId, #new_secret, #new_accessToken').on('input', function () {
    testConnectionButton();
  });

  function testConnectionButton() {
    const groupId = $('#new_groupId').val().trim();
    const secret = $('#new_secret').val().trim();
    const accessToken = $('#new_accessToken').val().trim();

    if (groupId && secret && accessToken) {
      $('#btnTestConnection').prop('disabled', false);
    } else {
      $('#btnTestConnection').prop('disabled', true);
    }
  }

  // ฟังก์ชันทดสอบการเชื่อมต่อ LINE OA
  function testLineConnection() {
    // ตรวจสอบว่ากรอกข้อมูลครบถ้วน
    const groupId = $('#new_groupId').val().trim();
    const secret = $('#new_secret').val().trim();
    const accessToken = $('#new_accessToken').val().trim();

    if (!groupId || !secret || !accessToken) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        confirmButtonText: 'รับทราบ'
      });
      return;
    }

    // แสดง loading
    showLoading(); // Show the loading overlay
    // Swal.fire({
    //   title: 'กำลังทดสอบการเชื่อมต่อ...',
    //   text: 'กรุณารอสักครู่',
    //   allowOutsideClick: false,
    //   didOpen: () => {
    //     Swal.showLoading();
    //   }
    // });

    // เตรียมข้อมูลส่ง
    const testConnectionData = {
      groupId: groupId,
      secret: secret,
      accessToken: accessToken,
      _csrfToken: $('#_csrfToken').val(),
    };

    // ส่งข้อมูลไปทดสอบ
    $.ajax({
      url: '/user/plugins/lineconfig/api/testconnection', // ปรับ URL ตามระบบของคุณ
      type: 'POST',
      data: testConnectionData,
      dataType: 'json',
      timeout: 30000, // 30 วินาที
      success: function (res) {
        // Swal.close();
        hideLoading(); // Hide the loading overlay

        if (res.status) {
          Swal.fire({
            title: 'สำเร็จ!',
            text: 'ระบบสามารถส่งข้อความแจ้งเตือนไปยัง LINE ได้',
            icon: 'success',
            confirmButtonText: 'รับทราบ',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เชื่อมต่อไม่สำเร็จ',
            text: res.message || 'ไม่สามารถส่งข้อความไปยัง LINE ได้',
            confirmButtonText: 'รับทราบ'
          });
        }

        Form.find('#_csrfToken').val(res?.token);
      },

      error: async function (xhr, status, error) {
        Swal.close();
        const res = xhr?.responseJSON;

        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: res.message,
          confirmButtonText: 'รับทราบ'
        });

        hideLoading(); // Hide the loading overlay
        Form.find('#_csrfToken').val(xhr?.responseJSON?.token);
      }
    });
  }

  // ฟังก์ชันสำหรับส่งข้อความทดสอบ (ใช้เมื่อมี API endpoint เฉพาะ)
  // function sendTestMessage() {
  //   const testMessage = {
  //     type: 'text',
  //     text: `🔔 ทดสอบการแจ้งเตือน LINE OA\n\n` +
  //       `⏰ เวลา: ${new Date().toLocaleString('th-TH')}\n` +
  //       `✅ ระบบแจ้งเตือนทำงานปกติ\n` +
  //       `🏢 บริษัท: ${$('#_companyId').val()}`
  //   };

  //   const lineData = {
  //     to: $('#new_groupId').val().trim(),
  //     messages: [testMessage],
  //     _token: $('#_csrfToken').val(),
  //     companyId: $('#_companyId').val()
  //   };

  //   return $.ajax({
  //     url: '/api/line/send-message',
  //     type: 'POST',
  //     data: lineData,
  //     dataType: 'json',
  //     headers: {
  //       'Authorization': `Bearer ${$('#new_accessToken').val().trim()}`
  //     }
  //   });
  // }

});
