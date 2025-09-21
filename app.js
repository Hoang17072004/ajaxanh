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
      let select = document.getElementById("subjectSelect");
      select.innerHTML += classes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      
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
let editColor = "#44be44";
let saveColor="#2572e5";
function loadStudents() {
  let subjectId = document.getElementById("subjectSelect").value;
  fetch("api.php?action=get_students&subject_id=" + subjectId)
    .then(r => r.json())
    .then(data => {
      console.log(data);
      let rows = "";
      data.forEach(st => {
        rows += `
          <tr>
            <td class="student-name">${st.name}</td>
            <td>
              <input  type="number"  min=0 max=10 value="${st.score ?? ''}"   id="score_${st.id}" class="score-input" disabled style="padding: 5px; color: #333; border: 1px solid #ccc; border-radius: 4px; width: 60px;">
            </td>
            <td>
              <button data-state="0" onclick="editSave(${st.id},${subjectId},this)" class="edit-btn" style="background-color:${editColor};">Chỉnh sửa</button>
            </td>
          </tr>
        `;
      });
      document.getElementById("studentTable").innerHTML = rows;
    });
}

function editSave(studentId, subjectId,btn) {
  let score = document.getElementById("score_" + studentId).value;
  let state = btn.getAttribute("data-state");
  console.log("score", score, "state", state);
  if (score === "" || isNaN(score) || score < 0 || score > 10) {
    alert("Điểm không hợp lệ! Vui lòng nhập điểm từ 0 đến 10.");
    return;
  }
  if (state === "0") {
    // Chuyển sang trạng thái chỉnh sửa
    document.getElementById("score_" + studentId).removeAttribute("disabled");
    btn.innerText = "Lưu";
    btn.setAttribute("data-state", "1");
    btn.style.backgroundColor=saveColor;
    return;
  } // Lưu điểm
  else {
    document.getElementById("score_" + studentId).setAttribute("disabled", "true");
    btn.innerText = "Chỉnh sửa";
    btn.setAttribute("data-state", "0");
    btn.style.backgroundColor=editColor;
    fetch("api.php?action=update_grade", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, subject_id: subjectId, score })
    }).then(() => alert("Đã lưu điểm!"));
  }
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
  const classSelect = document.getElementById("subjectSelect");
  console.log(classSelect);
  if (classSelect) {
    loadClasses();
  }
  const myGradesTable = document.getElementById("myGrades");
  console.log(myGradesTable);
  if (myGradesTable) {
    console.log("Loading my grades");
    loadMyGrades();
  }
});
console.log("index.js loaded");
console.log("app.js loaded");