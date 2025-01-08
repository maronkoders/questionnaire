document.addEventListener('DOMContentLoaded', () => {
    const refreshData = document.getElementById('refreshData');
    const exportCsv = document.getElementById('exportCsv');
    const responsesTableBody = document.getElementById('responsesTableBody');

    // Stats elements
    const totalResponses = document.getElementById('totalResponses');
    const avgCareerSatisfaction = document.getElementById('avgCareerSatisfaction');
    const avgEiScore = document.getElementById('avgEiScore');
    const latestResponse = document.getElementById('latestResponse');

    // Get all responses from localStorage
    function getLocalResponses() {
        const responses = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('survey_response_')) {
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

    // Get responses from server
    async function getServerResponses() {
        try {
            const response = await fetch('/api/responses');
            if (!response.ok) throw new Error('Failed to fetch responses');
            const data = await response.json();
            return data.map(item => ({ ...item, source: 'server' }));
        } catch (error) {
            console.error('Error fetching server responses:', error);
            return [];
        }
    }

    // Combine and sort all responses
    async function getAllResponses() {
        const localResponses = getLocalResponses();
        const serverResponses = await getServerResponses();
        
        const allResponses = [...localResponses, ...serverResponses].sort((a, b) => {
            const dateA = new Date(a.submitted_at || a.created_at);
            const dateB = new Date(b.submitted_at || b.created_at);
            return dateB - dateA;
        });

        return allResponses;
    }

    function calculateAverages(responses) {
        if (!responses.length) return { careerSatisfaction: 0, eiScore: 0 };

        const totals = responses.reduce((acc, r) => {
            const careerSat = parseInt(r.careerSatisfaction) || 0;
            const eiTotal = (
                parseInt(r.selfAwareness) +
                parseInt(r.selfManagement) +
                parseInt(r.socialAwareness) +
                parseInt(r.relationshipManagement)
            ) || 0;

            return {
                careerSatisfaction: acc.careerSatisfaction + careerSat,
                eiScore: acc.eiScore + eiTotal
            };
        }, { careerSatisfaction: 0, eiScore: 0 });

        return {
            careerSatisfaction: (totals.careerSatisfaction / responses.length).toFixed(1),
            eiScore: (totals.eiScore / (responses.length * 4)).toFixed(1)
        };
    }

    function updateStats(responses) {
        const averages = calculateAverages(responses);
        totalResponses.textContent = responses.length;
        avgCareerSatisfaction.textContent = averages.careerSatisfaction;
        avgEiScore.textContent = averages.eiScore;
        
        if (responses.length > 0) {
            const latest = responses[0];
            latestResponse.textContent = new Date(
                latest.submitted_at || latest.created_at
            ).toLocaleDateString();
        }
    }

    function renderResponseRow(response) {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        const date = new Date(response.submitted_at || response.created_at).toLocaleDateString();
        const source = response.source === 'local' ? 
            '<span class="text-orange-600">(Local)</span>' : 
            '<span class="text-green-600">(Server)</span>';

        const demographics = `
            <div class="space-y-1">
                <p><span class="font-medium">Age:</span> ${response.age}</p>
                <p><span class="font-medium">Gender:</span> ${response.gender}</p>
                <p><span class="font-medium">Job:</span> ${response.jobTitle}</p>
                <p><span class="font-medium">Experience:</span> ${response.experience} years</p>
                <p><span class="font-medium">Source:</span> ${source}</p>
            </div>
        `;

        const eiScores = `
            <div class="space-y-1">
                <p><span class="font-medium">Self Awareness:</span> ${response.selfAwareness}/5</p>
                <p><span class="font-medium">Self Management:</span> ${response.selfManagement}/5</p>
                <p><span class="font-medium">Social Awareness:</span> ${response.socialAwareness}/5</p>
                <p><span class="font-medium">Relationship:</span> ${response.relationshipManagement}/5</p>
            </div>
        `;

        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${date}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${demographics}</td>
            <td class="px-6 py-4 text-sm text-gray-900">
                <div class="text-lg font-medium">${response.careerSatisfaction}/5</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${eiScores}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button 
                    class="text-red-600 hover:text-red-900"
                    onclick="deleteResponse('${response.id}', '${response.source}')"
                >
                    Delete
                </button>
            </td>
        `;
        
        return tr;
    }

    async function loadResponses() {
        const responses = await getAllResponses();
        responsesTableBody.innerHTML = '';
        responses.forEach(response => {
            responsesTableBody.appendChild(renderResponseRow(response));
        });
        updateStats(responses);
    }

    function exportToCsv(responses) {
        const headers = [
            'Date', 'Source', 'Age', 'Gender', 'Job Title', 'Experience',
            'Career Satisfaction', 'Self Awareness', 'Self Management',
            'Social Awareness', 'Relationship Management'
        ];

        const csvRows = [headers];

        responses.forEach(r => {
            const row = [
                new Date(r.submitted_at || r.created_at).toLocaleDateString(),
                r.source,
                r.age,
                r.gender,
                r.jobTitle,
                r.experience,
                r.careerSatisfaction,
                r.selfAwareness,
                r.selfManagement,
                r.socialAwareness,
                r.relationshipManagement
            ];
            csvRows.push(row);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'survey-responses.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Event Listeners
    refreshData.addEventListener('click', loadResponses);
    exportCsv.addEventListener('click', async () => {
        const responses = await getAllResponses();
        exportToCsv(responses);
    });

    // Initial load
    loadResponses();
});

// Global function for delete button
window.deleteResponse = async (id, source) => {
    if (!confirm('Are you sure you want to delete this response?')) return;
    
    try {
        if (source === 'local') {
            localStorage.removeItem(id);
        } else {
            const response = await fetch(`/api/responses/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete response');
        }
        
        // Reload the data
        document.getElementById('refreshData').click();
    } catch (error) {
        console.error('Error deleting response:', error);
        alert('Failed to delete response');
    }
}; 