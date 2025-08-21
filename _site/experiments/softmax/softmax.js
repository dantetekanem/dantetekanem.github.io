class SoftmaxCalculator {
    constructor() {
        this.inputs = [0, 0, 0];
        this.results = [];
        this.maxInput = 10;
        this.minInput = -10;
    }

    setInputs(inputs) {
        this.inputs = inputs.map(val => Math.max(this.minInput, Math.min(this.maxInput, val)));
        this.compute();
    }

    compute() {
        const maxInput = Math.max(...this.inputs);
        const shiftedInputs = this.inputs.map(x => x - maxInput);
        const expInputs = shiftedInputs.map(x => Math.exp(x));
        const sumExp = expInputs.reduce((sum, val) => sum + val, 0);
        
        this.results = expInputs.map(exp => exp / sumExp);
        return this.results;
    }

    getResults() {
        return this.results;
    }

    getSumProbabilities() {
        return this.results.reduce((sum, prob) => sum + prob, 0);
    }

    getMaxProbability() {
        return Math.max(...this.results);
    }

    getInputs() {
        return this.inputs;
    }

    addInput() {
        if (this.inputs.length < 8) {
            this.inputs.push(0);
            this.compute();
        }
    }

    removeInput() {
        if (this.inputs.length > 2) {
            this.inputs.pop();
            this.compute();
        }
    }

    setInputCount(count) {
        const currentCount = this.inputs.length;
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                this.inputs.push(0);
            }
        } else if (count < currentCount) {
            this.inputs = this.inputs.slice(0, count);
        }
        this.compute();
    }
}
