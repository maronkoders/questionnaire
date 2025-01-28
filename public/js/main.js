// Client-side JavaScript code
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const steps = document.querySelectorAll('.step');
    const nextToStep2 = document.getElementById('nextToStep2');
    const nextToStep3 = document.getElementById('nextToStep3');
    const backToStep1 = document.getElementById('backToStep1');
    const backToStep2 = document.getElementById('backToStep2');
    const nonMemberMessage = document.getElementById('nonMemberMessage');

    // Initialize form data from localStorage or empty object
    let formData = JSON.parse(localStorage.getItem('surveyFormData')) || {};

    // Navigation functions
    function showStep(stepNumber) {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index + 1 !== stepNumber);
            step.classList.toggle('active', index + 1 === stepNumber);
        });
    }

    // Save form data to localStorage
    function saveToLocalStorage(data) {
        localStorage.setItem('surveyFormData', JSON.stringify(data));
    }

    // Handle CPA membership response
    function handleCPAMembershipResponse(value) {
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

            fetch('/api/submit', {
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
                    form.reset();
                    nonMemberMessage.classList.add('hidden');
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

    // Add event listener for CPA membership radio buttons
    const cpaMemberRadios = document.querySelectorAll('input[name="cpa_member"]');
    cpaMemberRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            handleCPAMembershipResponse(e.target.value);
            formData.cpa_member = e.target.value;
            saveToLocalStorage(formData);
        });
    });

    // Restore form data if it exists
    if (formData.cpa_member) {
        const radio = form.querySelector(`input[name="cpa_member"][value="${formData.cpa_member}"]`);
        if (radio) {
            radio.checked = true;
            handleCPAMembershipResponse(formData.cpa_member);
        }
    }

    // Navigation event listeners
    nextToStep2.addEventListener('click', () => showStep(2));
    nextToStep3.addEventListener('click', () => showStep(3));
    nextToStep4.addEventListener('click', () => showStep(4));
    backToStep1.addEventListener('click', () => showStep(1));
    backToStep2.addEventListener('click', () => showStep(2));

    // Handle other form changes
    form.addEventListener('change', (e) => {
        if (e.target.name !== 'cpa_member') { // Skip CPA member handling as it's handled separately
            formData[e.target.name] = e.target.value;
            saveToLocalStorage(formData);
        }
    });

    // EI Categories
    const categories = [
        'Career Satisfaction',
        'Self Awareness',
        'Self Management',
        'Social Awareness',
        'Relationship Management'
    ];

    // Initialize EI Assessment section
    const template = document.getElementById('categoryTemplate');
    const container = template.parentElement;
    
    categories.forEach(category => {
        const clone = template.content.cloneNode(true);
        const categoryItem = clone.querySelector('.category-item');
        const label = clone.querySelector('label');
        const ratingGroup = clone.querySelector('.rating-group');
        
        label.textContent = category;
        const fieldName = category.toLowerCase().replace(' ', '');
        
        // Create rating options
        for (let i = 1; i <= 5; i++) {
            const label = document.createElement('label');
            label.className = 'flex flex-col items-center';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = fieldName;
            input.value = i;
            input.required = true;
            input.className = 'mb-1';
            
            const value = document.createTextNode(i);
            
            label.appendChild(input);
            label.appendChild(value);
            ratingGroup.appendChild(label);
        }
        
        container.appendChild(clone);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Add timestamps
            data.submitted_at = new Date().toISOString();
            data.created_at = data.submitted_at;
            
            // Generate unique ID for localStorage
            const responseId = `survey_response_${Date.now()}`;
            
            // Store in localStorage
            try {
                localStorage.setItem(responseId, JSON.stringify(data));
                console.log('Response saved to localStorage:', responseId);
            } catch (storageError) {
                console.error('Error saving to localStorage:', storageError);
            }

            // Send to server
            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                
                if (!response.ok) {
                    throw new Error('Server response was not ok');
                }
                
                // Clear form data from localStorage
                localStorage.removeItem('surveyFormData');
                
                alert('Thank you for your response!');
                form.reset();
                showStep(1);
                nextToStep2.disabled = true;
                
            } catch (serverError) {
                console.error('Server error:', serverError);
                alert('Server error, but your response has been saved locally. It will sync when connection is restored.');
            }
            
        } catch (error) {
            console.error('Error in form submission:', error);
            alert('Error processing your response. Please try again.');
        }
    });
}); 