document.addEventListener('DOMContentLoaded', () => {
    const modeTabs = document.querySelectorAll('.mode-tab');
    const inputLabel = document.getElementById('input-label');
    const userInput = document.getElementById('user-input');
    const toneContainer = document.getElementById('tone-container');
    const toneChips = document.querySelectorAll('.chip');
    const btnGenerate = document.getElementById('btn-generate');
    const outputSection = document.getElementById('output-section');
    const outputCard = document.getElementById('output-card');
    const loadingStatus = document.getElementById('loading-status');
    
    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const btnInstall = document.getElementById('btn-install');

    let currentMode = 'reply';
    let selectedTone = 'Lịch sự, chuyên nghiệp';

    // Load saved API Key
    if (localStorage.getItem('gemini_api_key')) {
        apiKeyInput.value = localStorage.getItem('gemini_api_key');
    }

    // Modal Events
    btnSettings.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeModal.addEventListener('click', () => settingsModal.style.display = 'none');
    saveApiKeyBtn.addEventListener('click', () => {
        localStorage.setItem('gemini_api_key', apiKeyInput.value.trim());
        settingsModal.style.display = 'none';
        alert('Đã lưu API Key thành công!');
    });

    // Mode Switching
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.mode;
            
            if (currentMode === 'reply') {
                inputLabel.textContent = 'Nội dung đoạn chat hoặc ý chính cần trả lời:';
                userInput.placeholder = 'Ví dụ: Khách hỏi áo này còn màu đen size L không shop?...';
                toneContainer.style.display = 'flex';
            } else {
                inputLabel.textContent = 'Nhập văn bản cần dịch hoặc chuyển ngữ:';
                userInput.placeholder = 'Ví dụ: Cảm ơn quý khách đã ủng hộ shop, hẹn gặp lại bạn lần sau...';
                toneContainer.style.display = 'none';
            }
        });
    });

    // Tone Selection
    toneChips.forEach(chip => {
        chip.addEventListener('click', () => {
            toneChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedTone = chip.dataset.tone;
        });
    });

    // Generate AI Response
    btnGenerate.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert('Vui lòng bấm vào icon ⚙️ góc trên để nhập Gemini API Key trước!');
            settingsModal.style.display = 'flex';
            return;
        }

        const text = userInput.value.trim();
        if (!text) {
            alert('Vui lòng nhập nội dung cần xử lý!');
            return;
        }

        outputSection.style.display = 'block';
        loadingStatus.style.display = 'inline';
        outputCard.innerHTML = 'Đang kết nối tới AI...';

        let prompt = '';
        if (currentMode === 'reply') {
            prompt = `Bạn là Trợ lý AI thông minh do Hoàng Long phát triển. Hãy viết 3 phương án trả lời tin nhắn khác nhau cho nội dung sau dựa theo tông giọng "${selectedTone}":\n"${text}"\n\nHãy trình bày rõ ràng từng phương án để người dùng dễ dàng copy.`;
        } else {
            prompt = `Bạn là Trợ lý biên dịch chuyên nghiệp do Hoàng Long phát triển. Hãy dịch văn bản sau sang tiếng Anh, tiếng Trung và tiếng Hàn một cách tự nhiên và chuẩn xác nhất:\n"${text}"`;
        }

        try {
            // Sử dụng model gemini-1.5-flash chuẩn ổn định cao
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data && data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                const aiReply = data.candidates[0].content.parts[0].text;
                renderOutput(aiReply);
            } else if (data.error) {
                outputCard.innerHTML = `Lỗi từ Google API: ${data.error.message || 'Không xác định'}`;
            } else {
                outputCard.innerHTML = 'Lỗi phản hồi từ AI. Vui lòng kiểm tra lại API Key hoặc quyền của khóa!';
            }
        } catch (error) {
            outputCard.innerHTML = 'Lỗi kết nối mạng: ' + error.message;
        } finally {
            loadingStatus.style.display = 'none';
        }
    });

    function renderOutput(text) {
        outputCard.innerHTML = '';
        const currentBlock = document.createElement('div');
        currentBlock.className = 'result-item';

        const pre = document.createElement('div');
        pre.textContent = text;
        pre.style.whiteSpace = 'pre-wrap';
        currentBlock.appendChild(pre);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '📋 Chạm để Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text);
            copyBtn.textContent = '✅ Đã Copy!';
            setTimeout(() => copyBtn.textContent = '📋 Chạm để Copy', 2000);
        };
        currentBlock.appendChild(copyBtn);
        outputCard.appendChild(currentBlock);
    }

    // Install prompt handler
    btnInstall.addEventListener('click', () => {
        alert('Để cài ứng dụng ra màn hình chính:\n- Trên iPhone (Safari): Bấm nút Chia sẻ (Share) -> Chọn "Thêm vào màn hình chính" (Add to Home Screen).\n- Trên Android (Chrome): Bấm dấu 3 chấm -> Chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
    });
});
