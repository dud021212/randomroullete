document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('add-item-btn');
    const itemList = document.getElementById('item-list');
    const drawBtn = document.getElementById('draw-btn');
    const drawResult = document.getElementById('draw-result');
    const multiDrawBtn = document.getElementById('multi-draw-btn');
    const multiDrawCount = document.getElementById('multi-draw-count');
    const multiDrawResults = document.getElementById('multi-draw-results');
    const probValidation = document.getElementById('prob-validation');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const drawHistory = document.getElementById('draw-history');

    let history = [];

    // Add new item
    addItemBtn.addEventListener('click', () => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <input type="text" class="item-name" placeholder="항목 이름">
            <input type="number" class="item-prob" placeholder="확률(%)" step="0.000001">
            <button class="remove-btn">-</button>
        `;
        itemList.appendChild(itemDiv);
    });

    // Remove item
    itemList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.parentElement.remove();
        }
    });

    // Validate probabilities
    function validateProbabilities() {
        const probInputs = document.querySelectorAll('.item-prob');
        let total = 0;
        probInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        if (total !== 100) {
            const difference = (total - 100).toFixed(6);
            probValidation.textContent = `확률의 총합이 100%가 아닙니다. ${difference > 0 ? difference + '%' 초과':' ' + Math.abs(difference) + '% 부족'}`;
            return false;
        } else {
            probValidation.textContent = '';
            return true;
        }
    }

    // Draw once
    drawBtn.addEventListener('click', () => {
        if (!validateProbabilities()) return;
        const items = getItems();
        const selected = weightedRandom(items);
        drawResult.textContent = `추첨 결과: ${selected.name}`;
        history.push({ type: 'single', result: selected.name });
    });

    // Multiple draws
    multiDrawBtn.addEventListener('click', () => {
        if (!validateProbabilities()) return;
        const count = parseInt(multiDrawCount.value);
        if (isNaN(count) || count < 1) {
            alert('유효한 숫자를 입력해주세요.');
            return;
        }
        const items = getItems();
        const results = [];
        const summary = {};
        for (let i = 1; i <= count; i++) {
            const selected = weightedRandom(items);
            results.push(`${i}. ${selected.name}`);
            summary[selected.name] = (summary[selected.name] || 0) + 1;
            history.push({ type: 'multiple', result: selected.name });
        }
        multiDrawResults.innerHTML = `<h3>연속추첨 결과:</h3><ul>${results.map(r => `<li>${r}</li>`).join('')}</ul>`;
        // Display summary
        let summaryHtml = '<h3>요약:</h3><ul>';
        for (const [key, value] of Object.entries(summary)) {
            summaryHtml += `<li>${key}: ${value}회</li>`;
        }
        summaryHtml += '</ul>';
        multiDrawResults.innerHTML += summaryHtml;

        if (history.length > 30) {
            viewHistoryBtn.style.display = 'block';
        }
    });

    // View history
    viewHistoryBtn.addEventListener('click', () => {
        drawHistory.innerHTML = '<h3>추첨 내역:</h3><ul>' + history.map((h, idx) => `<li>${idx + 1}. ${h.result}</li>`).join('') + '</ul>';
        drawHistory.style.display = 'block';
    });

    // Get items from the list
    function getItems() {
        const items = [];
        const itemElements = document.querySelectorAll('.item');
        itemElements.forEach(item => {
            const name = item.querySelector('.item-name').value.trim();
            const prob = parseFloat(item.querySelector('.item-prob').value) || 0;
            if (name) {
                items.push({ name, prob });
            }
        });
        return items;
    }

    // Weighted random selection
    function weightedRandom(items) {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const item of items) {
            cumulative += item.prob;
            if (rand < cumulative) {
                return item;
            }
        }
        return items[items.length - 1]; // Fallback
    }

    // Real-time validation
    itemList.addEventListener('input', validateProbabilities);
});
