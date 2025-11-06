// Add new role Modal JS
//------------------------------------------------------------------
(function () {
  // let addRoleForm = $('#addRoleForm');

  // add role form validation
  // if (addRoleForm.length) {
  //   addRoleForm.validate({
  //     rules: {
  //       modalRoleName: {
  //         required: true
  //       }
  //     }
  //   });
  // }

  // reset form on modal hidden
  $('.modal').on('hidden.bs.modal', function () {
    $(this).find('form')[0].reset();
  });

  // Handle select all functionality
  $('.selectAll').on('change', function () {
    let group = $(this).data('group');
    $(`[data-bodygroup="${group}"]`).each(function () {
      $(this).find('input[type="checkbox"]').each(function () {
        if (!$(this).prop('disabled')) {
          this.checked = $('.selectAll').is(':checked');
        }
      });
    });
  });

  // Disable checkboxes based on data-disabled attribute
  $('tbody[data-disabled="true"]').each(function () {
    $(this).find('input[type="checkbox"]').prop('disabled', true);
  });


  // // Select All checkbox click
  // const selectAll = document.querySelector('#selectAll'),
  //   checkboxList = document.querySelectorAll('[type="checkbox"]');
  // selectAll.addEventListener('change', t => {
  //   checkboxList.forEach(e => {
  //     e.checked = t.target.checked;
  //   });
  // });
})();
