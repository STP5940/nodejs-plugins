$(function () {
  ('use strict');

  // variables
  let accountUploadImg = $('#account-upload-img'),
    accountUploadBtn = $('#account-upload'),
    accountUserImage = $('.uploadedAvatar'),
    accountResetBtn = $('#account-reset');

  // Update user photo on click of button
  if (accountUserImage) {
    let resetImage = accountUserImage.attr('src');
    accountUploadBtn.on('change', function (e) {
      let reader = new FileReader(),
        files = e.target.files;
      reader.onload = function () {
        if (accountUploadImg) {
          accountUploadImg.attr('src', reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    });

    accountResetBtn.on('click', function () {
      accountUploadBtn.val('');
      accountUserImage.attr('src', resetImage);
    });
  }

  let Form = $('.validate-form');
  let submitButton = $('#btnDisabled');

  Form.on('submit', function (event) {
    event.preventDefault();

    // ตรวจสอบว่ากรอกข้อมูลครบแล้วหรือไม่
    if (Form.valid() == true) {
      submitButton.prop('disabled', true);

      fileUpload().then(function (res) {
        datapageUpload((
          res.status == true ?
            res.path : accountUserImage.attr('src')
        ));
      }).fail(function (error) {
        console.error(error);
        alert("อัปโหลดรูปภาพ ไม่สำเร็จ")
        submitButton.prop('disabled', false);
      });;


    } else {
      submitButton.prop('disabled', false);
    }
  });

  function datapageUpload(_imagePath) {
    let settings = {
      "url": `${window.location.origin}/user/api/manageemployees/update`,
      "method": "PUT",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      xhrFields: {
        withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
      },
      "data": {
        '_csrfToken': Form.find('#_csrfToken').val(),
        '_employeeId': Form.find('#_employeeId').val(),
        '_userId': Form.find('#_userId').val(),

        'new_profile': _imagePath,
        'new_usersroleId': Form.find('#new_usersroleId').val(),
        'new_firstname': Form.find('#new_firstname').val(),
        'new_lastname': Form.find('#new_lastname').val(),
        'new_mail': Form.find('#new_mail').val(),
        'new_phone': Form.find('#new_phone').val(),
        'new_username': Form.find('#new_username').val(),
        'new_active': Form.find('#new_active').val(),
      }
    };

    $.ajax(settings)
      .done(async function (res) {
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

        window.location.href = "/user/manageemployees";

        submitButton.prop('disabled', false);
      })
      .fail(function (xhr, textStatus, errorThrown) {

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
