let currentPart = 1;
const totalParts = 7;
let currentSection = 4; // Start at section 4 for emotional intelligence assessment

// Initialize form data from localStorage or empty object
let formData = JSON.parse(localStorage.getItem('surveyFormData')) || {};

// Navigation functions
function showStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index + 1 !== stepNumber);
        step.classList.toggle('active', index + 1 === stepNumber);
    });
}

function showPart(part) {
    // Hide all parts
    for (let i = 1; i <= totalParts; i++) {
        const partElement = document.getElementById(`part${i}`);
        if (partElement) {
            partElement.classList.add('hidden');
        }
    }
    
    // Show current part
    const currentPartElement = document.getElementById(`part${part}`);
    if (currentPartElement) {
        currentPartElement.classList.remove('hidden');
    }
    
    // Show/hide submit button on last part
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.style.display = (part === totalParts) ? 'block' : 'none';
    }
}

function showNextPart() {
    if (currentPart < totalParts) {
        saveCurrentStepPartData(currentPart);
        currentPart++;
        showPart(currentPart);
        toggleButtons();
    }
}

function showPreviousPart() {
    if (currentPart > 1) {
        currentPart--;
        showPart(currentPart);
    } else {
        // If we're at the first part of section 4, go back to section 3
        const emotionalAssessment = document.getElementById('emotionalAssessment');
        const step3 = document.getElementById('step3');

        if (emotionalAssessment && step3) {
            emotionalAssessment.classList.add('hidden');
            step3.classList.remove('hidden');
            currentSection = 3;
        }
    }
}

// Save form data to localStorage
function saveToLocalStorage(data) {
    localStorage.setItem('surveyFormData', JSON.stringify(data));
}

// Handle CPA membership response
function handleCPAMembershipResponse(value) {
    const nextToStep2 = document.getElementById('nextToStep2');
    const nonMemberMessage = document.getElementById('nonMemberMessage');
    const surveyForm = document.getElementById('surveyForm'); // Get form reference

    if (value === 'no') {
        nonMemberMessage.classList.remove('hidden');
        nextToStep2.disabled = true;

        const responseData = {
            cpa_member: 'no',
            submitted_at: new Date().toISOString(),
            status: 'non_member'
        };

        const responseId = `survey_response_${Date.now()}`;
        localStorage.setItem(responseId, JSON.stringify(responseData));

        fetch('/api/submit-assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responseData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Server response was not ok');
            setTimeout(() => {
                alert('Thank you for your interest. This survey is only for CPA members.');
                nonMemberMessage.classList.add('hidden');
                // Close the tab after a brief delay
                setTimeout(() => {
                    window.close();
                }, 500);
            }, 1000);
        })
        .catch(error => {
            console.error('Error submitting response:', error);
            alert('Error submitting response. Please try again.');
        });
    } else if (value === 'yes') {
        nextToStep2.disabled = false;
        nonMemberMessage.classList.add('hidden');
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    
    // Add event listener for CPA membership radio buttons
    const cpaMemberRadios = document.querySelectorAll('input[name="cpa_member"]');
    cpaMemberRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            handleCPAMembershipResponse(e.target.value);
            formData.cpa_member = e.target.value;
            saveToLocalStorage(formData);
        });
    });

    // Navigation event listeners
    document.getElementById('nextToStep2')?.addEventListener('click', () => {
        showStep(2);
    });
    
    document.getElementById('nextToStep3')?.addEventListener('click', () => {
        if (validateCurrentStep(2)) {
            saveCurrentStepData(2);
            showStep(3);
        }
    });
    document.getElementById('nextToStep4')?.addEventListener('click', () => {
        if (validateCurrentStep(3)) {
            saveCurrentStepData(3);
            showStep(4);
        }
    });
    

    //Back button
    document.getElementById('backToStep1')?.addEventListener('click', () => showStep(1));
    document.getElementById('backToStep2')?.addEventListener('click', () => showStep(2));
    document.getElementById('backToStep3')?.addEventListener('click', () => showStep(3));
    document.getElementById('backToStep4')?.addEventListener('click', () => showStep(4));

    // Handle other form changes
    form.addEventListener('change', (e) => {
        if (e.target.name !== 'cpa_member') {
            formData[e.target.name] = e.target.value;
            saveToLocalStorage(formData);
        }
    });

    // Restore form data if it exists
    if (formData.cpa_member) {
        const radio = form.querySelector(`input[name="cpa_member"][value="${formData.cpa_member}"]`);
        if (radio) {
            radio.checked = true;
            handleCPAMembershipResponse(formData.cpa_member);
        }
    }

    // Load data for the current step on page load
    loadCurrentStepData(2);

    toggleButtons();
});

// Add submit button after the last part
const submitButtonHtml = `
    <button type="button" 
            id="submitButton" 
            class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            style="display: none;">
        Submit Assessment
    </button>
`;

