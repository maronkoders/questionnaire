class SurveyStorageService {
  static KEYS = {
    STEP_DATA: 'step',
    PART_DATA: 'part', 
    RESPONSE: 'survey_response_',
    FORM_DATA: 'surveyFormData'
  };

  static saveStepData(stepNumber, data) {
    const enrichedData = this.enrichData(data);
    localStorage.setItem(`${this.KEYS.STEP_DATA}${stepNumber}Data`, JSON.stringify(enrichedData));
  }

  static savePartData(partNumber, data) {
    const enrichedData = this.enrichData(data);
    localStorage.setItem(`${this.KEYS.PART_DATA}${partNumber}Data`, JSON.stringify(enrichedData));
  }

  static saveSurveyResponse(data) {
    const responseId = `${this.KEYS.RESPONSE}${Date.now()}`;
    const enrichedData = this.enrichData(data);
    localStorage.setItem(responseId, JSON.stringify(enrichedData));
    return responseId;
  }

  static getStepData(stepNumber) {
    return JSON.parse(localStorage.getItem(`${this.KEYS.STEP_DATA}${stepNumber}Data`));
  }

  static getAllResponses() {
    const responses = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.KEYS.RESPONSE)) {
        try {
          const response = JSON.parse(localStorage.getItem(key));
          responses.push({
            id: key,
            ...response,
            source: 'local'
          });
        } catch (e) {
          console.error('Error parsing local storage item:', e);
        }
      }
    }
    return responses;
  }

  static enrichData(data) {
    return {
      ...data,
      userAgent: navigator.userAgent,
      uniqueId: `user_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static clearSurveyData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.KEYS.STEP_DATA) || 
          key.startsWith(this.KEYS.PART_DATA) || 
          key.startsWith(this.KEYS.RESPONSE)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  static saveCurrentStepData(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const inputs = step.querySelectorAll('input, select, textarea');
    const stepData = {};

    inputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        if (input.checked) {
          stepData[input.name] = input.value;
        }
      } else {
        stepData[input.name] = input.value;
      }
    });

    this.saveStepData(stepNumber, stepData);
  }

  static loadCurrentStepData(stepNumber) {
    const savedData = this.getStepData(stepNumber);
    if (savedData) {
      const step = document.getElementById(`step${stepNumber}`);
      const inputs = step.querySelectorAll('input, select, textarea');

      inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
          input.checked = savedData[input.name] === input.value;
        } else {
          input.value = savedData[input.name] || '';
        }
      });
    }
  }
}