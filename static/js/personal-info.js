document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("searchForm");
  if (!form) return;

  try {
    // Load existing data
    const res = await fetch("/search/get_student_data");
    if (res.ok) {
      const data = await res.json();

      // Remove the default empty subject entry
      const defaultEntry = document.querySelector('.subject-entry');
      if (defaultEntry) {
        defaultEntry.remove();
      }

      // Populate Academic Marks
      data.academic_marks.forEach((mark, index) => {
        if (index > 0) {
          // Add new subject entry for marks after the first one
          document.getElementById('addSubject').click();
        }
        
        // Get all subject entries and populate the latest one
        const entries = document.querySelectorAll(".subject-entry");
        const entry = entries[entries.length - 1];
        if (entry) {
          entry.querySelector(".subject-select").value = mark.subject_name;
          entry.querySelector(".subject-mark").value = mark.grade_or_percentage;
          entry.querySelector(".subject-grade").value = mark.grade_level.replace('th Grade', '');
        }
      });

      // If no marks were loaded, restore the default empty entry
      if (data.academic_marks.length === 0) {
        document.getElementById('addSubject').click();
      }

      // Populate Preferences
      const [province = "", suburb = ""] = (data.preferences.preferred_location || "").split(",").map(s => s.trim());
      document.getElementById("province").value = province.toLowerCase();
      document.getElementById("suburb").value = suburb;
      
      document.querySelectorAll('input[name="preferred_degree"]').forEach(cb => {
        cb.checked = data.preferences.preferred_degrees.includes(cb.value);
      });
      
      if (data.preferences.max_tuition_fee) {
        document.getElementById("max_tuition_fee").value = data.preferences.max_tuition_fee;
      }
      
      if (data.preferences.relocate) {
        const relocateInput = document.querySelector(`input[name="relocate"][value="${data.preferences.relocate}"]`);
        if (relocateInput) relocateInput.checked = true;
      }
      
      if (data.preferences.study_mode) {
        const studyModeInput = document.querySelector(`input[name="studyMode"][value="${data.preferences.study_mode}"]`);
        if (studyModeInput) studyModeInput.checked = true;
      }
      
      if (data.preferences.need_support) {
        const supportInput = document.querySelector(`input[name="needSupport"][value="${data.preferences.need_support === 'true' ? 'yes' : 'no'}"]`);
        if (supportInput) {
          supportInput.checked = true;
          if (data.preferences.need_support === 'true') {
            document.getElementById('section-support-details').classList.remove('hidden');
            document.getElementById("supportDetails").value = data.preferences.support_details || '';
          }
        }
      }
      
      const careerSelects = document.querySelectorAll(".career-select");
      (data.preferences.career_interests || []).forEach((career, i) => {
        if (careerSelects[i]) {
          careerSelects[i].value = career;
        }
      });
      
      if (data.preferences.nsfas) {
        const nsfasInput = document.querySelector(`input[name="nsfas"][value="${data.preferences.nsfas}"]`);
        if (nsfasInput) nsfasInput.checked = true;
      }

      // Update progress after populating data
      updateProgress();
    }
  } catch (err) {
    console.error("Error loading saved data:", err);
    showError("Failed to load your saved data. You can continue with empty form.", null);
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
      const studentId = document.getElementById("studentId")?.value || 0;

      // Collect academic marks
      const subjects = document.querySelectorAll(".subject-entry");
      const academic_marks = Array.from(subjects).map((entry) => ({
        subject_name: entry.querySelector(".subject-select")?.value || "",
        grade_or_percentage: parseFloat(entry.querySelector(".subject-mark")?.value) || 0,
        grade_level: entry.querySelector(".subject-grade")?.value + "th Grade"
      }));

      // Collect preferences
      const degreeCheckboxes = document.querySelectorAll('input[name="preferred_degree"]:checked');
      const selectedDegrees = Array.from(degreeCheckboxes).map(cb => cb.value);

      const province = document.getElementById("province")?.value || "";
      const suburb = document.getElementById("suburb")?.value || "";
      
      const data = {
        student_id: parseInt(studentId),
        academic_marks,
        preferences: {
          preferred_location: suburb ? `${province}, ${suburb}` : province,
          preferred_degrees: selectedDegrees,
          max_tuition_fee: parseFloat(document.getElementById("max_tuition_fee")?.value) || 0,
          relocate: document.querySelector('input[name="relocate"]:checked')?.value || "",
          study_mode: document.querySelector('input[name="studyMode"]:checked')?.value || "",
          need_support: document.querySelector('input[name="needSupport"]:checked')?.value || "",
          support_details: document.getElementById("supportDetails")?.value || "",
          career_interests: Array.from(document.querySelectorAll(".career-select"))
            .map(c => c.value)
            .filter(v => v),
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
