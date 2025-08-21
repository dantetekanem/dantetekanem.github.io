class SoftmaxController {
    constructor() {
        this.calculator = new SoftmaxCalculator();
        this.animationFrame = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateInputSliders();
        this.updateDisplay();
        this.animate();
    }

    setupEventListeners() {
        const inputCountSlider = document.getElementById('inputCount');
        inputCountSlider.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            document.getElementById('inputCountValue').textContent = count;
            this.calculator.setInputCount(count);
            this.updateInputSliders();
            this.updateDisplay();
        });

        const randomizeButton = document.getElementById('randomizeSoftmax');
        randomizeButton.addEventListener('click', () => {
            this.randomizeValues();
        });
    }

    updateInputSliders() {
        const container = document.getElementById('inputSliders');
        container.innerHTML = '';
        
        const inputs = this.calculator.getInputs();
        inputs.forEach((value, index) => {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'flex items-center space-x-3';
            
            const label = document.createElement('label');
            label.className = 'text-sm font-medium text-gray-700 w-8';
            label.textContent = `x${index + 1}:`;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '-10';
            slider.max = '10';
            slider.step = '0.1';
            slider.value = value;
            slider.className = 'flex-1';
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'text-sm font-mono bg-gray-100 px-2 py-1 rounded w-16 text-center';
            valueDisplay.textContent = value.toFixed(1);
            
            slider.addEventListener('input', (e) => {
                const newValue = parseFloat(e.target.value);
                valueDisplay.textContent = newValue.toFixed(1);
                inputs[index] = newValue;
                this.calculator.setInputs(inputs);
                this.updateDisplay();
            });
            
            sliderContainer.appendChild(label);
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(valueDisplay);
            container.appendChild(sliderContainer);
        });
    }

    updateDisplay() {
        this.updateRawInputs();
        this.updateSoftmaxResults();
        this.updateProbabilityChart();
        this.updateMathematicalDetails();
    }

    updateRawInputs() {
        const container = document.getElementById('rawInputs');
        const inputs = this.calculator.getInputs();
        container.innerHTML = `[${inputs.map(x => x.toFixed(3)).join(', ')}]`;
    }

    updateSoftmaxResults() {
        const container = document.getElementById('softmaxResults');
        const results = this.calculator.getResults();
        container.innerHTML = '';
        
        results.forEach((prob, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200';
            
            const label = document.createElement('span');
            label.className = 'text-sm font-medium text-gray-700';
            label.textContent = `P(x${index + 1})`;
            
            const probability = document.createElement('span');
            probability.className = 'text-lg font-mono font-bold text-blue-600';
            probability.textContent = prob.toFixed(4);
            
            const bar = document.createElement('div');
            bar.className = 'flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden';
            
            const fill = document.createElement('div');
            fill.className = 'h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300 ease-out';
            fill.style.width = `${prob * 100}%`;
            
            bar.appendChild(fill);
            resultItem.appendChild(label);
            resultItem.appendChild(bar);
            resultItem.appendChild(probability);
            container.appendChild(resultItem);
        });
    }

    updateProbabilityChart() {
        const container = document.getElementById('probabilityChart');
        const results = this.calculator.getResults();
        container.innerHTML = '';
        
        results.forEach((prob, index) => {
            const bar = document.createElement('div');
            bar.className = 'absolute bottom-0 bg-gradient-to-t from-blue-400 to-indigo-500 transition-all duration-500 ease-out';
            bar.style.left = `${(index / results.length) * 100}%`;
            bar.style.width = `${100 / results.length}%`;
            bar.style.height = `${prob * 100}%`;
            
            const label = document.createElement('div');
            label.className = 'absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600';
            label.textContent = `x${index + 1}`;
            
            bar.appendChild(label);
            container.appendChild(bar);
        });
    }

    updateMathematicalDetails() {
        document.getElementById('sumProbabilities').textContent = this.calculator.getSumProbabilities().toFixed(3);
        document.getElementById('maxProbability').textContent = this.calculator.getMaxProbability().toFixed(4);
    }

    randomizeValues() {
        const inputs = this.calculator.getInputs();
        const randomizedInputs = inputs.map(() => {
            return Math.round((Math.random() * 20 - 10) * 10) / 10;
        });
        
        this.calculator.setInputs(randomizedInputs);
        this.updateInputSliders();
        this.updateDisplay();
        
        const button = document.getElementById('randomizeSoftmax');
        button.textContent = '🎲 Randomizing...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = '🎲 Randomize Values';
            button.disabled = false;
        }, 500);
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SoftmaxController();
});
