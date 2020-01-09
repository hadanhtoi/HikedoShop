$(document).ready(function () {
  $("select.dropSearchSort").change(() => {
    var selectedText = $(this).children("option:selected").val();
    console.log(selectedText);
  });
});
