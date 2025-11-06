// การทำงานงานทั้งหมด
let submitButton = $('#btnDisabled');
let pageLoginForm = $('.auth-login-form');

let getOS = function () {
    let userAgent = window.navigator.userAgent;
    let platform = window.navigator.platform;
    let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    // this.myos = os;
    return os;
};

let browser = function () {
    let userAgent = navigator.userAgent;
    let mybrowser = undefined;

    if ((userAgent.indexOf("Opera") || userAgent.indexOf('OPR')) != -1) {
        mybrowser = 'Opera';
    } else if (userAgent.indexOf("Edg") != -1) {
        mybrowser = 'Edge';
    } else if (userAgent.indexOf("Chrome") != -1) {
        mybrowser = 'Chrome';
    } else if (userAgent.indexOf("Safari") != -1) {
        mybrowser = 'Safari';
    } else if (userAgent.indexOf("Firefox") != -1) {
        mybrowser = 'Firefox';
    } else if ((userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
    {
        mybrowser = 'IE';
    } else {
        mybrowser = 'unknown';
    }

    return mybrowser;
};

$(window).on('load', function () {

    // Get Device
    let device = navigator.userAgent;
    console.log("Device: " + device);

    // Get Browser
    // let browser = navigator.userAgent;
    console.log("Browser: " + browser());

    // Get Platform
    // let platform = navigator.platform;
    console.log("Platform: " + getOS());

    submitButton.prop('disabled', false); // เปิดให้กดส่งข้อมูลได้

    $('#loginForm').submit(function (event) {
        $("#errorTitle").css("display", "none");

        submitButton.prop('disabled', true);
        event.preventDefault(); // Prevent default form submission

        if (!pageLoginForm.valid()) {
            console.log("Form is not valid. Please fill in all required fields.");
            submitButton.prop('disabled', false);
            return false;
        }

        const rootPath = window.location.origin;
        const username = $('#username').val(); // Get the value of the username field
        const password = $('#password').val();
        let csrfToken = $('#csrfToken').val();

        let settings = {
            "url": `${rootPath}/login`,
            "method": "POST",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            xhrFields: {
                withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
            },
            "data": {
                "username": username,
                "password": password,
                "_csrfToken": csrfToken
            }
        };


        $.ajax(settings)
            .done(async function (response) {

                let status = response?.status;
                let token = response?.token;
                let error = response?.error;
                let tfarequired = response?.tfarequired;

                $('#csrfToken').val(token);

                // เข้าสู่ระบบสำเร็จ
                if (status == true && tfarequired == false) {
                    window.location.href = "/menu";
                }

                if (status == true && tfarequired == true) {
                    $('#errorMessageContainer').empty();
                    $("#errorTitle").css("display", "none");

                    console.log("2FA Required");

                    const confirmtitletfaElement = $('#sweetalertText span[data-language="_confirm_title_tfa"]').html();
                    const twofactorformappElement = $('#sweetalertText span[data-language="_twofactor_form_app"]').html();
                    const confirmtwofactorElement = $('#sweetalertText span[data-language="_confirm_twofactor"]').html();
                    const twofactorverifyElement = $('#sweetalertText span[data-language="_twofactor_verify"]').html();
                    const discardElement = $('#sweetalertText span[data-language="_discard"]').html();
                    const okElement = $('#sweetalertText span[data-language="_ok"]').html();

                    // ยืนยันไม่สำเร็จ
                    const titleElement = $('#sweetalertText span[data-language="_error_title"]').html();
                    const confirmElement = $('#sweetalertText span[data-language="_error_confirm_tfa"]').html();

                    await Swal.fire({
                        iconHtml: '<img style="width: 100%; height: 100%;" src="/app-assets/images/logo/google-authen.svg">',
                        title: confirmtitletfaElement,
                        input: 'number',
                        inputLabel: twofactorformappElement,
                        inputPlaceholder: confirmtwofactorElement,
                        heightAuto: false,
                        showCancelButton: true,
                        cancelButtonText: discardElement,
                        confirmButtonText: twofactorverifyElement,
                        customClass: {
                            inputLabel: 'inline-flex',
                            confirmButton: 'btn btn-primary',
                            cancelButton: 'btn btn-outline-danger ms-1',
                            icon: 'no-border'
                        },
                        buttonsStyling: false,
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
                            submitButton.prop('disabled', false);

                            const sixDigitCode = result.value;
                            csrfToken = $('#csrfToken').val();

                            let settings = {
                                "url": `${rootPath}/login/checktfa`,
                                "method": "POST",
                                "headers": {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                xhrFields: {
                                    withCredentials: true // ส่งค่า Cookie ไปกับคำขอ
                                },
                                "data": {
                                    "confirm_twofactor": sixDigitCode,
                                    "_csrfToken": csrfToken
                                }
                            };

                            $.ajax(settings)
                                .done(async function (tfaresponse) {

                                    let tfatoken = tfaresponse?.token;

                                    $('#csrfToken').val(tfatoken);

                                    if (tfaresponse.status === false) {
                                        await Swal.fire({
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

                                    // เข้าสู่ระบบสำเร็จ
                                    if (tfaresponse.status === true) {
                                        window.location.href = "/menu";
                                    }
                                })
                                // เช็ค 2FA ไม่ผ่าน
                                .fail(async function (xhr, textStatus, errorThrown) {
                                    let token = xhr?.responseJSON?.token;
                                    let errorMessage = '';

                                    // เช็ค status code ต่าง ๆ
                                    switch (xhr.status) {
                                        case 403:
                                            $('#csrfToken').val(token);
                                            errorMessage = xhr?.responseJSON?.error?.[0];
                                            break;

                                        default:
                                            errorMessage = 'เซิร์ฟเวอร์ไม่ตอบสนอง โปรดลองอีกครั้งในภายหลัง';
                                            break;
                                    }

                                    await Swal.fire({
                                        icon: 'error',
                                        title: titleElement,
                                        text: errorMessage,
                                        heightAuto: false,
                                        confirmButtonText: okElement,
                                        customClass: {
                                            confirmButton: 'btn btn-success'
                                        }
                                    });

                                    submitButton.prop('disabled', false);
                                });
                        } else {
                            submitButton.prop('disabled', false);
                        }
                    });

                    // end fire
                }

                if (status == false && tfarequired == false) {
                    $('#errorMessageContainer').empty();
                    $("#errorTitle").css("display", "none");

                    submitButton.prop('disabled', false);

                    console.log("Other Error");

                    // Create and append the error message
                    let errorMessage = `<ul class="ps-1 ms-25">`;
                    error.forEach(function (error) {
                        errorMessage += `<li>${error}</li>`;
                    });
                    errorMessage += `</ul>`;

                    $('#errorMessageContainer').append(errorMessage);
                    $("#errorTitle").css("display", "block");
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                $('#errorMessageContainer').empty();
                $("#errorTitle").css("display", "none");

                submitButton.prop('disabled', false);

                let error = xhr?.responseJSON?.error;
                let token = xhr?.responseJSON?.token;
                let errorMessage = '';

                // เช็ค status code ต่าง ๆ
                switch (xhr.status) {
                    case 403:
                        $('#csrfToken').val(token);

                        // Create and append the error message
                        errorMessage = `<ul class="ps-1 ms-25">`;
                        error.forEach(function (error) {
                            errorMessage += `<li>${error}</li>`;
                        });
                        errorMessage += `</ul>`;
                        break;

                    default:
                        errorMessage = `
                            <ul class="ps-1 ms-25">
                                <li>เซิร์ฟเวอร์ไม่ตอบสนอง โปรดลองอีกครั้งในภายหลัง</li>
                            </ul>`;
                        break;
                }

                $('#errorMessageContainer').append(errorMessage);
                $("#errorTitle").css("display", "block");

                // console.log(textStatus, errorThrown, xhr);
            });

    });

    // localStorage.setItem("template_dark", true); // 'sun'

    if (feather) {
        feather.replace({
            width: 14,
            height: 14
        });
    }
})