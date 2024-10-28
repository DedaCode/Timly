class PomodoroTimer {
  constructor() {
    this.minutes = 25;
    this.seconds = 0;
    this.isRunning = false;
    this.isWorkPhase = true;
    this.workDuration = 25;
    this.breakDuration = 5;
    this.timer = null;

    // DOM elements
    this.minutesDisplay = document.getElementById('minutes');
    this.secondsDisplay = document.getElementById('seconds');
    this.phaseLabel = document.getElementById('phase-label');
    this.startButton = document.getElementById('start');
    this.pauseButton = document.getElementById('pause');
    this.resetButton = document.getElementById('reset');
    this.workDurationInput = document.getElementById('workDuration');
    this.breakDurationInput = document.getElementById('breakDuration');
    this.saveSettingsButton = document.getElementById('saveSettings');

    this.initializeEventListeners();
    this.loadSettings();
  }

  initializeEventListeners() {
    this.startButton.addEventListener('click', () => this.start());
    this.pauseButton.addEventListener('click', () => this.pause());
    this.resetButton.addEventListener('click', () => this.reset());
    this.saveSettingsButton.addEventListener('click', () => this.saveSettings());
  }

  async loadSettings() {
    const settings = await chrome.storage.local.get(['workDuration', 'breakDuration']);
    if (settings.workDuration) {
      this.workDuration = settings.workDuration;
      this.workDurationInput.value = this.workDuration;
    }
    if (settings.breakDuration) {
      this.breakDuration = settings.breakDuration;
      this.breakDurationInput.value = this.breakDuration;
    }
    this.reset();
  }

  async saveSettings() {
    this.workDuration = parseInt(this.workDurationInput.value);
    this.breakDuration = parseInt(this.breakDurationInput.value);
    
    await chrome.storage.local.set({
      workDuration: this.workDuration,
      breakDuration: this.breakDuration
    });

    this.reset();
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => this.tick(), 1000);
      this.startButton.disabled = true;
      this.pauseButton.disabled = false;
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timer);
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
    }
  }

  reset() {
    this.pause();
    this.isWorkPhase = true;
    this.minutes = this.workDuration;
    this.seconds = 0;
    this.updateDisplay();
    this.updatePhaseLabel();
  }

  tick() {
    if (this.seconds === 0) {
      if (this.minutes === 0) {
        this.switchPhase();
        return;
      }
      this.minutes--;
      this.seconds = 59;
    } else {
      this.seconds--;
    }
    this.updateDisplay();
  }

  switchPhase() {
    this.isWorkPhase = !this.isWorkPhase;
    this.minutes = this.isWorkPhase ? this.workDuration : this.breakDuration;
    this.seconds = 0;
    this.updateDisplay();
    this.updatePhaseLabel();
    this.showNotification();
  }

  updateDisplay() {
    this.minutesDisplay.textContent = String(this.minutes).padStart(2, '0');
    this.secondsDisplay.textContent = String(this.seconds).padStart(2, '0');
  }

  updatePhaseLabel() {
    this.phaseLabel.textContent = this.isWorkPhase ? 'Work Time' : 'Break Time';
  }

  showNotification() {
    const phase = this.isWorkPhase ? 'work' : 'break';
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Pomodoro Timer',
      message: `Time to ${phase}!`
    });
  }
}

// Initialize the timer when popup opens
document.addEventListener('DOMContentLoaded', () => {
  const timer = new PomodoroTimer();
});
