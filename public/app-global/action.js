$(function () {
    'use strict';

    $('input[type="checkbox"]').on('click', function () {
        if ($(this).is(':checked')) {
            $(this).val(true);
        } else {
            $(this).val(false);
        }
    });
});