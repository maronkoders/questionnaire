// Client-side JavaScript code
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const steps = document.querySelectorAll('.step');
    const nextToStep2 = document.getElementById('nextToStep2');
    const nextToStep3 = document.getElementById('nextToStep3');
    const backToStep1 = document.getElementById('backToStep1');
    const backToStep2 = document.getElementById('backToStep2');

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

    // Handle consent radio buttons
    const consentRadios = document.querySelectorAll('input[name="consent"]');
    consentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            nextToStep2.disabled = radio.value !== 'yes';
        });
    });

    // Navigation functions
    function showStep(stepNumber) {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index + 1 !== stepNumber);
            step.classList.toggle('active', index + 1 === stepNumber);
        });
    }

    // Navigation event listeners
    nextToStep2.addEventListener('click', () => showStep(2));
    nextToStep3.addEventListener('click', () => showStep(3));
    backToStep1.addEventListener('click', () => showStep(1));
    backToStep2.addEventListener('click', () => showStep(2));

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Here you would typically send the data to your Supabase backend
            console.log('Form data:', data);
            
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            alert('Thank you for your response!');
            form.reset();
            showStep(1);
            nextToStep2.disabled = true;
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting response. Please try again.');
        }
    });
}); 