document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("searchForm");
  if (!form) return;

  try {
    // Load existing data
    const res = await fetch("/search/get_student_data");
    if (res.ok) {
      const data = await res.json();
      // ...existing code...
      // (populate fields, update progress, etc.)
      // ...existing code...
      updateProgress();
    }
  } catch (err) {
    console.error("Error loading saved data:", err);
    showError("Failed to load your saved data. You can continue with empty form.", null);
  }

  // Handle form submission with robust validation
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- CLIENT-SIDE VALIDATION ---
    // 1. Academic Marks: at least 1, all required, mark 0-100, subject/grade not empty
    const subjects = document.querySelectorAll(".subject-entry");
    if (subjects.length === 0) {
      showError("Please enter at least one subject and mark.", "section-subjects");
      return;
    }
    for (const entry of subjects) {
      const subj = entry.querySelector(".subject-select");
      const mark = entry.querySelector(".subject-mark");
      const grade = entry.querySelector(".subject-grade");
      if (!subj.value) {
        showError("Subject is required.", "section-subjects");
        return;
      }
      if (!mark.value || isNaN(mark.value) || mark.value < 0 || mark.value > 100) {
        showError("Mark must be a number between 0 and 100.", "section-subjects");
        return;
      }
      if (!grade.value) {
        showError("Grade is required.", "section-subjects");
        return;
      }
    }

    // 2. Location: province and suburb required
    const province = document.getElementById("province");
    const suburb = document.getElementById("suburb");
    if (!province.value) {
      showError("Please select your province.", "section-location");
      return;
    }
    if (!suburb.value.trim()) {
      showError("Please enter your suburb/area.", "section-location");
      return;
    }

    // 3. Relocate: required
    if (!document.querySelector('input[name="relocate"]:checked')) {
      showError("Please indicate if you are willing to relocate.", "section-relocate");
      return;
    }

    // 4. Study Mode: required
    if (!document.querySelector('input[name="studyMode"]:checked')) {
      showError("Please select your preferred study mode.", "section-study-mode");
      return;
    }

    // 5. Preferred Degree: at least one
    if (!document.querySelector('input[name="preferred_degree"]:checked')) {
      showError("Please select at least one qualification type.", "preferred_degree_group");
      return;
    }

    // 6. Max Tuition Fee: required, positive number
    const tuition = document.getElementById("max_tuition_fee");
    if (!tuition.value || isNaN(tuition.value) || tuition.value <= 0) {
      showError("Please enter a valid maximum tuition fee (must be positive).", "max_tuition_fee");
      return;
    }

    // 7. Need Support: required
    if (!document.querySelector('input[name="needSupport"]:checked')) {
      showError("Please indicate if you need academic support.", "section-support");
      return;
    }
    // 8. Support Details: required if needSupport is yes
    const needSupport = document.querySelector('input[name="needSupport"]:checked')?.value;
    const supportDetails = document.getElementById("supportDetails");
    if (needSupport === "yes" && (!supportDetails.value.trim() || supportDetails.value.length < 5)) {
      showError("Please specify the support you need (at least 5 characters).", "section-support-details");
      return;
    }

    // 9. Career Interests: at least 1 selected
    const careerSelects = document.querySelectorAll(".career-select");
    const selectedCareers = Array.from(careerSelects).map(c => c.value).filter(Boolean);
    if (selectedCareers.length === 0) {
      showError("Please select at least one career of interest.", "section-careers");
      return;
    }

    // 10. NSFAS: required
    if (!document.querySelector('input[name="nsfas"]:checked')) {
      showError("Please indicate if you will apply for NSFAS.", "section-nsfas");
      return;
    }

    // --- END VALIDATION ---

    try {
      const studentId = document.getElementById("studentId")?.value || 0;
      // ...existing code for collecting data and AJAX...
      // Collect academic marks
      const academic_marks = Array.from(subjects).map((entry) => ({
        subject_name: entry.querySelector(".subject-select")?.value || "",
        grade_or_percentage: parseFloat(entry.querySelector(".subject-mark")?.value) || 0,
        grade_level: entry.querySelector(".subject-grade")?.value + "th Grade"
      }));
      // Collect preferences
      const degreeCheckboxes = document.querySelectorAll('input[name="preferred_degree"]:checked');
      const selectedDegrees = Array.from(degreeCheckboxes).map(cb => cb.value);
      const data = {
        student_id: parseInt(studentId),
        academic_marks,
        preferences: {
          preferred_location: suburb.value ? `${province.value}, ${suburb.value}` : province.value,
          preferred_degrees: selectedDegrees,
          max_tuition_fee: parseFloat(tuition.value) || 0,
          relocate: document.querySelector('input[name="relocate"]:checked')?.value || "",
          study_mode: document.querySelector('input[name="studyMode"]:checked')?.value || "",
          need_support: needSupport || "",
          support_details: supportDetails?.value || "",
          career_interests: selectedCareers,
          nsfas: document.querySelector('input[name="nsfas"]:checked')?.value || ""
        }
      };

      console.log("Saving data:", data);

      const response = await fetch("/search/save_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to save data");
      }

      // After successful save, submit the form to proceed to matches
      form.submit();

    } catch (err) {
      console.error("Error saving data:", err);
      showError(err.message || "Failed to save your data. Please try again.", null);
    }
  });
});
