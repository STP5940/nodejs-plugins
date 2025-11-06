$(function () {
  ('use strict');

  // Logo Company in Website
  let accountUploadImg = $('#account-upload-img'),
    accountUploadBtn = $('#account-upload'),
    accountImage = $('.uploadedAvatar'),
    accountResetBtn = $('#account-reset');

  // Logo Company in Report
  let reportUploadImg = $('#report-upload-img'),
    reportUploadBtn = $('#report-upload'),
    reportImage = $('.uploadedReport'),
    reportResetBtn = $('#report-reset');

  // Update user photo on click of button
  if (accountImage) {
    let resetImageAccount = accountImage.attr('src');
    accountUploadBtn.on('change', function (e) {
      let files = e.target.files;

      // ตรวจสอบว่ามีไฟล์ถูกเลือกหรือไม่
      if (files.length === 0) {
        accountUploadBtn.val('');
        accountImage.attr('src', resetImageAccount);
        return; // หยุดการทำงานถ้าไม่มีไฟล์
      }

      let reader = new FileReader();
      reader.onload = function () {
        if (accountUploadImg) {
          accountUploadImg.attr('src', reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    });

    accountResetBtn.on('click', function () {
      accountUploadBtn.val('');
      accountImage.attr('src', resetImageAccount);
    });
  }

  // Logo Company in Report
  if (reportImage) {
    let resetImageReport = reportImage.attr('src');
    reportUploadBtn.on('change', function (e) {
      let files = e.target.files;

      // ตรวจสอบว่ามีไฟล์ถูกเลือกหรือไม่
      if (files.length === 0) {
        reportUploadBtn.val('');
        reportImage.attr('src', resetImageReport);
        return; // หยุดการทำงานถ้าไม่มีไฟล์
      }

      let reader = new FileReader();
      reader.onload = function () {
        if (reportUploadImg) {
          reportUploadImg.attr('src', reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    });

    reportResetBtn.on('click', function () {
      reportUploadBtn.val('');
      reportImage.attr('src', resetImageReport);
    });
  }

  let Form = $('.validate-form');
  let submitButton = $('#btnDisabled');

  Form.on('submit', async function (event) {
    event.preventDefault();

    // ตรวจสอบว่ากรอกข้อมูลครบแล้วหรือไม่
    if (Form.valid() == true) {
      submitButton.prop('disabled', true);

      try {
        const accountUpload = await fileUpload('#account-upload', 'app-assets/images/profile/user-uploads/');
        const reportUpload = await fileUpload('#report-upload', 'app-assets/images/profile/user-uploads/');

        const profileSrc = (accountUpload.status == true ? accountUpload.path : accountImage.attr('src'))
        const reportSrc = (reportUpload.status == true ? reportUpload.path : reportImage.attr('src'))

        datapageUpload(profileSrc, reportSrc);
      } catch (error) {
        console.error(error);
        alert("อัปโหลดรูปภาพ ไม่สำเร็จ");
        submitButton.prop('disabled', false);
        return false; // อัปโหลดไม่สำเร็จ
      }
    } else {
      submitButton.prop('disabled', false);
    }
  });

  function datapageUpload(_imagePathProfile, _imagePathReport) {
    console.log(_imagePathProfile);
    console.log(_imagePathReport);

    // return false; // ปิดการทำงานของฟังก์ชันนี้

    let settings = {
      "url": `${window.location.origin}/user/api/profilecompany/update`,
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
        '_userId': Form.find('#_userId').val(),

        'new_profile': _imagePathProfile,
        'new_companyname': Form.find('#new_companyname').val(),
        'new_mail': Form.find('#new_mail').val(),
        'new_phone': Form.find('#new_phone').val(),

        'new_logoreport': _imagePathReport,
        'new_companynamethai': Form.find('#new_companynamethai').val(),
        'new_companyaddressthai': Form.find('#new_companyaddressthai').val(),
        'new_companynameenglish': Form.find('#new_companynameenglish').val(),
        'new_companyaddressenglish': Form.find('#new_companyaddressenglish').val(),
        'new_companytaxid': Form.find('#new_companytaxid').val(),
        'new_companynamesite': Form.find('#new_companynamesite').val(),
        'new_companyphone': Form.find('#new_companyphone').val(),
        'new_companyfax': Form.find('#new_companyfax').val(),
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

      window.location.href = "/user/profilecompany";

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
  }

});
