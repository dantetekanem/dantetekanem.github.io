class LevelUpController {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(() => {
            this.setupEventListeners();
            this.setupChart();
            this.updateFormulaDisplay('flat');
            this.toggleBreakpointControls('flat');
            this.updateVisualization();
            this.updateLevelTable();
        });
    }

    setupEventListeners() {
        const algorithmSelect = document.getElementById('algorithmSelect');
        const baseExpSlider = document.getElementById('baseExpSlider');
        const baseExpInput = document.getElementById('baseExpInput');
        const weightSlider = document.getElementById('weightSlider');
        const weightInput = document.getElementById('weightInput');
        const maxLevelsSlider = document.getElementById('maxLevelsSlider');
        const maxLevelsInput = document.getElementById('maxLevelsInput');

        algorithmSelect.addEventListener('change', (e) => {
            this.updateFormulaDisplay(e.target.value);
            this.toggleBreakpointControls(e.target.value);
            this.updateVisualization();
            this.updateLevelTable();
        });

        baseExpSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            baseExpInput.value = value;
            this.updateVisualization();
            this.updateLevelTable();
        });

        baseExpInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 10 && value <= 1000) {
                baseExpSlider.value = value;
                this.updateVisualization();
                this.updateLevelTable();
            }
        });

        weightSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            weightInput.value = value.toFixed(2);
            this.updateVisualization();
            this.updateLevelTable();
        });

        weightInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value >= 0.1 && value <= 3.0) {
                weightSlider.value = value;
                this.updateVisualization();
                this.updateLevelTable();
            }
        });



        maxLevelsSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            maxLevelsInput.value = value;
            this.updateVisualization();
            this.updateLevelTable();
        });

        maxLevelsInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 10 && value <= 200) {
                maxLevelsSlider.value = value;
                this.updateVisualization();
                this.updateLevelTable();
            }
        });

        document.getElementById('breakpointLevel1').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });

        document.getElementById('breakpointExp1').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });

        document.getElementById('breakpointLevel2').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });

        document.getElementById('breakpointExp2').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });

        document.getElementById('breakpointLevel3').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });

        document.getElementById('breakpointExp3').addEventListener('input', () => {
            this.updateVisualization();
            this.updateLevelTable();
        });
    }

    setupChart() {
        const container = document.getElementById('growthChart');
        this.chart = new google.visualization.LineChart(container);
    }

    updateFormulaDisplay(algorithm) {
        const formulas = {
            flat: 'Formula: base × weight × level',
            quadratic: 'Formula: base × weight × (2 × level - 1)',
            exponential: 'Formula: base × weight × 1.5^(level-1)',
            breakpoint: 'Formula: base × weight × multiplier × level²'
        };
        document.getElementById('formulaDisplay').textContent = formulas[algorithm] || formulas.flat;
        
        this.updateCodeFormulas(algorithm);
    }

    updateCodeFormulas(algorithm) {
        const jsFormulas = {
            flat: `function calculateExp(level, baseExp, weight) {
    if (level === 1) return baseExp;
    return Math.floor(baseExp * weight * level);
}`,
            quadratic: `function calculateExp(level, baseExp, weight) {
    if (level === 1) return baseExp;
    return Math.floor(baseExp * weight * (2 * level - 1));
}`,
            exponential: `function calculateExp(level, baseExp, weight) {
    if (level === 1) return baseExp;
    return Math.floor(baseExp * weight * Math.pow(1.5, level - 1));
}`,
            breakpoint: `function calculateExp(level, baseExp, weight, breakpoints) {
    if (level === 1) return baseExp;
    
    let effectiveMultiplier = 1.0;
    for (const breakpoint of breakpoints) {
        if (level >= breakpoint.level) {
            effectiveMultiplier = breakpoint.expPerLevel;
        } else {
            break;
        }
    }
    return Math.floor(baseExp * weight * effectiveMultiplier * level * level);
}`
        };

        const rubyFormulas = {
            flat: `def calculate_exp(level, base_exp, weight)
    return base_exp if level == 1
    (base_exp * weight * level).floor
end`,
            quadratic: `def calculate_exp(level, base_exp, weight)
    return base_exp if level == 1
    (base_exp * weight * (2 * level - 1)).floor
end`,
            exponential: `def calculate_exp(level, base_exp, weight)
    return base_exp if level == 1
    (base_exp * weight * 1.5 ** (level - 1)).floor
end`,
            breakpoint: `def calculate_exp(level, base_exp, weight, breakpoints)
    return base_exp if level == 1
    
    effective_multiplier = 1.0
    breakpoints.each do |breakpoint|
        if level >= breakpoint[:level]
            effective_multiplier = breakpoint[:exp_per_level]
        else
            break
        end
    end
    (base_exp * weight * effective_multiplier * level ** 2).floor
end`
        };

        document.getElementById('javascriptFormula').innerHTML = jsFormulas[algorithm] || jsFormulas.flat;
        document.getElementById('rubyFormula').innerHTML = rubyFormulas[algorithm] || rubyFormulas.flat;
    }

    updateVisualization() {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }

        const algorithm = document.getElementById('algorithmSelect').value;
        const baseExp = parseInt(document.getElementById('baseExpInput').value);
        const weight = parseFloat(document.getElementById('weightInput').value);
        const maxLevels = parseInt(document.getElementById('maxLevelsInput').value);

        console.log('Updating visualization with:', { algorithm, baseExp, weight, maxLevels });

        const breakpoints = this.getBreakpoints();
        const growthCurve = GrowthAlgorithms.getGrowthCurve(maxLevels, algorithm, baseExp, weight, breakpoints);
        const totalExpCurve = GrowthAlgorithms.getTotalExpCurve(maxLevels, algorithm, baseExp, weight, breakpoints);

        const data = new google.visualization.DataTable();
        data.addColumn({ type: 'number', label: 'Level' });
        data.addColumn({ type: 'number', label: 'Level Experience' });
        data.addColumn({ type: 'number', label: 'Total Experience' });

        for (let i = 0; i < growthCurve.length; i++) {
            data.addRow([
                growthCurve[i].x,
                growthCurve[i].y,
                totalExpCurve[i].y
            ]);
        }

        const options = {
            title: 'Growth Visualization',
            height: 500,
            width: '100%',
            chartArea: {
                width: '80%',
                height: '70%'
            },
            hAxis: {
                title: 'Level',
                minValue: 1,
                maxValue: maxLevels,
                gridlines: {
                    count: 10
                }
            },
            vAxis: {
                title: 'Experience Required',
                minValue: 0,
                format: 'short'
            },
            legend: {
                position: 'top'
            },
            series: {
                0: { color: '#3B82F6' },
                1: { color: '#10B981' }
            },
            pointSize: 0,
            lineWidth: 2
        };

        this.chart.draw(data, options);
    }

    updateLevelTable() {
        const algorithm = document.getElementById('algorithmSelect').value;
        const baseExp = parseInt(document.getElementById('baseExpInput').value);
        const weight = parseFloat(document.getElementById('weightInput').value);
        const maxLevels = parseInt(document.getElementById('maxLevelsInput').value);

        const breakpoints = this.getBreakpoints();
        const levelData = GrowthAlgorithms.generateLevelData(maxLevels, algorithm, baseExp, weight, breakpoints);
        const container = document.getElementById('levelTableBody');
        container.innerHTML = '';

        const rowsPerColumn = Math.ceil(maxLevels / 2);
        
        for (let row = 0; row < rowsPerColumn; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < 2; col++) {
                const levelIndex = row + (col * rowsPerColumn);
                const data = levelData[levelIndex];
                
                if (data) {
                    tr.innerHTML += `
                        <td class="px-3 py-2 text-gray-900">${data.level}</td>
                        <td class="px-3 py-2 text-gray-600">${data.expRequired.toLocaleString()}</td>
                        <td class="px-3 py-2 text-gray-600">${data.totalExpAccumulated.toLocaleString()}</td>
                    `;
                } else {
                    tr.innerHTML += '<td class="px-3 py-2"></td><td class="px-3 py-2"></td><td class="px-3 py-2"></td>';
                }
            }
            container.appendChild(tr);
        }
    }

    toggleBreakpointControls(algorithm) {
        const breakpointControls = document.getElementById('breakpointControls');
        if (algorithm === 'breakpoint') {
            breakpointControls.classList.remove('hidden');
        } else {
            breakpointControls.classList.add('hidden');
        }
    }

    getBreakpoints() {
        const breakpoints = [];
        
        const level1 = parseInt(document.getElementById('breakpointLevel1').value);
        const exp1 = parseFloat(document.getElementById('breakpointExp1').value);
        if (level1 && exp1) {
            breakpoints.push({ level: level1, expPerLevel: exp1 });
        }
        
        const level2 = parseInt(document.getElementById('breakpointLevel2').value);
        const exp2 = parseFloat(document.getElementById('breakpointExp2').value);
        if (level2 && exp2) {
            breakpoints.push({ level: level2, expPerLevel: exp2 });
        }
        
        const level3 = parseInt(document.getElementById('breakpointLevel3').value);
        const exp3 = parseFloat(document.getElementById('breakpointExp3').value);
        if (level3 && exp3) {
            breakpoints.push({ level: level3, expPerLevel: exp3 });
        }
        
        return breakpoints.sort((a, b) => a.level - b.level);
    }
}
