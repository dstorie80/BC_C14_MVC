window.onload = function () {
  const newPostButton = document.getElementById("newPostButton");
  const newPostForm = document.getElementById("newPostContainer");

  newPostButton.addEventListener("click", () => {
    if (newPostForm.style.display === "none") {
      newPostForm.style.display = "block";
    } else {
      newPostForm.style.display = "none";
    }
  });
};
