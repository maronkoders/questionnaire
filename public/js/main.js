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

    // Scroll to the header container
    const headerContainer = document.querySelector('body.bg-gray-100');
    if (headerContainer) {
        headerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

if (localStorage.getItem('cpaYesRadioDisabled') === true) {
    document.querySelector('input[name="cpa_member"][value="yes"]').disabled = true;
    document.querySelector('input[name="cpa_member"][value="yes"]').checked = false;
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
        
        // Scroll to the header container
        const headerContainer = document.querySelector('body.bg-gray-100');
        if (headerContainer) {
            headerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
    } 

    if(currentPart === 1){
        showStep(3);
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
        if(localStorage.getItem('cpaYesRadioDisabled') !== 'true') {
            nonMemberMessage.classList.remove('hidden');
        }

        localStorage.removeItem('scoring');
        localStorage.removeItem('voucher_code');
       
        nextToStep2.disabled = true;
        const responseData = {
            cpa_member: 'no',
            submitted_at: new Date().toISOString(),
            status: 'non_member'
        };

        // Generate device fingerprint and add it to responseData
        generateDeviceFingerprint().then(fingerprint => {
            responseData.deviceFingerprint = fingerprint;
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
                Toastify({
                    text: "Response submitted successfully!",
                    duration: 3000, 
                    gravity: "top", 
                    position: "center",
                    backgroundColor: "#4BB543",
                    width: 'auto',
                }).showToast();
                setTimeout(() => {
                    nonMemberMessage.classList.add('hidden');
                    setTimeout(() => {
                     window.location.href = '/done';
                    }, 500);
                }, 1000);
            })
            .catch(error => {
                Toastify({
                    text: 'You have already submitted your assessment.',
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "#FF3B30",
                    width: 'auto',
                }).showToast();
            });
        }).catch(error => {
            Toastify({
                text: error.message,
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "#FF3B30",
                width: 'auto',
            }).showToast();
        });
        
        //disable the  yes radio button
        const cpaYesRadio = document.querySelector('input[name="cpa_member"][value="yes"]');
        if (cpaYesRadio) {
            cpaYesRadio.disabled = true;
            localStorage.setItem('cpaYesRadioDisabled', 'true');
            if (localStorage.getItem('cpaYesRadioDisabled') === 'true') {
                cpaYesRadio.disabled = true;
            }
        }
    } else if (value === 'yes') {
        if(localStorage.getItem('cpaYesRadioDisabled') !== 'true'){
            nextToStep2.disabled = false;
            nonMemberMessage.classList.add('hidden');
        }
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const consentDialog = document.getElementById('consentDialog');
    const acceptConsentBtn = document.getElementById('acceptConsent');
    const rejectConsentBtn = document.getElementById('rejectConsent');
    const nextToStep2Btn = document.getElementById('nextToStep2');
    let hasConsented = false;

    // Add event listener for CPA membership radio buttons
    const cpaMemberRadios = document.querySelectorAll('input[name="cpa_member"]');
    cpaMemberRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                consentDialog.classList.remove('hidden');
            } else {
                consentDialog.classList.add('hidden');
                handleCPAMembershipResponse(e.target.value);
            }
        });
    });

    // Redirect to the "done" page when the "I Do Not Agree" button is clicked
    rejectConsentBtn?.addEventListener('click', () => {
        window.location.href = '/done'; // Replace '/done' with the actual URL of your done page
    });

    // Handle consent acceptance
    acceptConsentBtn?.addEventListener('click', () => {
        consentDialog.classList.add('hidden');
        nextToStep2Btn.disabled = false;
        // Additional logic for when consent is accepted
    });

    // Check for existing consent
    if (localStorage.getItem('surveyConsent') === 'true') {
        hasConsented = true;
        const cpaYesRadio = document.querySelector('input[name="cpa_member"][value="yes"]');
        if (cpaYesRadio?.checked) {
            nextToStep2Btn.disabled = false;
        }
    }

    // Navigation event listeners with validation and scrolling
    document.getElementById('nextToStep2')?.addEventListener('click', () => {
        showStep(2);
    });
    
    document.getElementById('nextToStep3')?.addEventListener('click', () => {
        saveCurrentStepData(2);
        showStep(3);
    });

    document.getElementById('nextToStep4')?.addEventListener('click', () => {
        saveCurrentStepData(3);
        showStep(4);
    });

    // Back button handlers
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

