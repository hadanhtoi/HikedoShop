var edit_top_form = document.getElementById("edit-top-form");
var confirmPassword = document.querySelector("#confirmPasswordFormId");
var edit_top_inputs = [];
let compStyles = window.getComputedStyle(confirmPassword);
if (compStyles.getPropertyValue('display') == "block") {
  confirmPassword.style.display = "none";
}
edit_top_inputs = edit_top_form.getElementsByClassName('form-control');
document.getElementById("edit-profile-btn").onclick = () => {
  Array.from(edit_top_inputs).forEach(element => {
    element.removeAttribute('readonly');
  });
  if (compStyles.getPropertyValue('display') == "none") {
    confirmPassword.style.display = "block";
  }
};

// document.getElementById("save-profile-submit-btn").onclick = ()=>{
//   // document.getElementById("edit-top-form").submit();
// }
