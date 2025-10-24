
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveBtn");

  if (saveButton) {
    saveButton.addEventListener("click", saveStudentData);
  }
});

// Example: gather all form or input data from the page
async function saveStudentData() {
  const studentId = document.getElementById("studentId").value; // hidden input or session-based
  const subjectInputs = document.querySelectorAll(".subject-input");
  const gradeInputs = document.querySelectorAll(".grade-input");

  // Collect academic marks
  const academic_marks = Array.from(subjectInputs).map((subjectInput, index) => ({
    subject_name: subjectInput.value,
    grade_or_percentage: parseFloat(gradeInputs[index].value),
    grade_level: "12th Grade"
  }));

  // Collect preferences
  const preferences = {
    preferred_location: document.getElementById("preferred_location").value,
    preferred_degree: document.getElementById("preferred_degree").value,
    max_tuition_fee: parseFloat(document.getElementById("max_tuition_fee").value),
    focus_area: document.getElementById("focus_area").value
  };

  const data = {
    student_id: parseInt(studentId),
    academic_marks,
    preferences
  };

  try {
    const response = await fetch("/save_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Something went wrong while saving data.");
  }
}
