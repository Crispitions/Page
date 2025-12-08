
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('lab-submit');
    const fileInput = document.getElementById('lab-file');
    const promptInput = document.getElementById('lab-prompt');
    const resultsDiv = document.getElementById('lab-results');
    const loadingDiv = document.getElementById('lab-loading');
    const analysisDiv = document.getElementById('lab-analysis');
    const chartsContainer = document.getElementById('lab-charts-container');

    if (!submitBtn) return;

    submitBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        const prompt = promptInput.value;

        if (!file) {
            alert("Por favor selecciona un archivo.");
            return;
        }

        // Show loading
        resultsDiv.style.display = 'block';
        loadingDiv.style.display = 'block';
        document.getElementById('results-separator').style.display = 'none';
        analysisDiv.innerText = '';
        chartsContainer.innerHTML = '';
        const oldTable = document.querySelector('.pixel-table-container');
        if (oldTable) oldTable.remove();
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('request', prompt);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            handleAnalysisResponse(data, analysisDiv, chartsContainer, loadingDiv, submitBtn);

            // Replaced logic:
            /*
            if (data.error) { ... }
            */
        } catch (err) {
            console.error(err);
            analysisDiv.innerText = "Error de conexión con el servidor.";
        } finally {
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Default Dataset Loader
    const loadDefaultBtn = document.getElementById('btn-load-default');
    if (loadDefaultBtn) {
        loadDefaultBtn.addEventListener('click', async () => {
            try {
                // 1. Fetch file
                const response = await fetch('assets/data_streams.csv');
                if (!response.ok) throw new Error("No se pudo cargar el archivo de prueba.");
                const blob = await response.blob();
                const file = new File([blob], "data_streams.csv", { type: "text/csv" });

                // 2. Set Prompt
                promptInput.value = "Analiza los streams totales por artista y la tendencia semanal.";

                // 3. Trigger Analysis
                // We can't programmatically set fileInput.files, so we call the API logic directly passing this file object.
                // Re-using logic requires extracting it or mocking the click with a custom property.
                // Let's call the click handler logic manually:

                // Show loading
                resultsDiv.style.display = 'block';
                loadingDiv.style.display = 'block';
                document.getElementById('results-separator').style.display = 'none';
                analysisDiv.innerText = '';
                chartsContainer.innerHTML = '';
                const oldTable = document.querySelector('.pixel-table-container');
                if (oldTable) oldTable.remove();
                submitBtn.disabled = true;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('request', promptInput.value);

                // API Call
                const apiRes = await fetch('/api/analyze', { method: 'POST', body: formData });
                const data = await apiRes.json();

                handleAnalysisResponse(data, analysisDiv, chartsContainer, loadingDiv, submitBtn);

            } catch (err) {
                alert("Error cargando dataset: " + err.message);
                console.error(err);
            }
        });
    }

    function handleAnalysisResponse(data, analysisDiv, chartsContainer, loadingDiv, submitBtn) {
        if (data.error) {
            analysisDiv.innerText = "Error: " + data.error;
        } else {
            document.getElementById('results-separator').style.display = 'block';
            analysisDiv.innerText = data.analysis;
            if (data.preview && data.preview.length > 0) renderTable(data.preview);
            if (data.charts && data.charts.length > 0) {
                data.charts.forEach((chartSpec, index) => createChart(chartSpec, index));
            } else {
                const noChartMsg = document.createElement('p');
                noChartMsg.innerText = "No se sugirieron gráficos.";
                chartsContainer.appendChild(noChartMsg);
            }
        }
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
    }

    function renderTable(rows) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'pixel-table-container';
        previewContainer.innerHTML = '<h3>VISTA PREVIA DE DATOS (Top 5)</h3>';

        const table = document.createElement('table');
        table.className = 'pixel-table';

        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const keys = Object.keys(rows[0]);
        keys.forEach(k => {
            const th = document.createElement('th');
            th.innerText = k;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        rows.forEach(row => {
            const tr = document.createElement('tr');
            keys.forEach(k => {
                const td = document.createElement('td');
                td.innerText = row[k];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        previewContainer.appendChild(table);

        // Insert before analysis
        const results = document.getElementById('lab-results');
        const analysis = document.getElementById('lab-analysis');
        results.insertBefore(previewContainer, analysis);
    }

    function createChart(spec, index) {
        // Create Card Container
        const card = document.createElement('div');
        card.className = 'pixel-chart-card';

        // Header
        const header = document.createElement('div');
        header.className = 'chart-header';
        header.innerHTML = `<span class="chart-type">[${spec.type.toUpperCase()}]</span> ${spec.title}`;
        card.appendChild(header);

        // Description
        const desc = document.createElement('div');
        desc.className = 'chart-desc';
        desc.innerText = spec.comment;
        card.appendChild(desc);

        // Canvas Container
        const canvasContainer = document.createElement('div');
        canvasContainer.style.position = 'relative';
        canvasContainer.style.height = '300px';
        canvasContainer.style.width = '100%';

        const canvas = document.createElement('canvas');
        canvas.id = `chart-${index}`;
        canvasContainer.appendChild(canvas);
        card.appendChild(canvasContainer);

        chartsContainer.appendChild(card);

        // PREPARE DATA FOR CHART.JS
        let chartData = { labels: [], datasets: [] };

        if (spec.data && spec.data.length > 0) {
            chartData.labels = spec.data.map(d => d.label);
            const values = spec.data.map(d => parseFloat(d.value));

            const safeType = (spec.type || 'bar').toLowerCase();
            const isLine = safeType.includes('line');

            chartData.datasets.push({
                label: spec.y,
                data: values,
                backgroundColor: isLine ? 'rgba(80, 250, 123, 0.2)' : [
                    'rgba(80, 250, 123, 0.8)', // Green
                    'rgba(189, 147, 249, 0.8)', // Purple
                    'rgba(255, 121, 198, 0.8)', // Pink
                    'rgba(139, 233, 253, 0.8)', // Cyan
                    'rgba(241, 250, 140, 0.8)'  // Yellow
                ],
                borderColor: '#50fa7b',
                borderWidth: 2,
                pointBackgroundColor: '#ff79c6',
                pointRadius: isLine ? 4 : 0,
                pointHoverRadius: 6,
                fill: isLine,
                tension: 0.1 // Slight smoothing but keeping it sharp-ish
            });

            // RENDER CHART.JS
            new Chart(canvas, {
                type: isLine ? 'line' : 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleFont: { family: "'Pixelify Sans', monospace" },
                            bodyFont: { family: "'Pixelify Sans', monospace" },
                            borderColor: '#50fa7b',
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        let val = context.parsed.y;
                                        if (val > 1000000) val = (val / 1000000).toFixed(1) + 'M';
                                        else if (val > 1000) val = (val / 1000).toFixed(1) + 'K';
                                        label += val;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#8be9fd',
                                font: { family: "'Pixelify Sans', monospace" },
                                maxRotation: 45,
                                minRotation: 0
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: '#8be9fd',
                                font: { family: "'Pixelify Sans', monospace" },
                                callback: function (value) {
                                    if (value > 1000000) return (value / 1000000).toFixed(0) + 'M';
                                    if (value > 1000) return (value / 1000).toFixed(0) + 'K';
                                    return value;
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            // Fallback if no data
            canvasContainer.innerHTML = '<div class="pixel-placeholder" style="padding:20px; font-size:0.8rem;">No real data points available for plotting.</div>';
        }
    }
});
