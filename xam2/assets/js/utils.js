// Generate question paper PDF
function generateQuestionPaperPDF(exam) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Exam: ${exam.title}`, 10, 10);
  doc.text(`Time Limit: ${exam.timer} minutes`, 10, 20);
  let y = 30;
  exam.questions.forEach((q, i) => {
    doc.text(`${i + 1}. ${q.text} (${q.marks} marks)`, 10, y);
    if (q.type === 'mcq') {
      q.options.forEach((opt, j) => {
        doc.text(`   ${String.fromCharCode(97 + j)}. ${opt}`, 10, y + 10 + j * 10);
      });
      y += 50;
    } else {
      y += 20;
    }
  });
  doc.save(`${exam.title}_QuestionPaper.pdf`);
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Export exams
function exportExams() {
  const exams = JSON.parse(localStorage.getItem('exams')) || [];
  const dataStr = JSON.stringify(exams);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exams.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import exams
function importExams(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const exams = JSON.parse(e.target.result);
    localStorage.setItem('exams', JSON.stringify(exams));
    alert('Exams imported successfully!');
    window.location.reload(); // Refresh to show imported exams
  };
  reader.readAsText(file);
}

// Export submissions
function exportSubmissions() {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const dataStr = JSON.stringify(submissions);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'submissions.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import submissions
function importSubmissions(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const submissions = JSON.parse(e.target.result);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    alert('Submissions imported successfully!');
    window.location.reload(); // Refresh to show imported submissions
  };
  reader.readAsText(file);
}