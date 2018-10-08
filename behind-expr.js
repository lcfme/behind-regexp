class ConcatExpr {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}

class AltExpr {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}

class RepeatExpr {
    constructor(subexpr) {
        this.subexpr = subexpr;
    }
}

class OptionalExpr {
    constructor(subexpr) {
        this.subexpr = subexpr;
    }
}

class MatchExpr {
    constructor(ch) {
        if (typeof ch !== 'string' || ch.length > 1)
            throw new SyntaxError(`argument is expected to be only one char.`);
        this.ch = ch;
    }
}

const apply = (expr, target, i, next) => {
    switch (true) {
        case expr instanceof ConcatExpr:
            return apply(expr.left, target, i, (_target, _i) =>
                apply(expr.right, _target, _i, next)
            );
        case expr instanceof AltExpr:
            return (
                apply(expr.left, target, i, next) ||
                apply(expr.right, target, i, next)
            );
        case expr instanceof RepeatExpr:
            return (
                apply(
                    expr.subexpr,
                    target,
                    i,
                    (_target, _i) =>
                        apply(expr.subexpr, _target, _i, next) ||
                        next(target, _i)
                ) || next(target, i)
            );
        case expr instanceof OptionalExpr:
            return apply(expr.subexpr, target, i, next) || next(target, i);
        case expr instanceof MatchExpr:
            return (
                target[i] !== undefined &&
                target[i] === expr.ch &&
                next(target, i + 1)
            );
        default:
            throw new Error('Invalid call.');
    }
};

const match = (expr, target) =>
    apply(expr, target, 0, (target, i) => target[i] === undefined);
