<?php
include "db.php";
session_start();
header("Content-Type: application/json");

$action = $_GET['action'] ?? '';

if ($action == "login") {
   
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'];
    $password = $data['password'];
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE username=? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result && password_verify($password, $result['password'])) {
        $_SESSION['user'] = $result;
        echo json_encode(["status" => "success", "role" => $result['role']]);
    } else {
        echo json_encode(["status" => "fail"]);
    }
}

if ($action =="get_classes") {
    
    $res = $conn->query("SELECT * FROM classes WHERE teacher_id=" . $_SESSION['user']['id']);
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
}

if ($action == "get_subjects") {
    $teacher_id = $_SESSION['user']['id'];
    $res = $conn->query("SELECT * FROM subjects WHERE teacher_id=$teacher_id");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
}

if ($action == "get_students") {
    $subject_id = $_GET['subject_id'];
    $sql = "SELECT u.id, u.username, g.score,u.name
            FROM student_class sc
            JOIN users u ON sc.student_id=u.id
            LEFT JOIN grades g ON g.student_id=u.id AND g.subject_id=$subject_id
            JOIN subjects s ON s.class_id=sc.class_id
            WHERE s.id=$subject_id";
    $res = $conn->query($sql);
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
}

if ($action == "update_grade") {
    $data = json_decode(file_get_contents("php://input"), true);
    $student_id = $data['student_id'];
    $subject_id = $data['subject_id'];
    $score = $data['score'];

    $check = $conn->query("SELECT id FROM grades WHERE student_id=$student_id AND subject_id=$subject_id");
    if ($check->num_rows > 0) {
        $conn->query("UPDATE grades SET score=$score WHERE student_id=$student_id AND subject_id=$subject_id");
    } else {
        $conn->query("INSERT INTO grades(student_id,subject_id,score) VALUES($student_id,$subject_id,$score)");
    }
    echo json_encode(["status" => "success"]);
}

if ($action == "get_my_grades") {
    $student_id = $_SESSION['user']['id'];
    $sql = "SELECT s.name AS subject, g.score 
            FROM grades g 
            JOIN subjects s ON g.subject_id=s.id 
            WHERE g.student_id=$student_id";
    $res = $conn->query($sql);
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
}
?>
