// Load exams on dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('student-dashboard.html')) {
      const examList = document.getElementById('exam-list');
      const exams = JSON.parse(localStorage.getItem('exams')) || [];
      if (exams.length === 0) {
        examList.innerHTML = '<p>No exams available.</p>';
      } else {
        exams.forEach(exam => {
          const examDiv = document.createElement('div');
          examDiv.innerHTML = `
            <p>${exam.title} (${exam.timer} minutes)</p>
            <button onclick="startExam(${exam.id})">Take Exam</button>
          `;
          examList.appendChild(examDiv);
        });
      }
    }
  });
  
  // Start exam
  function startExam(examId) {
    localStorage.setItem('currentExamId', examId);
    window.location.href = 'take-exam.html';
  }
  
  // Load exam for taking
  let timerInterval;
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('take-exam.html')) {
      const examId = parseInt(localStorage.getItem('currentExamId'));
      const exams = JSON.parse(localStorage.getItem('exams')) || [];
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
  
      document.getElementById('exam-title').textContent = exam.title;
      let totalMarks = exam.questions.reduce((sum, q) => sum + parseInt(q.marks), 0);
      document.getElementById('total-marks').textContent = totalMarks;
  
      const questionsDiv = document.getElementById('questions');
      const shuffledQuestions = shuffleArray([...exam.questions]);
      shuffledQuestions.forEach((q, i) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question';
        if (q.type === 'mcq') {
          qDiv.innerHTML = `
            <p>${i + 1}. ${q.text} (${q.marks} marks)</p>
            ${q.options.map((opt, j) => `
              <label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label><br>
            `).join('')}
          `;
        } else {
          qDiv.innerHTML = `
            <p>${i + 1}. ${q.text} (${q.marks} marks)</p>
            <textarea class="subjective-answer" placeholder="Your answer"></textarea>
          `;
        }
        questionsDiv.appendChild(qDiv);
      });
  
      let timeLeft = exam.timer * 60;
      const timerDisplay = document.getElementById('timer');
      timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeLeft--;
        if (timeLeft < 0) {
          clearInterval(timerInterval);
          submitExam();
        }
      }, 1000);
    }
  });
  
  // Submit exam
  function submitExam() {
    const examId = parseInt(localStorage.getItem('currentExamId'));
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const exam = exams.find(e => e.id === examId);
    const questionsDiv = document.getElementById('questions').children;
    const answers = [];
  
    for (let i = 0; i < questionsDiv.length; i++) {
      const qDiv = questionsDiv[i];
      const q = exam.questions.find(q => q.text === qDiv.querySelector('p').textContent.split('. ')[1].split(' (')[0]);
      if (q.type === 'mcq') {
        const selected = qDiv.querySelector(`input[name="q${i}"]:checked`);
        answers.push({ text: q.text, answer: selected ? selected.value : '', type: 'mcq' });
      } else {
        const answer = qDiv.querySelector('.subjective-answer').value;
        answers.push({ text: q.text, answer, type: 'subjective' });
      }
    }
  
    const submission = {
      examId,
      studentId: JSON.parse(localStorage.getItem('currentUser')).id,
      answers,
      id: Date.now()
    };
    let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    clearInterval(timerInterval);
    alert('Exam submitted!');
    window.location.href = 'student-dashboard.html';
  }
  
  // Load results
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('view-results.html')) {
      const studentId = JSON.parse(localStorage.getItem('currentUser')).id;
      const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
      const exams = JSON.parse(localStorage.getItem('exams')) || [];
      const resultsList = document.getElementById('results-list');
      const studentSubs = submissions.filter(sub => sub.studentId === studentId && sub.grades);
  
      if (studentSubs.length === 0) {
        resultsList.innerHTML = '<p>No graded results available.</p>';
        return;
      }
  
      studentSubs.forEach(sub => {
        const exam = exams.find(e => e.id === sub.examId);
        const subDiv = document.createElement('div');
        subDiv.className = 'result';
        subDiv.innerHTML = `<h3>${exam.title}</h3>`;
        const gradesDiv = document.createElement('div');
        let total = 0;
        sub.grades.forEach(g => {
          const q = exam.questions.find(q => q.text === g.text);
          total += g.grade;
          gradesDiv.innerHTML += `
            <p>${g.text}: ${g.grade}/${q.marks}</p>
          `;
        });
        gradesDiv.innerHTML += `<p><strong>Total: ${total}/${exam.questions.reduce((sum, q) => sum + parseInt(q.marks), 0)}</strong></p>`;
        subDiv.appendChild(gradesDiv);
        subDiv.dataset.examId = sub.examId; // Store for PDF
        resultsList.appendChild(subDiv);
      });
    }
  });
  
  // Download results PDF
  function downloadResultsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const studentId = JSON.parse(localStorage.getItem('currentUser')).id;
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const studentSubs = submissions.filter(sub => sub.studentId === studentId && sub.grades);
  
    let y = 10;
    studentSubs.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      doc.text(`Exam: ${exam.title}`, 10, y);
      y += 10;
      sub.grades.forEach(g => {
        const q = exam.questions.find(q => q.text === g.text);
        doc.text(`${g.text}: ${g.grade}/${q.marks}`, 10, y);
        y += 10;
      });
      const total = sub.grades.reduce((sum, g) => sum + g.grade, 0);
      const max = exam.questions.reduce((sum, q) => sum + parseInt(q.marks), 0);
      doc.text(`Total: ${total}/${max}`, 10, y);
      y += 20;
    });
    doc.save('Results.pdf');
  }
  
  // Shuffle array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }