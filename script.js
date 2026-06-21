/**
 * Carbon Footprint Simulator - Main Application
 * Secure, efficient, and well-structured game logic
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  maxDuration: { hours: 4, minutes: 30, seconds: 0 },
  printingPageStep: 5,
  decimalPlaces: 2,
};

const CARBON_VALUES = {
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

const ENDINGS = {
  greenHero: (isFemale) => ({
    title: isFemale ? 'Green Woman' : 'Green Man',
    message: 'Excellent! Your choices helped reduce environmental impact and promote sustainable living.',
    threshold: 8,
  }),
  ecoLearner: {
    title: 'Eco Learner',
    message: 'Good effort! You understand sustainability, but there is still room for improvement.',
    threshold: 15,
  },
  carbonLover: {
    title: 'Carbon Lover',
    message: 'Your lifestyle generated a high carbon footprint today. Try greener alternatives next time.',
    threshold: Infinity,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML-safe text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Parse time duration string (hh:mm:ss) to total seconds
 * @param {string} value - Time string in format hh:mm:ss
 * @returns {number} Total seconds
 */
function parseDurationToSeconds(value) {
  if (!value || typeof value !== 'string') return 0;
  
  try {
    const parts = value.split(':').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 0;
    
    const [hours, minutes, seconds] = parts;
    // Validate ranges
    if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  } catch (e) {
    console.warn('Invalid duration format:', value);
    return 0;
  }
}

/**
 * Parse duration to minutes
 * @param {string} value - Time string in format hh:mm:ss
 * @returns {number} Total minutes
 */
function parseDurationToMinutes(value) {
  return parseDurationToSeconds(value) / 60;
}

/**
 * Parse duration to hours
 * @param {string} value - Time string in format hh:mm:ss
 * @returns {number} Total hours
 */
function parseDurationToHours(value) {
  return parseDurationToSeconds(value) / 3600;
}

/**
 * Safely get form value with validation
 * @param {FormData} form - Form data object
 * @param {string} name - Field name
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Form value or default
 */
function getSafeFormValue(form, name, defaultValue) {
  try {
    const value = form.get(name);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.warn(`Failed to get form value for ${name}:`, e);
    return defaultValue;
  }
}

/**
 * Validate and sanitize numeric input
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} defaultValue - Default if invalid
 * @returns {number} Validated number
 */
function validateNumber(value, min = 0, max = Infinity, defaultValue = 0) {
  const num = Number(value);
  if (isNaN(num)) return defaultValue;
  return Math.min(Math.max(num, min), max);
}

/**
 * Format label text from camelCase
 * @param {string} text - Text to format
 * @returns {string} Formatted label
 */
function formatLabel(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
}

// ============================================================================
// DOM CACHE & STATE MANAGEMENT
// ============================================================================

