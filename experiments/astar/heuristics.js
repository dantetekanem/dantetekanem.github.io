class Heuristics {
    static manhattan(start, end) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }

    static euclidean(start, end) {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static octile(start, end) {
        const dx = Math.abs(start.x - end.x);
        const dy = Math.abs(start.y - end.y);
        return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
    }

    static chebyshev(start, end) {
        return Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y));
    }

    static diagonal(start, end) {
        const dx = Math.abs(start.x - end.x);
        const dy = Math.abs(start.y - end.y);
        return Math.max(dx, dy);
    }

    static getHeuristic(name) {
        switch (name) {
            case 'manhattan':
                return this.manhattan;
            case 'euclidean':
                return this.euclidean;
            case 'octile':
                return this.octile;
            case 'chebyshev':
                return this.chebyshev;
            case 'diagonal':
                return this.diagonal;
            default:
                return this.manhattan;
        }
    }

    static getHeuristicName(name) {
        switch (name) {
            case 'manhattan':
                return 'Manhattan';
            case 'euclidean':
                return 'Euclidean';
            case 'octile':
                return 'Octile';
            case 'chebyshev':
                return 'Chebyshev';
            case 'diagonal':
                return 'Diagonal';
            default:
                return 'Manhattan';
        }
    }
}
