class GrowthAlgorithms {
    static calculateFlatGrowth(level, baseExp, weight) {
        if (level === 1) {
            return baseExp;
        }
        return Math.floor(baseExp * weight * level);
    }

    static calculateQuadraticGrowth(level, baseExp, weight) {
        if (level === 1) {
            return baseExp;
        }
        return Math.floor(baseExp * weight * level * level);
    }

    static calculateExponentialGrowth(level, baseExp, weight) {
        if (level === 1) {
            return baseExp;
        }
        return Math.floor(baseExp * weight * Math.pow(1.5, level - 1));
    }

    static calculateBreakpointGrowth(level, baseExp, weight, breakpoints) {
        if (level === 1) {
            return baseExp;
        }

        if (!breakpoints || breakpoints.length === 0) {
            return this.calculateQuadraticGrowth(level, baseExp, weight);
        }

        let effectiveMultiplier = 1.0;
        for (const breakpoint of breakpoints) {
            if (level >= breakpoint.level) {
                effectiveMultiplier = breakpoint.expPerLevel;
            } else {
                break;
            }
        }
        
        return Math.floor(baseExp * weight * effectiveMultiplier * level * level);
    }

    static getAlgorithmName(algorithm) {
        const names = {
            flat: 'Flat Growth',
            quadratic: 'Quadratic Growth',
            exponential: 'Exponential Growth',
            breakpoint: 'Breakpoint Growth'
        };
        return names[algorithm] || 'Unknown';
    }

    static calculateTotalExpForLevel(level, algorithm, baseExp, weight, breakpoints = []) {
        let totalExp = 0;
        for (let i = 1; i <= level; i++) {
            totalExp += this.calculateExpForLevel(i, algorithm, baseExp, weight, breakpoints);
        }
        return totalExp;
    }

    static calculateExpForLevel(level, algorithm, baseExp, weight, breakpoints = []) {
        switch (algorithm) {
            case 'flat':
                return this.calculateFlatGrowth(level, baseExp, weight);
            case 'quadratic':
                return this.calculateQuadraticGrowth(level, baseExp, weight);
            case 'exponential':
                return this.calculateExponentialGrowth(level, baseExp, weight);
            case 'breakpoint':
                return this.calculateBreakpointGrowth(level, baseExp, weight, breakpoints);
            default:
                return this.calculateFlatGrowth(level, baseExp, weight);
        }
    }

    static generateLevelData(maxLevels, algorithm, baseExp, weight, breakpoints = []) {
        const data = [];
        for (let level = 1; level <= maxLevels; level++) {
            const expRequired = this.calculateExpForLevel(level, algorithm, baseExp, weight, breakpoints);
            const totalExpAccumulated = this.calculateTotalExpForLevel(level, algorithm, baseExp, weight, breakpoints);
            
            data.push({
                level,
                expRequired,
                totalExpAccumulated,
                expToNext: level < maxLevels ? this.calculateExpForLevel(level + 1, algorithm, baseExp, weight, breakpoints) : null
            });
        }
        return data;
    }

    static getGrowthCurve(maxLevels, algorithm, baseExp, weight, breakpoints = []) {
        const curve = [];
        for (let level = 1; level <= maxLevels; level++) {
            curve.push({
                x: level,
                y: this.calculateExpForLevel(level, algorithm, baseExp, weight, breakpoints)
            });
        }
        return curve;
    }

    static getTotalExpCurve(maxLevels, algorithm, baseExp, weight, breakpoints = []) {
        const curve = [];
        for (let level = 1; level <= maxLevels; level++) {
            curve.push({
                x: level,
                y: this.calculateTotalExpForLevel(level, algorithm, baseExp, weight, breakpoints)
            });
        }
        return curve;
    }
}
