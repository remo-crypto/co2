const screens = {
  start: document.getElementById('screen-start'),
  stage: document.getElementById('screen-stage'),
  report: document.getElementById('screen-report'),
};
const currentStepLabel = document.getElementById('current-step');
const totalStepLabel = document.getElementById('total-step');
const stageTitle = document.getElementById('stage-title');
const stageDescription = document.getElementById('stage-description');
const stageForm = document.getElementById('stage-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const reportBreakdown = document.getElementById('report-breakdown');
const reportTotal = document.getElementById('report-total');
const endingMessage = document.getElementById('ending-message');
const restartBtn = document.getElementById('restart-btn');

const values = {
  shower: { cold: 0.05, hot: 0.80 },
  breakfast: { toast: 0.15, eggs: 0.40, coffee: 0.20, rice: 0.60 },
  appliances: { fan: 0.05, light: 0.02, microwave: 0.12, kettle: 0.10 },
  commute: { car: 2.50, bus: 0.70, bike: 1.20, bicycle: 0.00, walking: 0.00 },
  office: { computer: 0.40, internet: 0.20, ac: 0.60, heater: 1.00, coffee: 0.20, printingPer5: 0.05 },
  lunch: { rice: 0.60, chicken: 1.60, drink: 0.30, vegetables: 0.20 },
  shopping: { none: 0.00, sustainable: 0.20, clothing: 2.00, gadget: 15.00 },
  dinnerCooking: { home: 0.50, electric: 0.80, gas: 1.00 },
  dinnerFood: { vegetables: 0.30, rice: 0.60, chicken: 1.60, packaged: 2.00 },
  tv: 0.08,
  waste: { segregated: 0.10, mixed: 0.50, excess: 1.00 },
};

const state = {
  character: 'male',
  shower: 'cold',
  breakfast: { toast: false, eggs: false, coffee: false, rice: false },
  appliances: {
    fanDuration: '00:00:00',
    lightDuration: '00:00:00',
    microwaveDuration: '00:00:00',
    kettleDuration: '00:00:00',
  },
  commute: 'bicycle',
  office: {
    computer: false,
    internet: false,
    acDuration: '00:00:00',
    heaterDuration: '00:00:00',
    coffee: false,
    printingPages: 0,
  },
  lunch: { rice: false, chicken: false, drink: false, vegetables: false },
  shopping: 'none',
  dinner: { cooking: 'home', food: { vegetables: false, rice: false, chicken: false, packaged: false } },
  tvDuration: '00:00:00',
  waste: 'segregated',
};

const stages = [
  { id: 'wake', title: 'Wake Up', description: 'Your day begins. Prepare for a sustainable routine as you get ready to live a typical office day.', action: 'next' },
  { id: 'shower', title: 'Morning Shower', description: 'Choose a shower type for the morning.', action: 'next' },
  { id: 'breakfast', title: 'Breakfast', description: 'Pick the breakfast items you want to eat today. You may choose more than one.', action: 'next' },
  { id: 'appliances', title: 'Home Appliances', description: 'Select the appliances you use at home before leaving for work.', action: 'next' },
  { id: 'commute', title: 'Travel to Office', description: 'Choose your mode of transportation for the commute.', action: 'next' },
  { id: 'office', title: 'Office Activities', description: 'Choose the activities you perform at work today.', action: 'next' },
  { id: 'lunch', title: 'Lunch Break', description: 'Choose one or more lunch items to eat at work.', action: 'next' },
  { id: 'shopping', title: 'Shopping', description: 'A random shopping event appears during your day. Choose what you buy.', action: 'next' },
  { id: 'dinner', title: 'Dinner', description: 'Choose how you cook and what you eat for dinner.', action: 'next' },
  { id: 'tv', title: 'Watch TV', description: 'Decide whether you watch TV in the evening.', action: 'next' },
  { id: 'waste', title: 'Waste Disposal', description: 'Choose how you dispose of waste at the end of the day.', action: 'next' },
  { id: 'sleep', title: 'Sleep', description: 'You end the day and prepare to see your carbon report.', action: 'finish' },
];

let currentStageIndex = 0;

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function renderOptionCard(option, inputHtml) {
  return `
    <label class="option-card">
      ${inputHtml}
      <div class="option-data">
        <strong>${option.label}</strong>
        <span>${option.detail}</span>
      </div>
    </label>
  `;
}

function parseDurationToSeconds(value) {
  if (!value) return 0;
  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function parseDurationToMinutes(value) {
  return parseDurationToSeconds(value) / 60;
}

function parseDurationToHours(value) {
  return parseDurationToSeconds(value) / 3600;
}

function renderStage() {
  const stage = stages[currentStageIndex];
  currentStepLabel.textContent = currentStageIndex + 1;
  totalStepLabel.textContent = stages.length;
  stageTitle.textContent = stage.title;
  stageDescription.textContent = stage.description;
  prevBtn.style.display = currentStageIndex === 0 ? 'none' : 'inline-flex';
  nextBtn.textContent = stage.action === 'finish' ? 'Finish Day' : 'Next';

  let content = '';

  switch (stage.id) {
    case 'wake':
      content = '<div class="field-group"><p>Welcome to a short, 2–3 minute day of choices and carbon tracking.</p></div>';
      break;
    case 'shower': {
      const options = [
        { value: 'cold', label: 'Cold Shower', detail: '0.05 kg CO₂e' },
        { value: 'hot', label: 'Hot Shower', detail: '0.80 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.shower === option.value ? 'checked' : '';
          return renderOptionCard(option, `<input type="radio" name="shower" value="${option.value}" ${checked} required>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'breakfast': {
      const options = [
        { name: 'toast', label: 'Toast', detail: '0.15 kg CO₂e' },
        { name: 'eggs', label: 'Eggs', detail: '0.40 kg CO₂e' },
        { name: 'coffee', label: 'Coffee', detail: '0.20 kg CO₂e' },
        { name: 'rice', label: 'Rice', detail: '0.60 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.breakfast[option.name] ? 'checked' : '';
          return renderOptionCard(option, `<input type="checkbox" name="${option.name}" value="on" ${checked}>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'appliances': {
      content = `<div class="field-group">
          <label>Fan Usage (hh:mm:ss)
            <input type="time" name="fanDuration" step="1" value="${state.appliances.fanDuration}" min="00:00:00" max="04:00:00">
            <span class="small">Each hour uses 0.05 kg CO₂e.</span>
          </label>
          <label>Light Usage (hh:mm:ss)
            <input type="time" name="lightDuration" step="1" value="${state.appliances.lightDuration}" min="00:00:00" max="04:00:00">
            <span class="small">Each hour uses 0.02 kg CO₂e.</span>
          </label>
          <label>Microwave Usage (hh:mm:ss)
            <input type="time" name="microwaveDuration" step="1" value="${state.appliances.microwaveDuration}" min="00:00:00" max="00:30:00">
            <span class="small">Each 10 minutes uses 0.12 kg CO₂e.</span>
          </label>
          <label>Kettle Usage (hh:mm:ss)
            <input type="time" name="kettleDuration" step="1" value="${state.appliances.kettleDuration}" min="00:00:00" max="00:30:00">
            <span class="small">Each 10 minutes uses 0.10 kg CO₂e.</span>
          </label>
        </div>`;
      break;
    }
    case 'commute': {
      const options = [
        { value: 'car', label: 'Car', detail: '2.50 kg CO₂e' },
        { value: 'bus', label: 'Public Bus', detail: '0.70 kg CO₂e' },
        { value: 'bike', label: 'Motorcycle / Bike', detail: '1.20 kg CO₂e' },
        { value: 'bicycle', label: 'Bicycle', detail: '0.00 kg CO₂e' },
        { value: 'walking', label: 'Walking', detail: '0.00 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.commute === option.value ? 'checked' : '';
          return renderOptionCard(option, `<input type="radio" name="commute" value="${option.value}" ${checked} required>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'office': {
      const options = [
        { name: 'computer', label: 'Office Computer Use', detail: '0.40 kg CO₂e' },
        { name: 'internet', label: 'Internet Use', detail: '0.20 kg CO₂e' },
        { name: 'coffee', label: 'One Cup Coffee', detail: '0.20 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.office[option.name] ? 'checked' : '';
          return renderOptionCard(option, `<input type="checkbox" name="${option.name}" value="on" ${checked}>`);
        })
        .join('')}</div></div>
        <div class="field-group">
          <label>Air Conditioner Use (hh:mm:ss)
            <input type="time" name="acDuration" step="1" value="${state.office.acDuration}" min="00:00:00" max="04:00:00">
            <span class="small">Each hour uses 0.60 kg CO₂e.</span>
          </label>
          <label>Heater Use (hh:mm:ss)
            <input type="time" name="heaterDuration" step="1" value="${state.office.heaterDuration}" min="00:00:00" max="04:00:00">
            <span class="small">Each hour uses 1.00 kg CO₂e.</span>
          </label>
          <label>Printing (pages)
            <input type="number" name="printingPages" min="0" step="5" value="${state.office.printingPages}" placeholder="0">
            <span class="small">Every 5 pages = 0.05 kg CO₂e</span>
          </label>
        </div>`;
      break;
    }
    case 'lunch': {
      const options = [
        { name: 'rice', label: 'Rice', detail: '0.60 kg CO₂e' },
        { name: 'chicken', label: 'Chicken', detail: '1.60 kg CO₂e' },
        { name: 'drink', label: 'Packaged Drink', detail: '0.30 kg CO₂e' },
        { name: 'vegetables', label: 'Vegetables', detail: '0.20 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.lunch[option.name] ? 'checked' : '';
          return renderOptionCard(option, `<input type="checkbox" name="${option.name}" value="on" ${checked}>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'shopping': {
      const options = [
        { value: 'none', label: 'No Purchase', detail: '0.00 kg CO₂e' },
        { value: 'sustainable', label: 'Sustainable Product', detail: '0.20 kg CO₂e' },
        { value: 'clothing', label: 'New Clothing', detail: '2.00 kg CO₂e' },
        { value: 'gadget', label: 'Electronic Gadget', detail: '15.00 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.shopping === option.value ? 'checked' : '';
          return renderOptionCard(option, `<input type="radio" name="shopping" value="${option.value}" ${checked} required>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'dinner': {
      const cookingOptions = [
        { value: 'home', label: 'Home Cooking', detail: '0.50 kg CO₂e' },
        { value: 'electric', label: 'Electric Cooking', detail: '0.80 kg CO₂e' },
        { value: 'gas', label: 'Gas Cooking', detail: '1.00 kg CO₂e' },
      ];
      const foodOptions = [
        { name: 'vegetables', label: 'Vegetables', detail: '0.30 kg CO₂e' },
        { name: 'rice', label: 'Rice', detail: '0.60 kg CO₂e' },
        { name: 'chicken', label: 'Chicken', detail: '1.60 kg CO₂e' },
        { name: 'packaged', label: 'Packaged Food', detail: '2.00 kg CO₂e' },
      ];
      content = `<div class="option-group"><div class="option-row">${cookingOptions
        .map((option) => {
          const checked = state.dinner.cooking === option.value ? 'checked' : '';
          return renderOptionCard(option, `<input type="radio" name="dinnerCooking" value="${option.value}" ${checked} required>`);
        })
        .join('')}</div></div>
        <div class="option-group"><div class="option-row">${foodOptions
          .map((option) => {
            const checked = state.dinner.food[option.name] ? 'checked' : '';
            return renderOptionCard(option, `<input type="checkbox" name="${option.name}" value="on" ${checked}>`);
          })
          .join('')}</div></div>`;
      break;
    }
    case 'tv': {
      content = `<div class="field-group">
          <label>TV Watching (hh:mm:ss)
            <input type="time" name="tvDuration" step="1" value="${state.tvDuration}" min="00:00:00" max="04:00:00">
            <span class="small">Each hour of TV adds 0.08 kg CO₂e.</span>
          </label>
        </div>`;
      break;
    }
    case 'waste': {
      const packagedCount = Number(state.lunch.drink) + Number(state.dinner.food.packaged);
      const suggestion = packagedCount > 0 ? 'We recommend properly segregated waste to reduce the carbon impact of packaged goods.' : 'Properly segregated waste is the best choice after a low-packaged day.';
      const options = [
        { value: 'segregated', label: 'Properly Segregated Waste', detail: '0.10 kg CO₂e' },
        { value: 'mixed', label: 'Mixed Waste', detail: '0.50 kg CO₂e' },
        { value: 'excess', label: 'Excess Food Waste', detail: '1.00 kg CO₂e' },
      ];
      content = `<div class="field-group"><p>${suggestion}</p></div><div class="option-group"><div class="option-row">${options
        .map((option) => {
          const checked = state.waste === option.value ? 'checked' : '';
          return renderOptionCard(option, `<input type="radio" name="waste" value="${option.value}" ${checked} required>`);
        })
        .join('')}</div></div>`;
      break;
    }
    case 'sleep':
      content = '<div class="field-group"><p>Great job! You are ready to end the day and see how your choices affected your carbon footprint.</p></div>';
      break;
    default:
      content = '<div class="field-group"><p>Use the controls below to navigate through the day.</p></div>';
  }

  stageForm.innerHTML = content;
}

function readStageValues() {
  const stage = stages[currentStageIndex];
  const form = new FormData(stageForm);
  switch (stage.id) {
    case 'shower':
      state.shower = form.get('shower') || state.shower;
      break;
    case 'breakfast':
      Object.keys(state.breakfast).forEach((name) => {
        state.breakfast[name] = stageForm.querySelector(`input[name="${name}"]`).checked;
      });
      break;
    case 'appliances':
      state.appliances.fanDuration = form.get('fanDuration') || state.appliances.fanDuration;
      state.appliances.lightDuration = form.get('lightDuration') || state.appliances.lightDuration;
      state.appliances.microwaveDuration = form.get('microwaveDuration') || state.appliances.microwaveDuration;
      state.appliances.kettleDuration = form.get('kettleDuration') || state.appliances.kettleDuration;
      break;
    case 'commute':
      state.commute = form.get('commute') || state.commute;
      break;
    case 'office':
      state.office.computer = stageForm.querySelector('input[name="computer"]').checked;
      state.office.internet = stageForm.querySelector('input[name="internet"]').checked;
      state.office.coffee = stageForm.querySelector('input[name="coffee"]').checked;
      state.office.acDuration = form.get('acDuration') || state.office.acDuration;
      state.office.heaterDuration = form.get('heaterDuration') || state.office.heaterDuration;
      state.office.printingPages = Number(form.get('printingPages') || 0);
      break;
    case 'lunch':
      Object.keys(state.lunch).forEach((name) => {
        state.lunch[name] = stageForm.querySelector(`input[name="${name}"]`).checked;
      });
      break;
    case 'shopping':
      state.shopping = form.get('shopping') || state.shopping;
      break;
    case 'dinner':
      state.dinner.cooking = form.get('dinnerCooking') || state.dinner.cooking;
      Object.keys(state.dinner.food).forEach((name) => {
        state.dinner.food[name] = stageForm.querySelector(`input[name="${name}"]`).checked;
      });
      break;
    case 'tv':
      state.tvDuration = form.get('tvDuration') || state.tvDuration;
      break;
    case 'waste':
      state.waste = form.get('waste') || state.waste;
      break;
    default:
      break;
  }
}

function computeTotals() {
  const breakfastTotal = Object.entries(state.breakfast).reduce((sum, [key, checked]) => {
    return sum + (checked ? values.breakfast[key] : 0);
  }, 0);
  const appliancesTotal = parseDurationToHours(state.appliances.fanDuration) * values.appliances.fan
    + parseDurationToHours(state.appliances.lightDuration) * values.appliances.light
    + (parseDurationToMinutes(state.appliances.microwaveDuration) / 10) * values.appliances.microwave
    + (parseDurationToMinutes(state.appliances.kettleDuration) / 10) * values.appliances.kettle;
  const officeTotal = (state.office.computer ? values.office.computer : 0)
    + (state.office.internet ? values.office.internet : 0)
    + (state.office.coffee ? values.office.coffee : 0)
    + state.office.acHours * values.office.ac
    + state.office.heaterHours * values.office.heater
    + Math.floor(state.office.printingPages / 5) * values.office.printingPer5;
  const lunchTotal = Object.entries(state.lunch).reduce((sum, [key, checked]) => {
    return sum + (checked ? values.lunch[key] : 0);
  }, 0);
  const dinnerFoodTotal = Object.entries(state.dinner.food).reduce((sum, [key, checked]) => {
    return sum + (checked ? values.dinnerFood[key] : 0);
  }, 0);
  const wasteTotal = values.waste[state.waste] || 0;

  return {
    shower: values.shower[state.shower],
    breakfast: breakfastTotal,
    appliances: appliancesTotal,
    commute: values.commute[state.commute],
    office: officeTotal,
    lunch: lunchTotal,
    shopping: values.shopping[state.shopping],
    dinner: values.dinnerCooking[state.dinner.cooking] + dinnerFoodTotal,
    tv: parseDurationToHours(state.tvDuration) * values.tv,
    waste: wasteTotal,
  };
}

function getEnding(total) {
  if (total <= 8) {
    const title = state.character === 'female' ? 'Green Woman' : 'Green Man';
    return {
      title,
      message: 'Excellent! Your choices helped reduce environmental impact and promote sustainable living.',
    };
  }
  if (total <= 15) {
    return {
      title: 'Eco Learner',
      message: 'Good effort! You understand sustainability, but there is still room for improvement.',
    };
  }
  return {
    title: 'Carbon Lover',
    message: 'Your lifestyle generated a high carbon footprint today. Try greener alternatives next time.',
  };
}

function renderReport() {
  const totals = computeTotals();
  const totalValue = Object.values(totals).reduce((sum, value) => sum + value, 0);
  reportBreakdown.innerHTML = Object.entries(totals)
    .map(([label, value]) => {
      const labelText = label
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      return `<div class="report-item"><span>${labelText}</span><strong>${value.toFixed(2)} kg</strong></div>`;
    })
    .join('');
  reportTotal.textContent = `${totalValue.toFixed(2)} kg`;
  const ending = getEnding(totalValue);
  endingMessage.innerHTML = `<strong>${ending.title}</strong><p>${ending.message}</p>`;
}

function goToStage(index) {
  currentStageIndex = Math.min(Math.max(index, 0), stages.length - 1);
  renderStage();
}

function nextStage() {
  if (currentStageIndex < stages.length - 1) {
    readStageValues();
    goToStage(currentStageIndex + 1);
  } else {
    readStageValues();
    renderReport();
    showScreen('report');
  }
}

function prevStage() {
  if (currentStageIndex > 0) {
    goToStage(currentStageIndex - 1);
  }
}

function setupEventListeners() {
  document.querySelectorAll('.character-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.character = button.dataset.character;
      showScreen('stage');
      goToStage(0);
    });
  });
  prevBtn.addEventListener('click', (event) => {
    event.preventDefault();
    prevStage();
  });
  nextBtn.addEventListener('click', (event) => {
    event.preventDefault();
    nextStage();
  });
  restartBtn.addEventListener('click', () => {
    showScreen('start');
    goToStage(0);
  });
}

setupEventListeners();
renderStage();
showScreen('start');
