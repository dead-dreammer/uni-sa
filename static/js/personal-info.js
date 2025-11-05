document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("searchForm");
  if (!form) return;

  // Function to create a subject entry (used for both loading data and initial setup)
  function createSubjectEntry(subjectData = null, index = 0) {
    const subjectsList = window.subjects || [];
    const entry = document.createElement("div");
    entry.className = "subject-entry";
    
    const selectedSubject = subjectData?.subject_name || "";
    const markValue = subjectData?.grade_or_percentage || "";
    const gradeValue = subjectData?.grade_level || "";
    
    entry.innerHTML = `
      <div class="subject-row">
        <div class="form-group flex-2">
          <label>Subject</label>
          <select class="subject-select" required>
            <option value="">Select Subject</option>
            ${subjectsList.map(s => `<option value="${s}" ${s === selectedSubject ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group flex-1">
          <label>Mark (%)</label>
          <input type="number" class="subject-mark" min="0" max="100" placeholder="85" value="${markValue}" required>
        </div>
        <div class="form-group flex-1">
          <label>Grade</label>
          <select class="subject-grade" required>
            <option value="">Grade</option>
            <option value="10" ${gradeValue === '10th Grade' ? 'selected' : ''}>10</option>
            <option value="11" ${gradeValue === '11th Grade' ? 'selected' : ''}>11</option>
            <option value="12" ${gradeValue === '12th Grade' ? 'selected' : ''}>12</option>
          </select>
        </div>
        ${index > 0 ? '<button type="button" class="btn-remove-subject" title="Remove Subject">×</button>' : ''}
      </div>
    `;
    return entry;
  }

  try {
    // Load existing data
    const res = await fetch("/search/get_student_data");
    if (res.ok) {
      const data = await res.json();
      console.log("Loaded student data:", data);
      
      // Populate Academic Marks
      const container = document.getElementById("subjectsContainer");
      container.innerHTML = ''; // Clear existing entries
      
      if (data.academic_marks && data.academic_marks.length > 0) {
        data.academic_marks.forEach((mark, index) => {
          container.appendChild(createSubjectEntry(mark, index));
        });
        
        // Update the global subjectCount if it exists
        if (typeof window.subjectCount !== 'undefined') {
          window.subjectCount = data.academic_marks.length;
        }
      } else {
        // No saved data, create one empty subject entry
        container.appendChild(createSubjectEntry(null, 0));
        if (typeof window.subjectCount !== 'undefined') {
          window.subjectCount = 1;
        }
      }
      
      // Populate Location
      if (data.preferences && data.preferences.preferred_location) {
        const locationParts = data.preferences.preferred_location.split(',');
        const province = locationParts[0]?.trim() || '';
        const suburb = locationParts[1]?.trim() || '';
        
        const provinceSelect = document.getElementById("province");
        const suburbInput = document.getElementById("suburb");
        if (provinceSelect && province) provinceSelect.value = province;
        if (suburbInput && suburb) suburbInput.value = suburb;
      }
      
      // Populate Relocate
      if (data.preferences && data.preferences.relocate) {
        const relocateRadio = document.querySelector(`input[name="relocate"][value="${data.preferences.relocate}"]`);
        if (relocateRadio) relocateRadio.checked = true;
      }
      
      // Populate Study Mode
      if (data.preferences && data.preferences.study_mode) {
        const studyModeRadio = document.querySelector(`input[name="studyMode"][value="${data.preferences.study_mode}"]`);
        if (studyModeRadio) studyModeRadio.checked = true;
      }
      
      // Populate Preferred Degrees
      if (data.preferences && data.preferences.preferred_degrees && data.preferences.preferred_degrees.length > 0) {
        data.preferences.preferred_degrees.forEach(degree => {
          const checkbox = document.querySelector(`input[name="preferred_degree"][value="${degree}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Populate Max Tuition Fee
      if (data.preferences && data.preferences.max_tuition_fee) {
        const tuitionInput = document.getElementById("max_tuition_fee");
        if (tuitionInput) tuitionInput.value = data.preferences.max_tuition_fee;
      }
      
      // Populate Need Support
      if (data.preferences && data.preferences.need_support) {
        const supportRadio = document.querySelector(`input[name="needSupport"][value="${data.preferences.need_support}"]`);
        if (supportRadio) {
          supportRadio.checked = true;
          // Trigger change event to show/hide support details section
          supportRadio.dispatchEvent(new Event('change'));
        }
      }
      
      // Populate Support Details
      if (data.preferences && data.preferences.support_details) {
        const supportDetailsTextarea = document.getElementById("supportDetails");
        if (supportDetailsTextarea) supportDetailsTextarea.value = data.preferences.support_details;
      }
      
      // Populate Career Interests
      if (data.preferences && data.preferences.career_interests && data.preferences.career_interests.length > 0) {
        const careerSelects = document.querySelectorAll(".career-select");
        data.preferences.career_interests.forEach((career, index) => {
          if (careerSelects[index] && career) {
            careerSelects[index].value = career;
          }
        });
      }
      
      // Populate NSFAS
      if (data.preferences && data.preferences.nsfas) {
        const nsfasRadio = document.querySelector(`input[name="nsfas"][value="${data.preferences.nsfas}"]`);
        if (nsfasRadio) nsfasRadio.checked = true;
      }
      
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