const DOM = {
  screens: {
    start: document.getElementById('screen-start'),
    stage: document.getElementById('screen-stage'),
    report: document.getElementById('screen-report'),
  },
  labels: {
    currentStep: document.getElementById('current-step'),
    totalSteps: document.getElementById('total-step'),
    stageTitle: document.getElementById('stage-title'),
    stageDescription: document.getElementById('stage-description'),
  },
  elements: {
    stageForm: document.getElementById('stage-form'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    reportBreakdown: document.getElementById('report-breakdown'),
    reportTotal: document.getElementById('report-total'),
    endingMessage: document.getElementById('ending-message'),
    restartBtn: document.getElementById('restart-btn'),
  },
};

// Validate all required DOM elements exist
function validateDOM() {
  const allElements = { ...DOM.screens, ...DOM.labels, ...DOM.elements };
  for (const [key, el] of Object.entries(allElements)) {
    if (!el) {
      throw new Error(`Missing required DOM element: ${key}`);
    }
  }
}

const INITIAL_STATE = {
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

let appState = { ...INITIAL_STATE };
let currentStageIndex = 0;
let cachedTotals = null;

const STAGES = [
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

// ============================================================================
// UI RENDERING HELPERS
// ============================================================================

/**
 * Create a reusable option card with proper HTML escaping
 * @param {object} option - Option object with label and detail
 * @param {string} inputHtml - Raw HTML for input element
 * @returns {string} Safe HTML string
 */
function createOptionCard(option, inputHtml) {
  const label = escapeHtml(option.label);
  const detail = escapeHtml(option.detail);
  return `
    <label class="option-card">
      ${inputHtml}
      <div class="option-data">
        <strong>${label}</strong>
        <span>${detail}</span>
      </div>
    </label>
  `;
}

/**
 * Create radio or checkbox inputs for multiple options
 * @param {array} options - Options array
 * @param {string} type - Input type (radio or checkbox)
 * @param {string} currentValue - Currently selected value(s)
 * @returns {string} Safe HTML string
 */
function createInputOptions(options, type, currentValue, groupName = '') {
  return options
    .map((option) => {
      const value = escapeHtml(option.value || option.name);
      const inputName = type === 'radio' ? escapeHtml(groupName || option.name || 'option') : escapeHtml(option.name || value || 'option');
      const checked = type === 'radio'
        ? (currentValue === value ? 'checked' : '')
        : (currentValue[value] ? 'checked' : '');

      const inputHtml = `<input type="${type}" name="${inputName}" value="${value}" ${checked} ${type === 'radio' ? 'required' : ''}>`;
      return createOptionCard(option, inputHtml);
    })
    .join('');
}

/**
 * Create a time input field with label
 * @param {string} label - Field label
 * @param {string} name - Input name attribute
 * @param {string} value - Current value
 * @param {string} hint - Help text
 * @returns {string} Safe HTML string
 */
function createTimeInput(label, name, value, hint = '') {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  const safeHint = escapeHtml(hint);
  return `
    <label>${safeLabel}
      <input type="time" name="${escapeHtml(name)}" step="1" value="${safeValue}" min="00:00:00" max="04:00:00">
      ${safeHint ? `<span class="small">${safeHint}</span>` : ''}
    </label>
  `;
}

/**
 * Create a number input field with label
 * @param {string} label - Field label
 * @param {string} name - Input name attribute
 * @param {number} value - Current value
 * @param {object} options - Input options
 * @returns {string} Safe HTML string
 */
function createNumberInput(label, name, value, options = {}) {
  const safeLabel = escapeHtml(label);
  const min = validateNumber(options.min, 0);
  const step = validateNumber(options.step, 1);
  const safeHint = options.hint ? escapeHtml(options.hint) : '';
  
  return `
    <label>${safeLabel}
      <input type="number" name="${escapeHtml(name)}" min="${min}" step="${step}" value="${value}" placeholder="0">
      ${safeHint ? `<span class="small">${safeHint}</span>` : ''}
    </label>
  `;
}

// ============================================================================
// STAGE RENDERING
// ============================================================================

/**
 * Render the current stage based on stage ID
 */
function renderStage() {
  const stage = STAGES[currentStageIndex];
  if (!stage) {
    console.error('Invalid stage index:', currentStageIndex);
    return;
  }

  // Update UI labels
  DOM.labels.currentStep.textContent = String(currentStageIndex + 1);
  DOM.labels.totalSteps.textContent = String(STAGES.length);
  DOM.labels.stageTitle.textContent = escapeHtml(stage.title);
  DOM.labels.stageDescription.textContent = escapeHtml(stage.description);
  
  // Update button visibility
  DOM.elements.prevBtn.style.display = currentStageIndex === 0 ? 'none' : 'inline-flex';
  DOM.elements.nextBtn.textContent = stage.action === 'finish' ? 'Finish Day' : 'Next';

  // Clear cache when rendering new stage
  cachedTotals = null;

  // Render stage-specific content
  let content = '';
  try {
    content = renderStageContent(stage);
  } catch (e) {
    console.error('Error rendering stage content:', e);
    content = '<div class="field-group"><p>Error loading stage. Please refresh the page.</p></div>';
  }

  // Use textContent for safety, then add safe HTML afterward
  DOM.elements.stageForm.innerHTML = content;
}

/**
 * Render content for a specific stage
 * @param {object} stage - Stage configuration
 * @returns {string} Safe HTML string
 */
function renderStageContent(stage) {
  switch (stage.id) {
    case 'wake':
      return '<div class="field-group"><p>Welcome to a short, 2–3 minute day of choices and carbon tracking.</p></div>';

    case 'shower': {
      const options = [
        { value: 'cold', label: 'Cold Shower', detail: '0.05 kg CO₂e' },
        { value: 'hot', label: 'Hot Shower', detail: '0.80 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'radio', appState.shower, 'shower');
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>`;
    }

    case 'breakfast': {
      const options = [
        { name: 'toast', label: 'Toast', detail: '0.15 kg CO₂e' },
        { name: 'eggs', label: 'Eggs', detail: '0.40 kg CO₂e' },
        { name: 'coffee', label: 'Coffee', detail: '0.20 kg CO₂e' },
        { name: 'rice', label: 'Rice', detail: '0.60 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'checkbox', appState.breakfast);
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>`;
    }

    case 'appliances': {
      const durations = appState.appliances;
      return `<div class="field-group">
        ${createTimeInput('Fan Usage (hh:mm:ss)', 'fanDuration', durations.fanDuration, 'Each hour uses 0.05 kg CO₂e.')}
        ${createTimeInput('Light Usage (hh:mm:ss)', 'lightDuration', durations.lightDuration, 'Each hour uses 0.02 kg CO₂e.')}
        ${createTimeInput('Microwave Usage (hh:mm:ss)', 'microwaveDuration', durations.microwaveDuration, 'Each 10 minutes uses 0.12 kg CO₂e.')}
        ${createTimeInput('Kettle Usage (hh:mm:ss)', 'kettleDuration', durations.kettleDuration, 'Each 10 minutes uses 0.10 kg CO₂e.')}
      </div>`;
    }

    case 'commute': {
      const options = [
        { value: 'car', label: 'Car', detail: '2.50 kg CO₂e' },
        { value: 'bus', label: 'Public Bus', detail: '0.70 kg CO₂e' },
        { value: 'bike', label: 'Motorcycle / Bike', detail: '1.20 kg CO₂e' },
        { value: 'bicycle', label: 'Bicycle', detail: '0.00 kg CO₂e' },
        { value: 'walking', label: 'Walking', detail: '0.00 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'radio', appState.commute, 'commute');
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>`;
    }

    case 'office': {
      const checkboxOptions = [
        { name: 'computer', label: 'Office Computer Use', detail: '0.40 kg CO₂e' },
        { name: 'internet', label: 'Internet Use', detail: '0.20 kg CO₂e' },
        { name: 'coffee', label: 'One Cup Coffee', detail: '0.20 kg CO₂e' },
      ];
      const inputs = createInputOptions(checkboxOptions, 'checkbox', appState.office);
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>
        <div class="field-group">
          ${createTimeInput('Air Conditioner Use (hh:mm:ss)', 'acDuration', appState.office.acDuration, 'Each hour uses 0.60 kg CO₂e.')}
          ${createTimeInput('Heater Use (hh:mm:ss)', 'heaterDuration', appState.office.heaterDuration, 'Each hour uses 1.00 kg CO₂e.')}
          ${createNumberInput('Printing (pages)', 'printingPages', appState.office.printingPages, { min: 0, step: 5, hint: 'Every 5 pages = 0.05 kg CO₂e' })}
        </div>`;
    }

    case 'lunch': {
      const options = [
        { name: 'rice', label: 'Rice', detail: '0.60 kg CO₂e' },
        { name: 'chicken', label: 'Chicken', detail: '1.60 kg CO₂e' },
        { name: 'drink', label: 'Packaged Drink', detail: '0.30 kg CO₂e' },
        { name: 'vegetables', label: 'Vegetables', detail: '0.20 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'checkbox', appState.lunch);
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>`;
    }

    case 'shopping': {
      const options = [
        { value: 'none', label: 'No Purchase', detail: '0.00 kg CO₂e' },
        { value: 'sustainable', label: 'Sustainable Product', detail: '0.20 kg CO₂e' },
        { value: 'clothing', label: 'New Clothing', detail: '2.00 kg CO₂e' },
        { value: 'gadget', label: 'Electronic Gadget', detail: '15.00 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'radio', appState.shopping, 'shopping');
      return `<div class="option-group"><div class="option-row">${inputs}</div></div>`;
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
      const cookingInputs = createInputOptions(cookingOptions, 'radio', appState.dinner.cooking, 'dinnerCooking');
      const foodInputs = createInputOptions(foodOptions, 'checkbox', appState.dinner.food);
      return `<div class="option-group"><div class="option-row">${cookingInputs}</div></div>
        <div class="option-group"><div class="option-row">${foodInputs}</div></div>`;
    }

    case 'tv': {
      return `<div class="field-group">
        ${createTimeInput('TV Watching (hh:mm:ss)', 'tvDuration', appState.tvDuration, 'Each hour of TV adds 0.08 kg CO₂e.')}
      </div>`;
    }

    case 'waste': {
      const hasPackaged = appState.lunch.drink || appState.dinner.food.packaged;
      const suggestion = hasPackaged 
        ? 'We recommend properly segregated waste to reduce the carbon impact of packaged goods.'
        : 'Properly segregated waste is the best choice after a low-packaged day.';
      
      const options = [
        { value: 'segregated', label: 'Properly Segregated Waste', detail: '0.10 kg CO₂e' },
        { value: 'mixed', label: 'Mixed Waste', detail: '0.50 kg CO₂e' },
        { value: 'excess', label: 'Excess Food Waste', detail: '1.00 kg CO₂e' },
      ];
      const inputs = createInputOptions(options, 'radio', appState.waste);
      return `<div class="field-group"><p>${escapeHtml(suggestion)}</p></div>
        <div class="option-group"><div class="option-row">${inputs}</div></div>`;
    }

    case 'sleep':
      return '<div class="field-group"><p>Great job! You are ready to end the day and see how your choices affected your carbon footprint.</p></div>';

    default:
      return '<div class="field-group"><p>Use the controls below to navigate through the day.</p></div>';
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Read and validate form values for the current stage
 */
function readStageValues() {
  const stage = STAGES[currentStageIndex];
  if (!stage) return;

  const form = new FormData(DOM.elements.stageForm);

  try {
    switch (stage.id) {
      case 'shower':
        appState.shower = getSafeFormValue(form, 'shower', appState.shower);
        break;

      case 'breakfast':
        Object.keys(appState.breakfast).forEach((name) => {
          const el = DOM.elements.stageForm.querySelector(`input[name="${escapeHtml(name)}"]`);
          if (el) appState.breakfast[name] = el.checked;
        });
        break;

      case 'appliances':
        appState.appliances.fanDuration = getSafeFormValue(form, 'fanDuration', appState.appliances.fanDuration);
        appState.appliances.lightDuration = getSafeFormValue(form, 'lightDuration', appState.appliances.lightDuration);
        appState.appliances.microwaveDuration = getSafeFormValue(form, 'microwaveDuration', appState.appliances.microwaveDuration);
        appState.appliances.kettleDuration = getSafeFormValue(form, 'kettleDuration', appState.appliances.kettleDuration);
        break;

      case 'commute':
        appState.commute = getSafeFormValue(form, 'commute', appState.commute);
        break;

      case 'office':
        appState.office.computer = DOM.elements.stageForm.querySelector('input[name="computer"]')?.checked || false;
        appState.office.internet = DOM.elements.stageForm.querySelector('input[name="internet"]')?.checked || false;
        appState.office.coffee = DOM.elements.stageForm.querySelector('input[name="coffee"]')?.checked || false;
        appState.office.acDuration = getSafeFormValue(form, 'acDuration', appState.office.acDuration);
        appState.office.heaterDuration = getSafeFormValue(form, 'heaterDuration', appState.office.heaterDuration);
        appState.office.printingPages = validateNumber(getSafeFormValue(form, 'printingPages', 0), 0, 1000);
        break;

      case 'lunch':
        Object.keys(appState.lunch).forEach((name) => {
          const el = DOM.elements.stageForm.querySelector(`input[name="${escapeHtml(name)}"]`);
          if (el) appState.lunch[name] = el.checked;
        });
        break;

      case 'shopping':
        appState.shopping = getSafeFormValue(form, 'shopping', appState.shopping);
        break;

      case 'dinner':
        appState.dinner.cooking = getSafeFormValue(form, 'dinnerCooking', appState.dinner.cooking);
        Object.keys(appState.dinner.food).forEach((name) => {
          const el = DOM.elements.stageForm.querySelector(`input[name="${escapeHtml(name)}"]`);
          if (el) appState.dinner.food[name] = el.checked;
        });
        break;

      case 'tv':
        appState.tvDuration = getSafeFormValue(form, 'tvDuration', appState.tvDuration);
        break;

      case 'waste':
        appState.waste = getSafeFormValue(form, 'waste', appState.waste);
        break;

      default:
        break;
    }

    // Invalidate cache when state changes
    cachedTotals = null;
  } catch (e) {
    console.error('Error reading stage values:', e);
  }
}

// ============================================================================
// CARBON CALCULATION
// ============================================================================

/**
 * Calculate category totals safely
 */
function computeTotals() {
  // Use cached value if available
  if (cachedTotals) return cachedTotals;

  try {
    const totals = {
      shower: CARBON_VALUES.shower[appState.shower] || 0,
      breakfast: sumBooleanValues(appState.breakfast, CARBON_VALUES.breakfast),
      appliances:
        parseDurationToHours(appState.appliances.fanDuration) * CARBON_VALUES.appliances.fan +
        parseDurationToHours(appState.appliances.lightDuration) * CARBON_VALUES.appliances.light +
        (parseDurationToMinutes(appState.appliances.microwaveDuration) / 10) * CARBON_VALUES.appliances.microwave +
        (parseDurationToMinutes(appState.appliances.kettleDuration) / 10) * CARBON_VALUES.appliances.kettle,
      commute: CARBON_VALUES.commute[appState.commute] || 0,
      office:
        (appState.office.computer ? CARBON_VALUES.office.computer : 0) +
        (appState.office.internet ? CARBON_VALUES.office.internet : 0) +
        (appState.office.coffee ? CARBON_VALUES.office.coffee : 0) +
        parseDurationToHours(appState.office.acDuration) * CARBON_VALUES.office.ac +
        parseDurationToHours(appState.office.heaterDuration) * CARBON_VALUES.office.heater +
        Math.floor(appState.office.printingPages / CONFIG.printingPageStep) * CARBON_VALUES.office.printingPer5,
      lunch: sumBooleanValues(appState.lunch, CARBON_VALUES.lunch),
      shopping: CARBON_VALUES.shopping[appState.shopping] || 0,
      dinner:
        (CARBON_VALUES.dinnerCooking[appState.dinner.cooking] || 0) +
        sumBooleanValues(appState.dinner.food, CARBON_VALUES.dinnerFood),
      tv: parseDurationToHours(appState.tvDuration) * CARBON_VALUES.tv,
      waste: CARBON_VALUES.waste[appState.waste] || 0,
    };

    // Validate all values are numbers
    Object.entries(totals).forEach(([key, value]) => {
      if (typeof value !== 'number' || isNaN(value)) {
        console.warn(`Invalid total for ${key}:`, value);
        totals[key] = 0;
      }
    });

    cachedTotals = totals;
    return totals;
  } catch (e) {
    console.error('Error computing totals:', e);
    return Object.fromEntries(Object.keys(computeTotals.stub || {}).map((key) => [key, 0]));
  }
}

// Stub for error handling
computeTotals.stub = CARBON_VALUES;

/**
 * Sum up boolean-selected values
 * @param {object} selection - Boolean object
 * @param {object} values - Carbon value map
 * @returns {number} Total carbon value
 */
function sumBooleanValues(selection, values) {
  return Object.entries(selection).reduce((sum, [key, checked]) => {
    return sum + (checked && values[key] ? values[key] : 0);
  }, 0);
}

// ============================================================================
// REPORTING & ENDINGS
// ============================================================================

/**
 * Determine ending based on total carbon footprint
 * @param {number} total - Total CO2e in kg
 * @returns {object} Ending info with title and message
 */
function getEnding(total) {
  try {
    const hero = ENDINGS.greenHero(appState.character === 'female');
    if (total <= hero.threshold) return hero;
    if (total <= ENDINGS.ecoLearner.threshold) return ENDINGS.ecoLearner;
    return ENDINGS.carbonLover;
  } catch (e) {
    console.error('Error determining ending:', e);
    return { title: 'Error', message: 'Unable to calculate results.' };
  }
}

/**
 * Render the final carbon report
 */
function renderReport() {
  try {
    const totals = computeTotals();
    const totalValue = Object.values(totals).reduce((sum, val) => sum + (val || 0), 0);

    // Build report breakdown
    const reportHtml = Object.entries(totals)
      .map(([label, value]) => {
        const safeLabel = escapeHtml(formatLabel(label));
        const safeValue = parseFloat(value).toFixed(CONFIG.decimalPlaces);
        return `<div class="report-item"><span>${safeLabel}</span><strong>${safeValue} kg</strong></div>`;
      })
      .join('');

    DOM.elements.reportBreakdown.innerHTML = reportHtml;
    DOM.elements.reportTotal.textContent = `${totalValue.toFixed(CONFIG.decimalPlaces)} kg`;

    // Get and display ending
    const ending = getEnding(totalValue);
    const endingHtml = `<strong>${escapeHtml(ending.title)}</strong><p>${escapeHtml(ending.message)}</p>`;
    DOM.elements.endingMessage.innerHTML = endingHtml;
  } catch (e) {
    console.error('Error rendering report:', e);
    DOM.elements.endingMessage.innerHTML = '<strong>Error</strong><p>Unable to generate report. Please refresh the page.</p>';
  }
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Show a specific screen
 * @param {string} name - Screen name
 */
function showScreen(name) {
  if (!DOM.screens[name]) {
    console.error('Unknown screen:', name);
    return;
  }

  Object.values(DOM.screens).forEach((screen) => screen.classList.remove('active'));
  DOM.screens[name].classList.add('active');
}

/**
 * Navigate to a specific stage
 * @param {number} index - Stage index
 */
function goToStage(index) {
  currentStageIndex = Math.min(Math.max(index, 0), STAGES.length - 1);
  renderStage();
}

/**
 * Move to next stage or finish
 */
function nextStage() {
  readStageValues();

  if (currentStageIndex < STAGES.length - 1) {
    goToStage(currentStageIndex + 1);
  } else {
    renderReport();
    showScreen('report');
  }
}

/**
 * Move to previous stage
 */
function prevStage() {
  if (currentStageIndex > 0) {
    goToStage(currentStageIndex - 1);
  }
}

/**
 * Reset game to initial state
 */
function resetGame() {
  appState = JSON.parse(JSON.stringify(INITIAL_STATE));
  currentStageIndex = 0;
  cachedTotals = null;
  showScreen('start');
}

// ============================================================================
// EVENT HANDLING & INITIALIZATION
// ============================================================================

/**
 * Initialize event listeners for the entire application
 */
function setupEventListeners() {
  try {
    // Character selection
    document.querySelectorAll('.character-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const character = button.dataset.character;
        if (!character) {
          console.error('Character button missing data-character');
          return;
        }
        appState.character = character;
        showScreen('stage');
        goToStage(0);
      });
    });

    // Navigation buttons
    DOM.elements.prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevStage();
    });

    DOM.elements.nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextStage();
    });

    DOM.elements.restartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetGame();
    });
  } catch (e) {
    console.error('Error setting up event listeners:', e);
  }
}

/**
 * Initialize the application
 */
function initializeApp() {
  try {
    validateDOM();
    setupEventListeners();
    renderStage();
    showScreen('start');
    console.log('Carbon Footprint Simulator initialized successfully');
  } catch (e) {
    console.error('Failed to initialize application:', e);
    document.body.innerHTML = '<p style="padding: 20px; color: red;">Failed to load application. Please refresh the page.</p>';
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
