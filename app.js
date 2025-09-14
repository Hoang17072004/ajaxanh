function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  fetch("api.php?action=login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  })
  .then(r => r.json())
  .then(res => {
    console.log(res);
    if (res.status === "success") {
      if (res.role === "teacher") window.location = "teacher.html";
      else window.location = "student.html";
    } else {
      alert("Sai thông tin đăng nhập");
    }
  });
}
function loadClasses() {
  fetch("api.php?action=get_classes")
    .then(r => r.json())
    .then(classes => {
      console.log(classes);
      let select = document.getElementById("classSelect");
      select.innerHTML = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      
    });
}
function loadSubjects() {
  fetch("api.php?action=get_subjects")
    .then(r => r.json())
    .then(subjects => {
      let select = document.getElementById("subjectSelect");
      select.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
      if (subjects.length > 0) loadStudents();
    });
}

function loadStudents() {
  let subjectId = document.getElementById("subjectSelect").value;
  fetch("api.php?action=get_students&subject_id=" + subjectId)
    .then(r => r.json())
    .then(data => {
      let rows = "";
      data.forEach(st => {
        rows += `<tr>
          <td>${st.username}</td>
          <td><input type="number" value="${st.score ?? ''}" id="score_${st.id}"></td>
          <td><button onclick="saveGrade(${st.id},${subjectId})">Lưu</button></td>
        </tr>`;
      });
      document.getElementById("studentTable").innerHTML = rows;
    });
}

function saveGrade(studentId, subjectId) {
  let score = document.getElementById("score_" + studentId).value;
  fetch("api.php?action=update_grade", {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, subject_id: subjectId, score })
  }).then(() => alert("Đã lưu điểm!"));
}

function loadMyGrades() {
  fetch("api.php?action=get_my_grades")
    .then(r => r.json())
    .then(data => {
      let rows = data.map(g => `<tr><td>${g.subject}</td><td>${g.score}</td></tr>`).join("");
      document.getElementById("myGrades").innerHTML = rows;
    });
}

document.addEventListener("DOMContentLoaded", function() {
  // Kiểm tra xem trang này có thẻ select không
  const classSelect = document.getElementById("classSelect");
  console.log(classSelect);
  if (classSelect) {
    loadClasses();
  }
});
console.log("app.js loaded");