async function generateDeviceFingerprint() {
    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        navigator.deviceMemory,
        navigator.platform
    ];

    // Use SubtleCrypto for secure hashing
    const msgBuffer = new TextEncoder().encode(components.join('###'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


function calculateReverseScores() {
    // Array of questions that need reverse scoring
    const reverseQuestions = [
        'criticism_5',
        'motivation_difficulty_9',
        'wrong_people_11',
        'fail_cooperate_12',
        'positive_emotions_16',
        'fail_identify_response_17',
        'inappropriate_behavior_21',
        'ruminate_26',
        'under_stress_impulsive_30',
        'fail_control_temper_35',
        'fail_recognize_emotions_38',
        'fail_recognize_feelings_43',
        'impatient_49',
        'colleagues_upset_55',
        'identify_feelings_57',
        'handle_stress_61',
        'resolve_emotions_64',
        'express_feelings_65',
        'technical_focus_67',
        'keep_calm_68'
    ];

    // Function to get value of a radio button
    function getRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? parseInt(radio.value) : 0;
    }

    // Function to reverse score (1->5, 2->4, 3->3, 4->2, 5->1)
    function reverseScore(value) {
        return value ? (6 - value) : 0;
    }

    // Calculate reversed scores and total
    let totalScore = 0;
    let scores = {};

    reverseQuestions.forEach(questionName => {
        const originalValue = getRadioValue(questionName);
        const reversedValue = reverseScore(originalValue);
        scores[questionName] = reversedValue;
        totalScore += reversedValue;
    });

    return {
        individualScores: scores,
        total: totalScore,
    };
}


function calculateRegularScores() {
    let totalScore = 0;
    
    // Array of questions that need reverse scoring (to exclude them)
    const reverseQuestions = [5, 9, 11, 12, 16, 17, 21, 26, 30, 35, 38, 43, 49, 55, 57, 61, 64, 65, 67, 68];
    
    // Loop through all questions from 1 to 70
    for(let i = 1; i <= 70; i++) {
        // Skip if this question number is in the reverse scoring list
        if (!reverseQuestions.includes(i)) {
            const questionName = document.querySelector(`input[name$="_${i}"]:checked`)?.name;
            if (questionName) {
                const value = document.querySelector(`input[name$="_${i}"]:checked`).value;
                totalScore += parseInt(value);
            }
        }
    }

    return {
        regularScore: totalScore,
    };
}


function submitAssessment() {
    saveCurrentStepPartData(7);
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
   
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);

    const assessmentData = {
        surveryConsent: localStorage.getItem('surveyConsent') === 'true',
        personal_info: {},
        career_satisfaction: {},
        emotional_intelligence: {}
    };

    // Collect all sections data
    assessmentData.personal_info = {
        cpa_member: document.querySelector('input[name="cpa_member"]:checked')?.value || null,
        languages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(lang => lang.value) || [],
        gender: document.querySelector('input[name="gender"]:checked')?.value || null,
        legacy_designation: Array.from(document.querySelectorAll('input[name="legacy_designation"]:checked')).map(legacy => legacy.value) || [],
        industry_type: document.querySelector('input[name="industry_type"]:checked')?.value || null,
        current_position: document.querySelector('input[name="current_position"]:checked')?.value || null,
        work_nature: document.querySelector('input[name="work_nature"]:checked')?.value || null,
        job_title: document.querySelector('input[name="job_title"]:checked')?.value || null,
        years_since_designation: document.querySelector('input[name="years_since_designation"]')?.value || null,
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

    assessmentData.career_satisfaction.career_thoughts = document.querySelector('input[name="career_thoughts"]')?.value || null;

    // Collect Emotional Intelligence
    for (let i = 1; i <= 70; i++) {
        const questionName = document.querySelector(`input[name$="_${i}"]:checked`)?.name;
        if (questionName) {
            const value = document.querySelector(`input[name$="_${i}"]:checked`).value;
            assessmentData.emotional_intelligence[questionName] = parseInt(value);
        }
    }

    assessmentData.scoring = calculateRegularScores().regularScore + calculateReverseScores().total;

    //reverse_scoring

    const generateVoucherCode = () => {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
        const numbers = '123456789'; // Excluding 0 and 1 to avoid confusion
        let code = '';
        
        // Add 3 random letters
        for (let i = 0; i < 3; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        // Add 4 random numbers
        for (let i = 0; i < 4; i++) {
            code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return code;
    };

    //generate a voucher code number add letters too
    const voucherCode = generateVoucherCode();
    assessmentData.voucher_code = voucherCode;

        generateDeviceFingerprint().then(fingerprint => {
            assessmentData.deviceFingerprint = fingerprint;
            
            fetch('/api/submit-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData)
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => Promise.reject(err));
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Assessment';
                return response.json();
            })
            .then(data => {
                localStorage.setItem('scoring', assessmentData.scoring);
                localStorage.setItem('voucher_code', assessmentData.voucher_code);
                localStorage.removeItem('surveyFormData');
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Assessment';
                form.reset();
                window.location.href = '/done';
            })
            .catch((error) => {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Assessment';
                Toastify({
                    text: error.message || 'Error submitting assessment. Please try again.',
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "#FF3B30",
                    width: 'auto',
                }).showToast();

            });
        });
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
        Toastify({
            text: 'Please answer all required questions before continuing.',
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#FF3B30",
            width: 'auto',
        }).showToast();
    }

    return allFilled;
}


function validateCurrentStepPart(stepNumber) {
    const step = document.getElementById(`part${stepNumber}`);
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
        Toastify({
            text: 'Please answer all required questions before continuing.',
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#FF3B30",
            width: 'auto',
        }).showToast();
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

