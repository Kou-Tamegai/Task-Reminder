document.getElementById("classForm").addEventListener("submit", submitForm);

function submitForm(event) {
  event.preventDefault();
  const className = document.getElementById("className").value;
  const deadlineDay = document.getElementById("deadlineDay").value;
  const deadlineTime = document.getElementById("deadlineTime").value;

  saveClassData(className, deadlineDay, deadlineTime);
  document.getElementById("countdownContainer").innerHTML = "";
  loadClassData();
}

function updateCountdown(card) {
  if (card.classList.contains("submitted")) {
    stopBlinkAnimation(card);
    return;
  }
  const deadlineDay = parseInt(card.getAttribute("data-deadline-day"));
  const deadlineTime = card.getAttribute("data-deadline-time");
  const countdown = card.querySelector(".countdown-text");
  const countdownMessage = card.querySelector(".countdown-message");

  const now = new Date();
  const deadline = new Date();
  const [hours, minutes] = deadlineTime.split(':');
  deadline.setHours(hours, minutes, 0);
  deadline.setDate(deadline.getDate() + ((7 - now.getDay() + deadlineDay) % 7));

  if (now > deadline) {
    deadline.setDate(deadline.getDate() + 7);
  }

  const remainingTime = deadline - now;
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((remainingTime % (1000 * 60)) / 1000);

  countdown.textContent = `締切まで: ${days}日 ${hoursRemaining}時間 ${minutesRemaining}分 ${secondsRemaining}秒`;

  if (days <= 1) {
    countdownMessage.textContent = "締切間近です。課題を完成させ、名前、学籍番号等を確認しすぐに提出しましょう";
    card.style.animation = "blink 3s infinite";
  } else if (days > 1 && days <= 2) {
    countdownMessage.textContent = "期限が迫っています。必要に応じて復習をし、課題に取り組みましょう。";
  } else {
    countdown.style.color = "black";
    countdownMessage.textContent = "この課題にはまだ余裕があります。他の課題を確認し、全て終わっていれば取り組みましょう。";
  }
}

function stopBlinkAnimation(card) {
  card.style.animation = "none";
  clearInterval(card.intervalId);
  card.querySelector(".countdown-text").textContent = "この課題は提出が完了しています。";
  card.querySelector(".countdown-message").style.display = "none";
}

function saveClassData(className, deadlineDay, deadlineTime) {
  const classData = JSON.parse(localStorage.getItem("classData")) || [];
  classData.push({ className, deadlineDay, deadlineTime, memoText: "" });
  classData.sort((a, b) => (a.deadlineDay - b.deadlineDay) || (a.deadlineTime.localeCompare(b.deadlineTime)));
  localStorage.setItem("classData", JSON.stringify(classData));
}

function loadClassData() {
  const classData = JSON.parse(localStorage.getItem("classData")) || [];
  const countdownContainer = document.getElementById("countdownContainer");
  while (countdownContainer.firstChild) {
    countdownContainer.removeChild(countdownContainer.firstChild);
  }
  classData.forEach(({ className, deadlineDay, deadlineTime, memoText, submitted }) => {
    const countdownCard = document.createElement("div");
    countdownCard.classList.add("countdown-card");
    countdownCard.setAttribute("data-deadline-day", deadlineDay);
    countdownCard.setAttribute("data-deadline-time", deadlineTime);

    const title = document.createElement("h2");
    title.textContent = className;
    countdownCard.appendChild(title);

    const countdown = document.createElement("p");
    countdown.classList.add("countdown-text");
    countdownCard.appendChild(countdown);

    const countdownMessage = document.createElement("p");
    countdownMessage.classList.add("countdown-message");
    countdownCard.appendChild(countdownMessage);

    const memo = document.createElement("textarea");
memo.placeholder = "メモ";
memo.value = memoText;
memo.addEventListener("input", () => {
  const index = Array.prototype.indexOf.call(document.getElementById("countdownContainer").children, countdownCard);
  const classData = JSON.parse(localStorage.getItem("classData")) || [];
  classData[index].memoText = memo.value;
  localStorage.setItem("classData", JSON.stringify(classData));
});
countdownCard.appendChild(memo);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
      const index = Array.prototype.indexOf.call(document.getElementById("countdownContainer").children, countdownCard);
      const classData = JSON.parse(localStorage.getItem("classData")) || [];
      classData.splice(index, 1);
      localStorage.setItem("classData", JSON.stringify(classData));
      countdownCard.remove();
    });
    countdownCard.appendChild(deleteButton);
    const submitButton = document.importNode(document.getElementById("submitBtnTemplate").content, true);
    const btn = submitButton.querySelector(".submit-btn");
    btn.addEventListener("click", () => {
      if (!countdownCard.classList.contains("submitted")) {
        clearInterval(countdownCard.intervalId);
        btn.disabled = true;
        btn.textContent = "提出済み";
        stopBlinkAnimation(countdownCard);
        moveCardToBottom(countdownCard);
        countdownCard.classList.add("submitted");
      } else {
        btn.disabled = false;
        btn.textContent = "提出";
        countdownCard.classList.remove("submitted");
        countdownCard.intervalId = setInterval(() => {
          updateCountdown(countdownCard);
        }, 1000);
      }
    
      const index = Array.prototype.indexOf.call(document.getElementById("countdownContainer").children, countdownCard);
      const classData = JSON.parse(localStorage.getItem("classData")) || [];
      classData[index].submitted = countdownCard.classList.contains("submitted");
      localStorage.setItem("classData", JSON.stringify(classData));
    });

    countdownCard.appendChild(submitButton);

    if (submitted) {
      btn.disabled = true;
      btn.textContent = "提出済み";
      stopBlinkAnimation(countdownCard);
      countdownCard.classList.add("submitted");
      countdownCard.style.opacity = "0.5";
    }

    countdownCard.intervalId = setInterval(() => {
      updateCountdown(countdownCard);
    }, 1000);

    document.getElementById("countdownContainer").appendChild(countdownCard);
  });
}

function moveCardToBottom(card) {
  const container = document.getElementById("countdownContainer");
  container.removeChild(card);
  container.appendChild(card);
}

loadClassData();
