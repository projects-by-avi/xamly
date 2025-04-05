// Add MCQ question
function addMCQ() {
  const questionsDiv = document.getElementById('questions');
  const mcqDiv = document.createElement('div');
  mcqDiv.className = 'question';
  mcqDiv.innerHTML = `
    <input type="text" class="question-text" placeholder="MCQ Question">
    <input type="text" class="option" placeholder="Option 1">
    <input type="text" class="option" placeholder="Option 2">
    <input type="text" class="option" placeholder="Option 3">
    <input type="text" class="option" placeholder="Option 4">
    <input type="text" class="correct" placeholder="Correct Answer (e.g., Option 1)">
    <input type="number" class="marks" placeholder="Marks">
    <button onclick="deleteQuestion(this)">Delete</button>
  `;
  questionsDiv.appendChild(mcqDiv);
}

// Add subjective question
function addSubjective() {
  const questionsDiv = document.getElementById('questions');
  const subjDiv = document.createElement('div');
  subjDiv.className = 'question';
  subjDiv.innerHTML = `
    <input type="text" class="question-text" placeholder="Subjective Question">
    <input type="number" class="marks" placeholder="Marks">
    <button onclick="deleteQuestion(this)">Delete</button>
  `;
  questionsDiv.appendChild(subjDiv);
}

// Delete a question
function deleteQuestion(button) {
  button.parentElement.remove();
}

// Save exam
function saveExam() {
  const title = document.getElementById('exam-title').value;
  const timer = document.getElementById('exam-timer').value;
  const questions = [];
  const questionDivs = document.getElementsByClassName('question');

  for (let div of questionDivs) {
    const text = div.querySelector('.question-text').value;
    const marks = div.querySelector('.marks').value;
    const options = div.querySelectorAll('.option');
    if (options.length > 0) {
      const correct = div.querySelector('.correct').value;
      questions.push({
        type: 'mcq',
        text,
        options: Array.from(options).map(opt => opt.value),
        correct,
        marks
      });
    } else {
      questions.push({ type: 'subjective', text, marks });
    }
  }

  if (questions.length === 0) {
    alert('Please add at least one question!');
    return;
  }

  const exam = { title, timer, questions, id: Date.now() };
  let exams = JSON.parse(localStorage.getItem('exams')) || [];
  exams.push(exam);
  localStorage.setItem('exams', JSON.stringify(exams));
  generateQuestionPaperPDF(exam);
  alert('Exam saved successfully!');
  window.location.href = 'teacher-dashboard.html';
}

// Load submissions for grading
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('grade-submissions.html')) {
    const submissionList = document.getElementById('submission-list');
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (submissions.length === 0) {
      submissionList.innerHTML = '<p>No submissions available.</p>';
      return;
    }

    submissions.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      const student = users.find(u => u.id === sub.studentId);
      const subDiv = document.createElement('div');
      subDiv.className = 'submission';
      subDiv.innerHTML = `
        <h3>${exam.title} - ${student.username}</h3>
        <div class="answers"></div>
        <button onclick="saveGrades(${sub.id})">Save Grades</button>
      `;
      const answersDiv = subDiv.querySelector('.answers');
      sub.answers.forEach((ans, i) => {
        const q = exam.questions.find(q => q.text === ans.text);
        const ansDiv = document.createElement('div');
        ansDiv.className = 'question';
        if (ans.type === 'mcq') {
          const autoGrade = ans.answer === q.correct ? q.marks : 0;
          ansDiv.innerHTML = `
            <p>${ans.text}</p>
            <p>Answer: ${ans.answer || 'Not answered'} (Auto-graded: ${autoGrade}/${q.marks})</p>
          `;
        } else {
          ansDiv.innerHTML = `
            <p>${ans.text}</p>
            <p>Answer: ${ans.answer || 'Not answered'}</p>
            <input type="number" class="grade" placeholder="Grade (max ${q.marks})" data-index="${i}">
          `;
        }
        answersDiv.appendChild(ansDiv);
      });
      submissionList.appendChild(subDiv);
    });
  }
});

// Save grades
function saveGrades(submissionId) {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const sub = submissions.find(s => s.id === submissionId);
  const exam = JSON.parse(localStorage.getItem('exams')).find(e => e.id === sub.examId);
  const grades = [];

  const answerDivs = document.querySelectorAll(`.submission .answers .question`);
  sub.answers.forEach((ans, i) => {
    const q = exam.questions.find(q => q.text === ans.text);
    if (ans.type === 'mcq') {
      grades.push({ text: ans.text, grade: ans.answer === q.correct ? parseInt(q.marks) : 0 });
    } else {
      const gradeInput = answerDivs[i].querySelector('.grade');
      const grade = gradeInput ? Math.min(parseInt(gradeInput.value) || 0, parseInt(q.marks)) : 0;
      grades.push({ text: ans.text, grade });
    }
  });

  sub.grades = grades;
  localStorage.setItem('submissions', JSON.stringify(submissions));
  alert('Grades saved!');
}