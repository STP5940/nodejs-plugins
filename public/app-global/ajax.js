
$(function () {
    'use strict';

    function fileUpload(inputFileID = '#account-upload', filePath = 'app-assets/images/profile/user-uploads/') {

        let formData = new FormData();
        formData.append("file", $(inputFileID)[0].files[0]);
        formData.append("filePath", filePath); // ส่ง filePath ไปที่ API ด้วย

        let ajaxPromise = $.Deferred();

        let settings = {
            url: `${window.location.origin}/user/api/image/upload`,
            method: "POST",
            xhrFields: {
                withCredentials: true // Send Cookies with the request
            },
            processData: false,
            contentType: false,
            data: formData
        };

        $.ajax(settings)
            .done(async function (res) {
                ajaxPromise.resolve(res);
            })
            .fail(function (xhr, status, error) {
                ajaxPromise.reject(xhr.responseText);
            });

        return ajaxPromise.promise();
    }

    window.fileUpload = fileUpload;

});