// Insert submit button after the navigation buttons
document.querySelector('.flex.justify-between.mt-4')?.insertAdjacentHTML('afterend', submitButtonHtml);

function submitAssessment() {
    saveCurrentStepPartData(7);
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    const assessmentData = {
        personal_info: {},
        career_satisfaction: {},
        emotional_intelligence: {}
    };

    // Collect all sections data
    assessmentData.personal_info = {
        cpa_member: document.querySelector('input[name="cpa_member"]:checked')?.value || null,
        gender: document.querySelector('input[name="gender"]:checked')?.value || null,
        legacy_designation: document.querySelector('input[name="legacy_designation"]:checked')?.value || null,
        industry_type: document.querySelector('input[name="industry_type"]:checked')?.value || null,
        current_position: document.querySelector('input[name="current_position"]:checked')?.value || null,
        work_nature: document.querySelector('input[name="work_nature"]:checked')?.value || null,
        job_title: document.querySelector('input[name="job_title"]:checked')?.value || null,

        birth_year: document.querySelector('input[name="birth_year"]')?.value || null,
        staff_number: document.querySelector('input[name="staff_number"]')?.value || null,
        oversee_number: document.querySelector('input[name="oversee_number"]')?.value || null,
        primary_cpa_body: document.querySelector('input[name="primary_cpa_body"]')?.value || null,
        yearly_compensation: document.querySelector('input[name="yearly_compensation"]')?.value || null,
    };

    // Collect Career Satisfaction
    document.querySelectorAll('[name^="career_"]').forEach(question => {
        if (question.checked) {
            assessmentData.career_satisfaction[question.name] = parseInt(question.value);
        }
    });

    // Collect Emotional Intelligence
    for (let i = 1; i <= 70; i++) {
        const questionName = document.querySelector(`input[name$="_${i}"]:checked`)?.name;
        if (questionName) {
            const value = document.querySelector(`input[name$="_${i}"]:checked`).value;
            assessmentData.emotional_intelligence[questionName] = parseInt(value);
        }
    }


    console.log(assessmentData);

    if (validateAssessment()) {
        const jsonData = JSON.stringify(assessmentData, null, 2);
        
        fetch('/api/submit-assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Assessment submitted successfully!');
            localStorage.removeItem('surveyFormData'); // Clear stored form data
            form.reset();
            showStep(1);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error submitting assessment. Please try again.');
        });
    }
}

function validateAssessment() {
    return true;
    // Validation logic for all sections
    const personalInfoFields = ['cpa_member', 'birth_year', 'gender', 'education', 'experience', 'industry'];
    for (const field of personalInfoFields) {
        if (!document.querySelector(`input[name="${field}"]:checked`) && 
            !document.getElementById(field)?.value) {
            alert('Please complete all personal information fields');
            return false;
        }
    }

    // Validate all sections
    const sections = {
        'career satisfaction': '[name^="career_satisfaction_"]',
        'work preferences': '[name^="work_preference_"]',
        'emotional intelligence': 'input[name$="_70"]'
    };

    for (const [section, selector] of Object.entries(sections)) {
        const questions = document.querySelectorAll(selector);
        if (!questions.length || Array.from(questions).some(q => !q.checked)) {
            alert(`Please complete all ${section} questions`);
            return false;
        }
    }

    return true;
}

function validateCurrentStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const requiredInputs = step.querySelectorAll('input[required]');
    let allFilled = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const name = input.name;
            const group = step.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(group).some(radio => radio.checked);
            if (!isChecked) {
                allFilled = false;
            }
        } else if (!input.value) {
            allFilled = false;
        }
    });

    if (!allFilled) {
        alert('Please answer all required questions before continuing.');
    }

    return allFilled;
}

function saveCurrentStepPartData(partNumber) {
    const part = document.getElementById(`part${partNumber}`);
    const inputs = part.querySelectorAll('input, select, textarea');
    const partData = {};

    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                partData[input.name] = input.value;
            }
        } else {
            partData[input.name] = input.value;
        }
    });

    // Add user agent and unique identifier
    partData.userAgent = navigator.userAgent;
    partData.uniqueId = `user_${Date.now()}`;

    // Save to localStorage
    localStorage.setItem(`part${partNumber}Data`, JSON.stringify(partData));
}

function saveCurrentStepData(stepNumber) {
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

    // Add user agent and unique identifier
    stepData.userAgent = navigator.userAgent;
    stepData.uniqueId = `user_${Date.now()}`;

    // Save to localStorage
    localStorage.setItem(`step${stepNumber}Data`, JSON.stringify(stepData));
}

function loadCurrentStepData(stepNumber) {
    const savedData = JSON.parse(localStorage.getItem(`step${stepNumber}Data`));
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

function toggleButtons() {
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');

    if (currentPart === totalParts) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
    }
}

showPart(currentPart);
document.getElementById('submitButton')?.addEventListener('click', submitAssessment);