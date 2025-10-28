document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveStudentData(e);
    });
  }
});

async function saveStudentData(event) {
  try {
    event.preventDefault(); // prevent form reload
    const studentId = document.getElementById("studentId")?.value || 0;

    // -------- Academic Marks --------
    const subjects = document.querySelectorAll(".subject-entry");
    const academic_marks = Array.from(subjects).map((entry) => ({
      subject_name: entry.querySelector(".subject-select")?.value || "",
      grade_or_percentage: parseFloat(entry.querySelector(".subject-mark")?.value) || 0,
      grade_level: entry.querySelector(".subject-grade")?.value || "12th Grade"
    }));

    // -------- Preferred Degrees (Checkboxes) --------
    const degreeCheckboxes = document.querySelectorAll('input[name="preferred_degree"]:checked');
    const selectedDegrees = Array.from(degreeCheckboxes).map(cb => cb.value);

    // -------- Preferences --------
    const preferences = {
      preferred_location:
        (document.getElementById("province")?.value || "") + ", " +
        (document.getElementById("suburb")?.value || ""),
      preferred_degrees: selectedDegrees, // send array directly
      max_tuition_fee: parseFloat(document.getElementById("max_tuition_fee")?.value) || 0,
      focus_area: document.getElementById("focus_area")?.value || "",
      relocate: document.querySelector('input[name="relocate"]:checked')?.value || "",
      study_mode: document.querySelector('input[name="studyMode"]:checked')?.value || "",
      need_support: document.querySelector('input[name="needSupport"]:checked')?.value || "",
      support_details: document.getElementById("supportDetails")?.value || "",
      career_interests: Array.from(document.querySelectorAll(".career-select"))
        .map(c => c.value)
        .filter(v => v),
      nsfas: document.querySelector('input[name="nsfas"]:checked')?.value || ""
    };

    const data = {
      student_id: parseInt(studentId),
      academic_marks,
      preferences
    };

    console.log("🟦 Data being sent to /search/save_data:", data);

    const response = await fetch("/search/save_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message || "Data saved successfully!");
    } else {
      alert(result.message || "Failed to save data");
    }
  } catch (err) {
    console.error("❌ Error saving data:", err);
    alert("Something went wrong while saving data. Check console for details.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("searchForm");
  if (form) {
    // Load existing data
    const res = await fetch("/search/get_student_data");
    if (res.ok) {
      const data = await res.json();

      // Populate Academic Marks
      data.academic_marks.forEach((mark, index) => {
        const entry = document.querySelectorAll(".subject-entry")[index];
        if (entry) {
          entry.querySelector(".subject-select").value = mark.subject_name;
          entry.querySelector(".subject-mark").value = mark.grade_or_percentage;
          entry.querySelector(".subject-grade").value = mark.grade_level;
        }
      });

      // Populate Preferences
      document.getElementById("province").value = data.preferences.preferred_location.split(",")[0] || "";
      document.getElementById("suburb").value = data.preferences.preferred_location.split(",")[1] || "";
      document.querySelectorAll('input[name="preferred_degree"]').forEach(cb => {
        cb.checked = data.preferences.preferred_degrees.includes(cb.value);
      });
      document.getElementById("max_tuition_fee").value = data.preferences.max_tuition_fee;
      document.getElementById("focus_area").value = data.preferences.focus_area;
      if (data.preferences.relocate) document.querySelector(`input[name="relocate"][value="${data.preferences.relocate}"]`).checked = true;
      if (data.preferences.study_mode) document.querySelector(`input[name="studyMode"][value="${data.preferences.study_mode}"]`).checked = true;
      if (data.preferences.need_support) document.querySelector(`input[name="needSupport"][value="${data.preferences.need_support}"]`).checked = true;
      document.getElementById("supportDetails").value = data.preferences.support_details;
      document.querySelectorAll(".career-select").forEach((sel, i) => sel.value = data.preferences.career_interests[i] || "");
      if (data.preferences.nsfas) document.querySelector(`input[name="nsfas"][value="${data.preferences.nsfas}"]`).checked = true;
    }

    // Handle submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveStudentData(e);
    });
  }
});
